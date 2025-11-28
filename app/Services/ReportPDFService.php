<?php

namespace App\Services;

use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\IssuedTicket;
use App\Models\Category;
use App\Models\Organizer;
use App\Enums\UserRole;
use App\Enums\OrderStatus;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportPDFService
{
    public function generateSalesReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        $salesData = $this->getSalesData($startDate);
        $monthlyData = $this->getMonthlyData($startDate);
        $topEvents = $this->getTopEventsByRevenue($startDate, 10);
        
        $data = [
            'title' => 'Reporte de Ventas',
            'period' => $this->getPeriodName($timeRange),
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => Carbon::now()->format('d/m/Y'),
            'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
            'salesData' => $salesData,
            'monthlyData' => $monthlyData,
            'topEvents' => $topEvents,
        ];

        $pdf = Pdf::loadView('pdfs.reports.sales', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions(['defaultFont' => 'DejaVu Sans']);

        return $pdf->download('reporte-ventas-' . date('Y-m-d') . '.pdf');
    }

    public function generateEventsReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        $eventsData = $this->getEventsAnalytics($startDate);
        $categoryStats = $this->getCategoryStats($startDate);
        $venueStats = $this->getVenueStats($startDate);
        $topEvents = $this->getTopEventsByRevenue($startDate, 15);
        
        $data = [
            'title' => 'Reporte de Eventos',
            'period' => $this->getPeriodName($timeRange),
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => Carbon::now()->format('d/m/Y'),
            'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
            'eventsData' => $eventsData,
            'topEvents' => $topEvents,
            'categoryStats' => $categoryStats,
            'venueStats' => $venueStats,
        ];

        $pdf = Pdf::loadView('pdfs.reports.events', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions(['defaultFont' => 'DejaVu Sans']);

        return $pdf->download('reporte-eventos-' . date('Y-m-d') . '.pdf');
    }

    public function generateFinancialReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        $financialData = $this->getFinancialAnalytics($startDate);
        $organizerStats = $this->getOrganizerStats($startDate);
        $paymentMethodStats = $this->getPaymentMethodStats($startDate);
        
        $data = [
            'title' => 'Reporte Financiero',
            'period' => $this->getPeriodName($timeRange),
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => Carbon::now()->format('d/m/Y'),
            'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
            'financialData' => $financialData,
            'organizerStats' => $organizerStats,
            'paymentMethodStats' => $paymentMethodStats,
        ];

        $pdf = Pdf::loadView('pdfs.reports.financial', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions(['defaultFont' => 'DejaVu Sans']);

        return $pdf->download('reporte-financiero-' . date('Y-m-d') . '.pdf');
    }

    public function generateUsersReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        $userStats = $this->getUserStats($startDate);
        $registrationTrends = $this->getRegistrationTrends($startDate);
        $topBuyers = $this->getTopBuyers($startDate);
        
        $data = [
            'title' => 'Reporte de Usuarios',
            'period' => $this->getPeriodName($timeRange),
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => Carbon::now()->format('d/m/Y'),
            'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
            'userStats' => $userStats,
            'registrationTrends' => $registrationTrends,
            'topBuyers' => $topBuyers,
        ];

        $pdf = Pdf::loadView('pdfs.reports.users', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions(['defaultFont' => 'DejaVu Sans']);

        return $pdf->download('reporte-usuarios-' . date('Y-m-d') . '.pdf');
    }

    public function generateCompleteReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        // Obtener todos los datos
        $salesData = $this->getSalesData($startDate);
        $monthlyData = $this->getMonthlyData($startDate);
        $topEvents = $this->getTopEventsByRevenue($startDate, 15);
        $eventsData = $this->getEventsAnalytics($startDate);
        $categoryStats = $this->getCategoryStats($startDate);
        $venueStats = $this->getVenueStats($startDate);
        $financialData = $this->getFinancialAnalytics($startDate);
        $userStats = $this->getUserStats($startDate);
        
        $data = [
            'title' => 'Reporte Completo de la Plataforma',
            'period' => $this->getPeriodName($timeRange),
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => Carbon::now()->format('d/m/Y'),
            'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
            'salesData' => $salesData,
            'monthlyData' => $monthlyData,
            'topEvents' => $topEvents,
            'eventsData' => $eventsData,
            'categoryStats' => $categoryStats,
            'venueStats' => $venueStats,
            'financialData' => $financialData,
            'userStats' => $userStats,
        ];

        $pdf = Pdf::loadView('pdfs.reports.complete', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions(['defaultFont' => 'DejaVu Sans']);

        return $pdf->download('reporte-completo-' . date('Y-m-d') . '.pdf');
    }

    // Métodos privados para obtener datos
    private function getSalesData(Carbon $startDate): array
    {
        $totalRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $totalTickets = IssuedTicket::whereHas('order', function($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID)
                  ->where('created_at', '>=', $startDate);
        })->count();

        $totalOrders = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->count();

        $avgTicketPrice = $totalTickets > 0 ? $totalRevenue / $totalTickets : 0;

        return [
            'totalRevenue' => $totalRevenue,
            'totalTickets' => $totalTickets,
            'totalOrders' => $totalOrders,
            'avgTicketPrice' => $avgTicketPrice,
            'avgOrderValue' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
        ];
    }

    private function getMonthlyData(Carbon $startDate): array
    {
        $months = [];
        $current = $startDate->copy()->startOfMonth();
        
        while ($current <= Carbon::now()->endOfMonth()) {
            $monthRevenue = Order::where('status', OrderStatus::PAID)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->sum('total_amount');

            $monthTickets = IssuedTicket::whereHas('order', function($query) use ($current) {
                $query->where('status', OrderStatus::PAID)
                      ->whereBetween('created_at', [
                          $current->copy()->startOfMonth(),
                          $current->copy()->endOfMonth()
                      ]);
            })->count();

            $monthOrders = Order::where('status', OrderStatus::PAID)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->count();

            $months[] = [
                'month' => $current->locale('es')->format('F Y'),
                'revenue' => $monthRevenue,
                'tickets' => $monthTickets,
                'orders' => $monthOrders,
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getTopEventsByRevenue(Carbon $startDate, int $limit = 10): array
    {
        return Event::with(['category', 'venue.ciudad.provincia'])
            ->select('events.*')
            ->leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->leftJoin('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->leftJoin('issued_tickets', 'ticket_types.id', '=', 'issued_tickets.ticket_type_id')
            ->leftJoin('orders', function($join) use ($startDate) {
                $join->on('issued_tickets.order_id', '=', 'orders.id')
                     ->where('orders.status', OrderStatus::PAID)
                     ->where('orders.created_at', '>=', $startDate);
            })
            ->whereNotNull('orders.id')
            ->groupBy('events.id')
            ->orderByRaw('SUM(ticket_types.price) DESC')
            ->limit($limit)
            ->get()
            ->map(function ($event) use ($startDate) {
                $revenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->sum('ticket_types.price');

                $ticketsSold = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->count();

                return [
                    'name' => $event->name,
                    'category' => $event->category->name ?? 'Sin categoría',
                    'venue' => $event->venue->name,
                    'city' => $event->venue->ciudad->name ?? 'Sin ciudad',
                    'revenue' => $revenue,
                    'ticketsSold' => $ticketsSold,
                ];
            })
            ->toArray();
    }

    private function getEventsAnalytics(Carbon $startDate): array
    {
        $totalEvents = Event::where('created_at', '>=', $startDate)->count();
        $activeEvents = Event::whereHas('functions', function($query) {
            $query->where('start_time', '>', Carbon::now());
        })->count();

        $completedEvents = Event::whereHas('functions', function($query) {
            $query->where('start_time', '<', Carbon::now());
        })->count();

        $avgTicketsPerEvent = Event::leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->leftJoin('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->where('events.created_at', '>=', $startDate)
            ->avg('ticket_types.quantity_sold') ?? 0;

        return [
            'totalEvents' => $totalEvents,
            'activeEvents' => $activeEvents,
            'completedEvents' => $completedEvents,
            'avgTicketsPerEvent' => round($avgTicketsPerEvent),
        ];
    }

    private function getCategoryStats(Carbon $startDate): array
    {
        return Category::with(['events'])
            ->get()
            ->map(function ($category) use ($startDate) {
                $categoryRevenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('events', 'event_functions.event_id', '=', 'events.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('events.category_id', $category->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->sum('ticket_types.price');

                $eventsCount = Event::where('category_id', $category->id)
                    ->where('created_at', '>=', $startDate)
                    ->count();

                return [
                    'name' => $category->name,
                    'revenue' => $categoryRevenue,
                    'eventsCount' => $eventsCount,
                ];
            })
            ->filter(function($item) {
                return $item['revenue'] > 0 || $item['eventsCount'] > 0;
            })
            ->sortByDesc('revenue')
            ->values()
            ->toArray();
    }

    private function getVenueStats(Carbon $startDate): array
    {
        return DB::table('venues')
            ->select([
                'venues.name',
                'ciudades.name as city',
                DB::raw('COUNT(DISTINCT events.id) as events_count'),
                DB::raw('COALESCE(SUM(ticket_types.price), 0) as total_revenue')
            ])
            ->leftJoin('events', 'venues.id', '=', 'events.venue_id')
            ->leftJoin('ciudades', 'venues.ciudad_id', '=', 'ciudades.id')
            ->leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->leftJoin('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->leftJoin('issued_tickets', 'ticket_types.id', '=', 'issued_tickets.ticket_type_id')
            ->leftJoin('orders', function($join) use ($startDate) {
                $join->on('issued_tickets.order_id', '=', 'orders.id')
                     ->where('orders.status', OrderStatus::PAID)
                     ->where('orders.created_at', '>=', $startDate);
            })
            ->where('events.created_at', '>=', $startDate)
            ->groupBy('venues.id', 'venues.name', 'ciudades.name')
            ->having('events_count', '>', 0)
            ->orderBy('total_revenue', 'DESC')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getFinancialAnalytics(Carbon $startDate): array
    {
        $orders = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalRevenue = $orders->sum('total_amount');
        $totalServiceFees = $orders->sum('service_fee');
        $totalTaxes = $orders->sum('tax');
        $netRevenue = $totalRevenue - $totalServiceFees - $totalTaxes;

        return [
            'totalRevenue' => $totalRevenue,
            'netRevenue' => $netRevenue,
            'totalServiceFees' => $totalServiceFees,
            'totalTaxes' => $totalTaxes,
            'feePercentage' => $totalRevenue > 0 ? ($totalServiceFees / $totalRevenue) * 100 : 0,
        ];
    }

    private function getOrganizerStats(Carbon $startDate): array
    {
        return DB::table('organizers')
            ->select([
                'organizers.name',
                'organizers.business_name',
                DB::raw('COUNT(DISTINCT events.id) as events_count'),
                DB::raw('COALESCE(SUM(ticket_types.price), 0) as total_revenue'),
                DB::raw('COUNT(issued_tickets.id) as tickets_sold')
            ])
            ->leftJoin('events', 'organizers.id', '=', 'events.organizer_id')
            ->leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->leftJoin('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->leftJoin('issued_tickets', 'ticket_types.id', '=', 'issued_tickets.ticket_type_id')
            ->leftJoin('orders', function($join) use ($startDate) {
                $join->on('issued_tickets.order_id', '=', 'orders.id')
                     ->where('orders.status', OrderStatus::PAID)
                     ->where('orders.created_at', '>=', $startDate);
            })
            ->groupBy('organizers.id', 'organizers.name', 'organizers.business_name')
            ->having('total_revenue', '>', 0)
            ->orderBy('total_revenue', 'DESC')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getPaymentMethodStats(Carbon $startDate): array
    {
        return Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->groupBy('payment_method')
            ->select([
                'payment_method',
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(total_amount) as total_revenue')
            ])
            ->orderBy('total_revenue', 'DESC')
            ->get()
            ->toArray();
    }

    private function getUserStats(Carbon $startDate): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();
        $newUsers = User::where('role', UserRole::CLIENT)
            ->where('created_at', '>=', $startDate)
            ->count();
        
        $activeUsers = User::where('role', UserRole::CLIENT)
            ->whereNotNull('email_verified_at')
            ->count();

        $avgOrderValue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->avg('total_amount') ?? 0;

        return [
            'totalUsers' => $totalUsers,
            'newUsers' => $newUsers,
            'activeUsers' => $activeUsers,
            'avgOrderValue' => $avgOrderValue,
        ];
    }

    private function getRegistrationTrends(Carbon $startDate): array
    {
        $trends = [];
        $current = $startDate->copy()->startOfMonth();
        
        while ($current <= Carbon::now()->endOfMonth()) {
            $registrations = User::where('role', UserRole::CLIENT)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->count();

            $firstOrders = Order::where('status', OrderStatus::PAID)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->whereRaw('(SELECT COUNT(*) FROM orders o2 WHERE o2.client_id = orders.client_id AND o2.status = "PAID" AND o2.created_at < orders.created_at) = 0')
                ->count();

            $trends[] = [
                'month' => $current->locale('es')->format('F Y'),
                'registrations' => $registrations,
                'orders' => $firstOrders,
            ];

            $current->addMonth();
        }

        return $trends;
    }

    private function getTopBuyers(Carbon $startDate): array
    {
        return User::with('person')
            ->where('role', UserRole::CLIENT)
            ->whereHas('orders', function($query) use ($startDate) {
                $query->where('status', OrderStatus::PAID)
                      ->where('created_at', '>=', $startDate);
            })
            ->withCount(['orders' => function($query) use ($startDate) {
                $query->where('status', OrderStatus::PAID)
                      ->where('created_at', '>=', $startDate);
            }])
            ->withSum(['orders' => function($query) use ($startDate) {
                $query->where('status', OrderStatus::PAID)
                      ->where('created_at', '>=', $startDate);
            }], 'total_amount')
            ->orderBy('orders_sum_total_amount', 'desc')
            ->limit(15)
            ->get()
            ->map(function($user) {
                return [
                    'name' => $user->person ? $user->person->name . ' ' . $user->person->last_name : 'Sin nombre',
                    'email' => $user->email,
                    'total_orders' => $user->orders_count,
                    'total_spent' => $user->orders_sum_total_amount ?? 0,
                    'avg_order' => $user->orders_count > 0 ? ($user->orders_sum_total_amount / $user->orders_count) : 0,
                    'registration_date' => $user->created_at->format('d/m/Y'),
                ];
            })
            ->toArray();
    }

    private function getPeriodName(string $timeRange): string
    {
        return match($timeRange) {
            '1m' => 'Último mes',
            '3m' => 'Últimos 3 meses',
            '6m' => 'Últimos 6 meses',
            '1y' => 'Último año',
            default => 'Últimos 6 meses'
        };
    }
}