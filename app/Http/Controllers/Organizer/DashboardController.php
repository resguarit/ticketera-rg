<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Services\RevenueService;
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
                $query->where('start_time', '>=', Carbon::now());
            })->count();

        $totalEventsCount = $organizer->events()->count();

        // --- Eventos Recientes (últimos 5) ---
        $recentEvents = $organizer->events()
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
                        $totalEntradas += $quantity; // CORREGIDO: Total de entradas disponibles (lotes + individuales)
                        
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
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'image_url' => $event->image_url,
                    'date' => $event->functions->first()?->start_time->format('d M Y'),
                    'entradas_vendidas' => $entradasVendidas,   // CORREGIDO: Para la barra de progreso
                    'total_entradas' => $totalEntradas,         // NUEVO: Total de entradas para progreso
                    'tickets_sold' => $ticketsEmitidos,         // CORREGIDO: tickets emitidos (para compatibilidad)
                    'total_tickets' => $totalTickets,           // CORREGIDO: total de tickets físicos
                ];
            });

        // --- Eventos con mejor rendimiento (por ingresos) ---
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
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'revenue' => $this->revenueService->forEvent($event),
                    'tickets_sold' => $ticketsEmitidos, // CORREGIDO: tickets emitidos
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
                'totalEntradasVendidas' => $totalEntradasVendidas, // NUEVO: entradas vendidas
                'totalTicketsSold' => $totalTicketsEmitidos, // CORREGIDO: tickets emitidos
                'activeEventsCount' => $activeEventsCount,
                'totalEventsCount' => $totalEventsCount,
            ],
            'recentEvents' => $recentEvents,
            'topEvents' => $topEvents,
            'revenueChartData' => $revenueChartData,
        ]);
    }
}
