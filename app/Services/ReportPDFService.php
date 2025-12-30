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

    public function generateCompleteReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
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

    public function generateUsersReport(Carbon $startDate, string $timeRange): \Illuminate\Http\Response
    {
        try {
            $userStats = $this->getUserStatsDetailed($startDate);
            $verificationStats = $this->getVerificationStats();
            $contactStats = $this->getContactStats();
            $topBuyers = $this->getTopBuyers($startDate, 15);
            $registrationTrends = $this->getRegistrationTrends($startDate);
            $activityStats = $this->getUserActivityStats($startDate);

            $data = [
                'title' => 'Reporte de Usuarios',
                'period' => $this->getPeriodName($timeRange),
                'startDate' => $startDate->format('d/m/Y'),
                'endDate' => Carbon::now()->format('d/m/Y'),
                'generatedAt' => Carbon::now()->format('d/m/Y H:i'),
                'userStats' => $userStats,
                'verificationStats' => $verificationStats,
                'contactStats' => $contactStats,
                'topBuyers' => $topBuyers,
                'registrationTrends' => $registrationTrends,
                'activityStats' => $activityStats,
            ];

            $pdf = Pdf::loadView('pdfs.reports.users', $data)
                ->setPaper('a4', 'portrait')
                ->setOptions(['defaultFont' => 'DejaVu Sans']);

            return $pdf->download('reporte-usuarios-' . date('Y-m-d') . '.pdf');
        } catch (\Exception $e) {
            throw $e;
        }
    }

    // Métodos privados para obtener datos
    private function getSalesData(Carbon $startDate): array
    {
        $orders = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalRevenue = $orders->sum('total_amount');

        $netRevenue = $orders->sum(function ($order) {
            $discount = $order->subtotal * ($order->discount ?? 0);
            return $order->subtotal - $discount;
        });

        $totalServiceFees = $orders->sum('service_fee');

        $totalTickets = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID)
                ->where('created_at', '>=', $startDate);
        })->count();

        $totalOrders = $orders->count();

        return [
            'totalRevenue' => $totalRevenue,
            'netRevenue' => $netRevenue,
            'totalServiceFees' => $totalServiceFees,
            'totalTickets' => $totalTickets,
            'totalOrders' => $totalOrders,
            'avgOrderValue' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
            'avgTicketPrice' => $totalTickets > 0 ? $totalRevenue / $totalTickets : 0,
        ];
    }

    private function getMonthlyData(Carbon $startDate): array
    {
        $months = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current <= Carbon::now()->endOfMonth()) {
            $monthOrders = Order::where('status', OrderStatus::PAID)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->get();

            $monthRevenue = $monthOrders->sum('total_amount');

            $monthNetRevenue = $monthOrders->sum(function ($order) {
                $discount = $order->subtotal * ($order->discount ?? 0);
                return $order->subtotal - $discount;
            });

            $monthTickets = IssuedTicket::whereHas('order', function ($query) use ($current) {
                $query->where('status', OrderStatus::PAID)
                    ->whereBetween('created_at', [
                        $current->copy()->startOfMonth(),
                        $current->copy()->endOfMonth()
                    ]);
            })->count();

            $monthServiceFees = $monthOrders->sum('service_fee');

            $months[] = [
                'month' => $current->locale('es')->format('F Y'),
                'revenue' => $monthRevenue,
                'netRevenue' => $monthNetRevenue,
                'serviceFees' => $monthServiceFees,
                'tickets' => $monthTickets,
                'orders' => $monthOrders->count(),
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getTopEventsByRevenue(Carbon $startDate, int $limit = 10): array
    {
        // 1. Obtener solo los IDs de los eventos con más ingresos
        $topEventIds = DB::table('events')
            ->join('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->join('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->join('issued_tickets', 'ticket_types.id', '=', 'issued_tickets.ticket_type_id')
            ->join('orders', function ($join) use ($startDate) {
                $join->on('issued_tickets.order_id', '=', 'orders.id')
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate);
            })
            ->whereNull('events.deleted_at')
            ->groupBy('events.id')
            ->orderByRaw('SUM(orders.total_amount) DESC')
            ->limit($limit)
            ->pluck('events.id');

        if ($topEventIds->isEmpty()) {
            return [];
        }

        // 2. Cargar los modelos completos usando esos IDs
        return Event::with(['category', 'venue.ciudad.provincia'])
            ->whereIn('id', $topEventIds)
            ->get()
            ->map(function ($event) use ($startDate) {
                $eventOrders = DB::table('orders')
                    ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->select('orders.id', 'orders.total_amount', 'orders.subtotal', 'orders.discount')
                    ->distinct()
                    ->get();

                $totalRevenue = 0;
                foreach ($eventOrders as $order) {
                    $eventTicketsInOrder = DB::table('issued_tickets')
                        ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                        ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                        ->where('issued_tickets.order_id', $order->id)
                        ->where('event_functions.event_id', $event->id)
                        ->count();

                    $totalTicketsInOrder = DB::table('issued_tickets')
                        ->where('order_id', $order->id)
                        ->count();

                    if ($totalTicketsInOrder > 0) {
                        $proportion = $eventTicketsInOrder / $totalTicketsInOrder;
                        $totalRevenue += $order->total_amount * $proportion;
                    }
                }

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
                    'revenue' => $totalRevenue,
                    'ticketsSold' => $ticketsSold,
                ];
            })
            ->sortByDesc('revenue')
            ->values()
            ->toArray();
    }

    private function getEventsAnalytics(Carbon $startDate): array
    {
        try {
            $totalEvents = Event::where('created_at', '>=', $startDate)->count();

            $activeEvents = Event::whereHas('functions', function ($query) {
                $query->where('start_time', '>', Carbon::now())
                    ->where('is_active', true);
            })->count();

            $completedEvents = Event::whereHas('functions', function ($query) {
                $query->where('end_time', '<', Carbon::now());
            })->count();

            $totalTicketsSold = DB::table('issued_tickets')
                ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                ->join('events', 'event_functions.event_id', '=', 'events.id')
                ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                ->where('events.created_at', '>=', $startDate)
                ->where('orders.status', OrderStatus::PAID)
                ->where('orders.created_at', '>=', $startDate)
                ->count();

            return [
                'totalEvents' => $totalEvents,
                'activeEvents' => $activeEvents,
                'completedEvents' => $completedEvents,
                'totalTicketsSold' => $totalTicketsSold,
            ];
        } catch (\Exception $e) {
            return [
                'totalEvents' => 0,
                'activeEvents' => 0,
                'completedEvents' => 0,
                'totalTicketsSold' => 0,
            ];
        }
    }

    private function getCategoryStats(Carbon $startDate): array
    {
        try {
            return Category::all()
                ->map(function ($category) use ($startDate) {
                    try {
                        $categoryOrders = DB::table('orders')
                            ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
                            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                            ->join('events', 'event_functions.event_id', '=', 'events.id')
                            ->where('events.category_id', $category->id)
                            ->where('orders.status', OrderStatus::PAID)
                            ->where('orders.created_at', '>=', $startDate)
                            ->select('orders.id', 'orders.total_amount')
                            ->distinct()
                            ->get();

                        $categoryRevenue = 0;
                        foreach ($categoryOrders as $order) {
                            $categoryTicketsInOrder = DB::table('issued_tickets')
                                ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                                ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                                ->join('events', 'event_functions.event_id', '=', 'events.id')
                                ->where('issued_tickets.order_id', $order->id)
                                ->where('events.category_id', $category->id)
                                ->count();

                            $totalTicketsInOrder = DB::table('issued_tickets')
                                ->where('order_id', $order->id)
                                ->count();

                            if ($totalTicketsInOrder > 0) {
                                $proportion = $categoryTicketsInOrder / $totalTicketsInOrder;
                                $categoryRevenue += $order->total_amount * $proportion;
                            }
                        }

                        $eventsCount = Event::where('category_id', $category->id)
                            ->where('created_at', '>=', $startDate)
                            ->count();

                        return [
                            'name' => $category->name ?? 'Sin nombre',
                            'revenue' => $categoryRevenue,
                            'eventsCount' => $eventsCount,
                        ];
                    } catch (\Exception $e) {
                        return null;
                    }
                })
                ->filter(function ($item) {
                    return $item !== null && ($item['revenue'] > 0 || $item['eventsCount'] > 0);
                })
                ->sortByDesc('revenue')
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getVenueStats(Carbon $startDate): array
    {
        try {
            $venues = DB::table('venues')
                ->select([
                    'venues.id',
                    'venues.name',
                    'ciudades.name as city'
                ])
                ->leftJoin('ciudades', 'venues.ciudad_id', '=', 'ciudades.id')
                ->get();

            $venueStats = [];

            foreach ($venues as $venue) {
                try {
                    $eventsCount = Event::where('venue_id', $venue->id)
                        ->where('created_at', '>=', $startDate)
                        ->count();

                    if ($eventsCount > 0) {
                        $venueOrders = DB::table('orders')
                            ->join('issued_tickets', 'orders.id', '=', 'issued_tickets.order_id')
                            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                            ->join('events', 'event_functions.event_id', '=', 'events.id')
                            ->where('events.venue_id', $venue->id)
                            ->where('orders.status', OrderStatus::PAID)
                            ->where('orders.created_at', '>=', $startDate)
                            ->select('orders.id', 'orders.total_amount')
                            ->distinct()
                            ->get();

                        $revenue = 0;
                        foreach ($venueOrders as $order) {
                            $venueTicketsInOrder = DB::table('issued_tickets')
                                ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                                ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                                ->join('events', 'event_functions.event_id', '=', 'events.id')
                                ->where('issued_tickets.order_id', $order->id)
                                ->where('events.venue_id', $venue->id)
                                ->count();

                            $totalTicketsInOrder = DB::table('issued_tickets')
                                ->where('order_id', $order->id)
                                ->count();

                            if ($totalTicketsInOrder > 0) {
                                $proportion = $venueTicketsInOrder / $totalTicketsInOrder;
                                $revenue += $order->total_amount * $proportion;
                            }
                        }

                        $venueStats[] = [
                            'name' => $venue->name ?? 'Sin nombre',
                            'city' => $venue->city ?? 'Sin ciudad',
                            'events_count' => $eventsCount,
                            'total_revenue' => $revenue,
                        ];
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            usort($venueStats, function ($a, $b) {
                return $b['total_revenue'] <=> $a['total_revenue'];
            });

            return array_slice($venueStats, 0, 10);
        } catch (\Exception $e) {
            return [];
        }
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
        $organizers = Organizer::all();
        $organizerStats = [];

        foreach ($organizers as $organizer) {
            $eventsCount = Event::where('organizer_id', $organizer->id)
                ->where('created_at', '>=', $startDate)
                ->count();

            if ($eventsCount > 0) {
                $revenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('events', 'event_functions.event_id', '=', 'events.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('events.organizer_id', $organizer->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->sum('ticket_types.price');

                $ticketsSold = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('events', 'event_functions.event_id', '=', 'events.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('events.organizer_id', $organizer->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->count();

                $organizerStats[] = [
                    'name' => $organizer->name,
                    'business_name' => $organizer->business_name,
                    'events_count' => $eventsCount,
                    'total_revenue' => $revenue ?? 0,
                    'tickets_sold' => $ticketsSold,
                ];
            }
        }

        usort($organizerStats, function ($a, $b) {
            return $b['total_revenue'] <=> $a['total_revenue'];
        });

        return array_slice($organizerStats, 0, 10);
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

        return [
            'totalUsers' => $totalUsers,
            'newUsers' => $newUsers,
            'activeUsers' => $activeUsers,
        ];
    }

    private function getUserStatsDetailed(Carbon $startDate): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();

        $activeUsers = User::where('role', UserRole::CLIENT)
            ->whereNotNull('email_verified_at')
            ->count();

        $newUsers = User::where('role', UserRole::CLIENT)
            ->where('created_at', '>=', $startDate)
            ->count();

        $usersWithPhone = User::where('role', UserRole::CLIENT)
            ->whereHas('person', function ($query) {
                $query->whereNotNull('phone')
                    ->where('phone', '!=', '');
            })
            ->count();

        $verificationRate = $totalUsers > 0
            ? round(($activeUsers / $totalUsers) * 100, 1)
            : 0;

        return [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'newUsers' => $newUsers,
            'usersWithPhone' => $usersWithPhone,
            'verificationRate' => $verificationRate,
        ];
    }

    private function getVerificationStats(): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();

        $verified = User::where('role', UserRole::CLIENT)
            ->whereNotNull('email_verified_at')
            ->count();

        $pending = $totalUsers - $verified;

        return [
            'verified' => $verified,
            'pending' => $pending,
            'verifiedPercentage' => $totalUsers > 0 ? round(($verified / $totalUsers) * 100, 1) : 0,
            'pendingPercentage' => $totalUsers > 0 ? round(($pending / $totalUsers) * 100, 1) : 0,
        ];
    }

    private function getContactStats(): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();

        $withPhone = User::where('role', UserRole::CLIENT)
            ->whereHas('person', function ($query) {
                $query->whereNotNull('phone')
                    ->where('phone', '!=', '');
            })
            ->count();

        $withAddress = User::where('role', UserRole::CLIENT)
            ->whereHas('person', function ($query) {
                $query->whereNotNull('address')
                    ->where('address', '!=', '');
            })
            ->count();

        $withDni = User::where('role', UserRole::CLIENT)
            ->whereHas('person', function ($query) {
                $query->whereNotNull('dni')
                    ->where('dni', '!=', '');
            })
            ->count();

        return [
            'withPhone' => $withPhone,
            'withoutPhone' => $totalUsers - $withPhone,
            'phonePercentage' => $totalUsers > 0 ? round(($withPhone / $totalUsers) * 100, 1) : 0,

            'withAddress' => $withAddress,
            'withoutAddress' => $totalUsers - $withAddress,
            'addressPercentage' => $totalUsers > 0 ? round(($withAddress / $totalUsers) * 100, 1) : 0,

            'withDni' => $withDni,
            'withoutDni' => $totalUsers - $withDni,
            'dniPercentage' => $totalUsers > 0 ? round(($withDni / $totalUsers) * 100, 1) : 0,
        ];
    }

    private function getTopBuyers(Carbon $startDate, int $limit = 15): array
    {
        try {
            $topBuyerIds = DB::table('orders')
                ->select(
                    'client_id',
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_spent')
                )
                ->where('status', OrderStatus::PAID->value)
                ->where('created_at', '>=', $startDate)
                ->whereNotNull('client_id')
                ->groupBy('client_id')
                ->orderBy('total_spent', 'DESC')
                ->limit($limit)
                ->get();

            $buyers = [];
            foreach ($topBuyerIds as $buyerData) {
                $user = User::with('person')
                    ->where('id', $buyerData->client_id)
                    ->where('role', UserRole::CLIENT)
                    ->first();

                if ($user) {
                    $buyers[] = [
                        'name' => $user->person
                            ? "{$user->person->name} {$user->person->last_name}"
                            : 'Sin nombre',
                        'email' => $user->email,
                        'totalOrders' => $buyerData->total_orders,
                        'totalSpent' => $buyerData->total_spent ?? 0,
                        'emailVerified' => $user->email_verified_at !== null,
                    ];
                }
            }

            return $buyers;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getRegistrationTrends(Carbon $startDate): array
    {
        $trends = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current <= Carbon::now()->endOfMonth()) {
            $newUsers = User::where('role', UserRole::CLIENT)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->count();

            $verifiedUsers = User::where('role', UserRole::CLIENT)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth()
                ])
                ->whereNotNull('email_verified_at')
                ->count();

            $verificationRate = $newUsers > 0
                ? round(($verifiedUsers / $newUsers) * 100, 1)
                : 0;

            $trends[] = [
                'month' => $current->locale('es')->format('F Y'),
                'newUsers' => $newUsers,
                'verifiedUsers' => $verifiedUsers,
                'verificationRate' => $verificationRate,
            ];

            $current->addMonth();
        }

        return $trends;
    }

    private function getUserActivityStats(Carbon $startDate): array
    {
        try {
            $totalUsers = User::where('role', UserRole::CLIENT)->count();

            $usersWithOrders = DB::table('orders')
                ->where('status', OrderStatus::PAID->value)
                ->where('created_at', '>=', $startDate)
                ->whereNotNull('client_id')
                ->distinct('client_id')
                ->count('client_id');

            $usersWithoutOrders = $totalUsers - $usersWithOrders;

            $totalRevenue = Order::where('status', OrderStatus::PAID)
                ->where('created_at', '>=', $startDate)
                ->sum('total_amount');

            $avgOrderValue = $usersWithOrders > 0
                ? $totalRevenue / $usersWithOrders
                : 0;

            return [
                'usersWithOrders' => $usersWithOrders,
                'usersWithoutOrders' => $usersWithoutOrders,
                'usersWithOrdersPercentage' => $totalUsers > 0
                    ? round(($usersWithOrders / $totalUsers) * 100, 1)
                    : 0,
                'usersWithoutOrdersPercentage' => $totalUsers > 0
                    ? round(($usersWithoutOrders / $totalUsers) * 100, 1)
                    : 0,
                'totalRevenue' => $totalRevenue,
                'avgOrderValue' => $avgOrderValue,
            ];
        } catch (\Exception $e) {
            return [
                'usersWithOrders' => 0,
                'usersWithoutOrders' => 0,
                'usersWithOrdersPercentage' => 0,
                'usersWithoutOrdersPercentage' => 0,
                'totalRevenue' => 0,
                'avgOrderValue' => 0,
            ];
        }
    }

    private function getPeriodName(string $timeRange): string
    {
        return match ($timeRange) {
            '1m' => 'Último mes',
            '3m' => 'Últimos 3 meses',
            '6m' => 'Últimos 6 meses',
            '1y' => 'Último año',
            default => 'Últimos 6 meses'
        };
    }
}
