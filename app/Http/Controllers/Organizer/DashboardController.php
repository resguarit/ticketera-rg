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

        // --- Estadísticas Generales ---
        $totalRevenue = $this->revenueService->forOrganizer($organizer);
        
        // CORREGIDO: Calcular entradas vendidas y tickets emitidos por separado
        $totalEntradasVendidas = 0; // lotes + entradas individuales (sin multiplicar)
        $totalTicketsEmitidos = 0;  // tickets físicos reales emitidos
        
        foreach ($organizer->events as $event) {
            foreach ($event->functions as $function) {
                foreach ($function->ticketTypes as $ticketType) {
                    $vendidos = (int) $ticketType->quantity_sold;
                    
                    // Entradas vendidas: contar lotes y entradas individuales por igual
                    $totalEntradasVendidas += $vendidos;
                    
                    // Tickets emitidos: multiplicar por bundle_quantity si es bundle
                    if ($ticketType->is_bundle) {
                        $totalTicketsEmitidos += $vendidos * ($ticketType->bundle_quantity ?? 1);
                    } else {
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
            ->map(function($event) {
                // CORREGIDO: Calcular entradas vendidas y tickets emitidos por evento
                $entradasVendidas = 0;   // Para la barra de progreso
                $ticketsEmitidos = 0;    // Para mostrar información adicional
                $totalEntradas = 0;      // Para la barra de progreso (total de lotes + individuales)
                $totalTickets = 0;       // Total de tickets físicos disponibles
                
                foreach ($event->functions as $function) {
                    foreach ($function->ticketTypes as $ticketType) {
                        $vendidos = (int) $ticketType->quantity_sold;
                        $quantity = (int) $ticketType->quantity;
                        
                        // Entradas vendidas: lotes + individuales (para progreso)
                        $entradasVendidas += $vendidos;
                        $totalEntradas += $quantity;
                        
                        // Tickets emitidos: considerar bundle_quantity (para info adicional)
                        if ($ticketType->is_bundle) {
                            $bundleQuantity = $ticketType->bundle_quantity ?? 1;
                            $ticketsEmitidos += $vendidos * $bundleQuantity;
                            $totalTickets += $quantity * $bundleQuantity;
                        } else {
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
            ->map(function($event) {
                // CORREGIDO: Usar el cálculo correcto para tickets
                $ticketsEmitidos = 0;
                foreach ($event->functions as $function) {
                    foreach ($function->ticketTypes as $ticketType) {
                        $vendidos = (int) $ticketType->quantity_sold;
                        if ($ticketType->is_bundle) {
                            $ticketsEmitidos += $vendidos * ($ticketType->bundle_quantity ?? 1);
                        } else {
                            $ticketsEmitidos += $vendidos;
                        }
                    }
                }

                // Determinar estado del evento
                $statusInfo = $this->determineEventStatus($event);
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'revenue' => $this->revenueService->forEvent($event),
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
            
        // --- Datos para gráfico de ingresos (últimos 30 días) ---
        $revenueChartData = $this->revenueService->getOrganizerRevenueOverTime($organizer, 30);

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
        ]);
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
