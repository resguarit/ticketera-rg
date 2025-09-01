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
        $totalTicketsSold = $this->revenueService->ticketsSoldByOrganizer($organizer);
        
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
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'image_url' => $event->image_url,
                    'date' => $event->functions->first()?->start_time->format('d M Y'),
                    'tickets_sold' => $this->revenueService->ticketsSoldByEvent($event),
                    'total_tickets' => $event->functions->sum(fn($f) => $f->ticketTypes->sum('quantity')),
                ];
            });

        // --- Eventos con mejor rendimiento (por ingresos) ---
        $topEvents = $organizer->events
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'revenue' => $this->revenueService->forEvent($event),
                    'tickets_sold' => $this->revenueService->ticketsSoldByEvent($event),
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
                'totalTicketsSold' => $totalTicketsSold,
                'activeEventsCount' => $activeEventsCount,
                'totalEventsCount' => $totalEventsCount,
            ],
            'recentEvents' => $recentEvents,
            'topEvents' => $topEvents,
            'revenueChartData' => $revenueChartData,
        ]);
    }
}
