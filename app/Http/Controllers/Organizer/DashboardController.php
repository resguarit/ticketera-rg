<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Services\RevenueService;
use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct(private RevenueService $revenueService)
    {
    }

    public function __invoke(Request $request): Response
    {
        $organizer = Auth::user()->organizer;
        $organizer->load(['events.functions.ticketTypes', 'events.venue', 'events.category']);

        // Obtener período del request, por defecto último año
        $period = $request->input('period', 'year');
        $dates = $this->getPeriodDates($period);

        // --- Estadísticas Generales (con filtro de período) ---
        $totalRevenue = $this->revenueService->forOrganizer($organizer, $dates['start'], $dates['end']);
        
        // CORREGIDO: Calcular entradas vendidas y tickets emitidos por separado
        $totalEntradasVendidas = 0; // lotes + entradas individuales (sin multiplicar)
        $totalTicketsEmitidos = 0;  // tickets físicos reales emitidos
        
        foreach ($organizer->events as $event) {
            foreach ($event->functions as $function) {
                foreach ($function->ticketTypes as $ticketType) {
                    // Obtener cantidad vendida en el período
                    $vendidos = $ticketType->issuedTickets()
                        ->whereHas('order', function($q) use ($dates) {
                            $q->where('status', \App\Enums\OrderStatus::PAID)
                              ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                        })
                        ->count();
                    
                    if ($ticketType->is_bundle) {
                        // Para bundles: contar órdenes únicas (lotes vendidos)
                        $lotesVendidos = $ticketType->issuedTickets()
                            ->whereHas('order', function($q) use ($dates) {
                                $q->where('status', \App\Enums\OrderStatus::PAID)
                                  ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                            })
                            ->distinct('order_id')
                            ->count('order_id');
                        
                        // Entradas vendidas: contar solo los lotes
                        $totalEntradasVendidas += $lotesVendidos;
                        
                        // Tickets emitidos: multiplicar lotes por bundle_quantity
                        $totalTicketsEmitidos += $lotesVendidos * ($ticketType->bundle_quantity ?? 1);
                    } else {
                        // Para individuales: contar tickets normalmente
                        $totalEntradasVendidas += $vendidos;
                        $totalTicketsEmitidos += $vendidos;
                    }
                }
            }
        }
        
        $activeEventsCount = $organizer->events()
            ->whereHas('functions', function ($query) {
                $query->where('start_time', '>=', Carbon::now())
                      ->where('is_active', true);
            })->count();

        $totalEventsCount = $organizer->events()->count();

        // --- Eventos Recientes (últimos 5) con estado ---
        $recentEvents = $organizer->events()
            ->with(['functions'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($event) use ($dates) {
                // CORREGIDO: Calcular entradas vendidas y tickets emitidos por evento
                $entradasVendidas = 0;   // Para la barra de progreso
                $ticketsEmitidos = 0;    // Para mostrar información adicional
                $totalEntradas = 0;      // Para la barra de progreso (total de lotes + individuales)
                $totalTickets = 0;       // Total de tickets físicos disponibles
                
                foreach ($event->functions as $function) {
                    foreach ($function->ticketTypes as $ticketType) {
                        $quantity = (int) $ticketType->quantity;
                        
                        if ($ticketType->is_bundle) {
                            // Para bundles: contar órdenes únicas
                            $lotesVendidos = $ticketType->issuedTickets()
                                ->whereHas('order', function($q) use ($dates) {
                                    $q->where('status', \App\Enums\OrderStatus::PAID)
                                      ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                                })
                                ->distinct('order_id')
                                ->count('order_id');
                            
                            $bundleQuantity = $ticketType->bundle_quantity ?? 1;
                            
                            // Entradas: solo lotes
                            $entradasVendidas += $lotesVendidos;
                            $totalEntradas += $quantity;
                            
                            // Tickets: lotes × bundle_quantity
                            $ticketsEmitidos += $lotesVendidos * $bundleQuantity;
                            $totalTickets += $quantity * $bundleQuantity;
                        } else {
                            // Para individuales
                            $vendidos = $ticketType->issuedTickets()
                                ->whereHas('order', function($q) use ($dates) {
                                    $q->where('status', \App\Enums\OrderStatus::PAID)
                                      ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                                })
                                ->count();
                            
                            $entradasVendidas += $vendidos;
                            $totalEntradas += $quantity;
                            $ticketsEmitidos += $vendidos;
                            $totalTickets += $quantity;
                        }
                    }
                }

                // Determinar estado del evento
                $statusInfo = $this->determineEventStatus($event);
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'image_url' => $event->image_url,
                    'date' => $event->functions->first()?->start_time->format('d M Y'),
                    'entradas_vendidas' => $entradasVendidas,
                    'total_entradas' => $totalEntradas,
                    'tickets_sold' => $ticketsEmitidos,
                    'total_tickets' => $totalTickets,
                    'status' => $statusInfo['value'],
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'is_active' => $statusInfo['is_active'],
                ];
            });

        // --- Eventos con mejor rendimiento (por ingresos) con estado ---
        $topEvents = $organizer->events
            ->map(function($event) use ($dates) {
                // CORREGIDO: Usar el cálculo correcto para tickets
                $ticketsEmitidos = 0;
                foreach ($event->functions as $function) {
                    foreach ($function->ticketTypes as $ticketType) {
                        if ($ticketType->is_bundle) {
                            // Para bundles: contar órdenes únicas
                            $lotesVendidos = $ticketType->issuedTickets()
                                ->whereHas('order', function($q) use ($dates) {
                                    $q->where('status', \App\Enums\OrderStatus::PAID)
                                      ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                                })
                                ->distinct('order_id')
                                ->count('order_id');
                            
                            $ticketsEmitidos += $lotesVendidos * ($ticketType->bundle_quantity ?? 1);
                        } else {
                            $vendidos = $ticketType->issuedTickets()
                                ->whereHas('order', function($q) use ($dates) {
                                    $q->where('status', \App\Enums\OrderStatus::PAID)
                                      ->whereBetween('order_date', [$dates['start'], $dates['end']]);
                                })
                                ->count();
                            
                            $ticketsEmitidos += $vendidos;
                        }
                    }
                }

                // Determinar estado del evento
                $statusInfo = $this->determineEventStatus($event);
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'revenue' => $this->revenueService->forEvent($event, $dates['start'], $dates['end']),
                    'tickets_sold' => $ticketsEmitidos,
                    'status' => $statusInfo['value'],
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'is_active' => $statusInfo['is_active'],
                ];
            })
            ->sortByDesc('revenue')
            ->take(5)
            ->values();
            
        // --- Datos para gráfico de ingresos ---
        $chartDays = $this->getChartDays($period);
        $revenueChartData = $this->revenueService->getOrganizerRevenueOverTime($organizer, $chartDays);

        return Inertia::render('organizer/dashboard', [
            'organizer' => $organizer,
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalEntradasVendidas' => $totalEntradasVendidas,
                'totalTicketsSold' => $totalTicketsEmitidos,
                'activeEventsCount' => $activeEventsCount,
                'totalEventsCount' => $totalEventsCount,
            ],
            'recentEvents' => $recentEvents,
            'topEvents' => $topEvents,
            'revenueChartData' => $revenueChartData,
            'currentPeriod' => $period,
        ]);
    }
    
    /**
     * Obtiene las fechas de inicio y fin según el período seleccionado
     */
    private function getPeriodDates(string $period): array
    {
        $end = Carbon::now()->endOfDay();
        
        $start = match($period) {
            'today' => Carbon::now()->startOfDay(),
            'week' => Carbon::now()->subWeek()->startOfDay(),
            'month' => Carbon::now()->subMonth()->startOfDay(),
            'quarter' => Carbon::now()->subMonths(3)->startOfDay(),
            'year' => Carbon::now()->subYear()->startOfDay(),
            'three_years' => Carbon::now()->subYears(3)->startOfDay(),
            default => Carbon::now()->subYear()->startOfDay(),
        };
        
        return ['start' => $start, 'end' => $end];
    }
    
    /**
     * Obtiene la cantidad de días a mostrar en el gráfico según el período
     */
    private function getChartDays(string $period): int
    {
        return match($period) {
            'today' => 1,
            'week' => 7,
            'month' => 30,
            'quarter' => 90,
            'year' => 365,
            'three_years' => 1095,
            default => 365,
        };
    }
    
    /**
     * Determina el estado de un evento basado en sus funciones
     */
    private function determineEventStatus($event): array
    {
        if ($event->functions->isEmpty()) {
            return [
                'value' => 'draft',
                'label' => 'Borrador',
                'color' => 'gray',
                'is_active' => false,
            ];
        }

        // Ordenar funciones por prioridad de estado
        $priorityOrder = [
            EventFunctionStatus::ON_SALE->value => 1,
            EventFunctionStatus::UPCOMING->value => 2,
            EventFunctionStatus::REPROGRAMMED->value => 3,
            EventFunctionStatus::CANCELLED->value => 4,
            EventFunctionStatus::SOLD_OUT->value => 5,
            EventFunctionStatus::INACTIVE->value => 6,
            EventFunctionStatus::FINISHED->value => 7,
        ];

        $primaryFunction = $event->functions
            ->filter(fn($f) => $f->is_active)
            ->sortBy(function($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

        if (!$primaryFunction) {
            $primaryFunction = $event->functions
                ->sortBy(function($function) use ($priorityOrder) {
                    return $priorityOrder[$function->status->value] ?? 999;
                })
                ->first();
        }

        $hasAnyActiveFunction = $event->functions->where('is_active', true)->isNotEmpty();

        return [
            'value' => $primaryFunction->status->value,
            'label' => $primaryFunction->status->label(),
            'color' => $primaryFunction->status->color(),
            'is_active' => $hasAnyActiveFunction,
        ];
    }
    
    public function helpGuide(): Response
    {
        return Inertia::render('organizer/help-guide');
    }
}
