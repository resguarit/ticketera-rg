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

        $orders = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->get();

        // Ingresos brutos (total_amount = subtotal - descuento + service_fee)
        $totalRevenue = $orders->sum('total_amount');

        $netRevenue = $orders->sum(function($order) {
            $discount = $order->subtotal * ($order->discount ?? 0);
            return $order->subtotal - $discount;
        });
            
            $totalServiceFees = $orders->sum('service_fee');




        return [
            'totalRevenue' => $totalRevenue,
            'netRevenue' => $netRevenue,
            'totalServiceFees' => $totalServiceFees,
            'totalTickets' => $totalTickets,
            'totalOrders' => $totalOrders,
            'avgOrderValue' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
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
            
            $monthNetRevenue = $monthOrders->sum(function($order) {
                $discount = $order->subtotal * ($order->discount ?? 0);
                return $order->subtotal - $discount;
            });

            $monthTickets = IssuedTicket::whereHas('order', function($query) use ($current) {
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
            ->orderByRaw('SUM(orders.total_amount) DESC')
            ->limit($limit)
            ->get()
            ->map(function ($event) use ($startDate) {
                // Obtener todas las órdenes del evento
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

                // Calcular proporción del revenue de cada orden que corresponde a este evento
                $totalRevenue = 0;
                foreach ($eventOrders as $order) {
                    // Contar tickets de este evento en esta orden
                    $eventTicketsInOrder = DB::table('issued_tickets')
                        ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                        ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                        ->where('issued_tickets.order_id', $order->id)
                        ->where('event_functions.event_id', $event->id)
                        ->count();

                    // Contar total de tickets en esta orden
                    $totalTicketsInOrder = DB::table('issued_tickets')
                        ->where('order_id', $order->id)
                        ->count();

                    // Calcular proporción del total_amount
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
            
            $activeEvents = Event::whereHas('functions', function($query) {
                $query->where('start_time', '>', Carbon::now())
                      ->where('is_active', true);
            })->count();

            $completedEvents = Event::whereHas('functions', function($query) {
                $query->where('end_time', '<', Carbon::now());
            })->count();

            // Calcular promedio de tickets por evento de forma segura
            $totalTickets = DB::table('issued_tickets')
                ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                ->join('events', 'event_functions.event_id', '=', 'events.id')
                ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                ->where('events.created_at', '>=', $startDate)
                ->where('orders.status', OrderStatus::PAID)
                ->where('orders.created_at', '>=', $startDate)
                ->count();

            $eventsWithSales = Event::where('created_at', '>=', $startDate)
                ->whereHas('functions.ticketTypes.issuedTickets.order', function($query) use ($startDate) {
                    $query->where('status', OrderStatus::PAID)
                          ->where('created_at', '>=', $startDate);
                })
                ->count();

            $avgTicketsPerEvent = $eventsWithSales > 0 ? round($totalTickets / $eventsWithSales) : 0;

            return [
                'totalEvents' => $totalEvents,
                'activeEvents' => $activeEvents,
                'completedEvents' => $completedEvents,
                'avgTicketsPerEvent' => $avgTicketsPerEvent,
            ];
        } catch (\Exception $e) {
            \Log::error("Error en getEventsAnalytics: " . $e->getMessage());
            
            return [
                'totalEvents' => 0,
                'activeEvents' => 0,
                'completedEvents' => 0,
                'avgTicketsPerEvent' => 0,
            ];
        }
    }

    private function getCategoryStats(Carbon $startDate): array
    {
        try {
            return Category::all()
                ->map(function ($category) use ($startDate) {
                    try {
                        $categoryRevenue = DB::table('issued_tickets')
                            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                            ->join('events', 'event_functions.event_id', '=', 'events.id')
                            ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                            ->where('events.category_id', $category->id)
                            ->where('orders.status', OrderStatus::PAID)
                            ->where('orders.created_at', '>=', $startDate)
                            ->sum('ticket_types.price') ?? 0;

                        $eventsCount = Event::where('category_id', $category->id)
                            ->where('created_at', '>=', $startDate)
                            ->count();

                        return [
                            'name' => $category->name ?? 'Sin nombre',
                            'revenue' => $categoryRevenue,
                            'eventsCount' => $eventsCount,
                        ];
                    } catch (\Exception $e) {
                        \Log::warning("Error procesando categoría {$category->id}: " . $e->getMessage());
                        return null;
                    }
                })
                ->filter(function($item) {
                    return $item !== null && ($item['revenue'] > 0 || $item['eventsCount'] > 0);
                })
                ->sortByDesc('revenue')
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            \Log::error("Error en getCategoryStats: " . $e->getMessage());
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
                        $revenue = DB::table('issued_tickets')
                            ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                            ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                            ->join('events', 'event_functions.event_id', '=', 'events.id')
                            ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                            ->where('events.venue_id', $venue->id)
                            ->where('orders.status', OrderStatus::PAID)
                            ->where('orders.created_at', '>=', $startDate)
                            ->sum('ticket_types.price') ?? 0;

                        $venueStats[] = [
                            'name' => $venue->name ?? 'Sin nombre',
                            'city' => $venue->city ?? 'Sin ciudad',
                            'events_count' => $eventsCount,
                            'total_revenue' => $revenue,
                        ];
                    }
                } catch (\Exception $e) {
                    \Log::warning("Error procesando venue {$venue->id}: " . $e->getMessage());
                    continue;
                }
            }

            // Ordenar por revenue y limitar a 10
            usort($venueStats, function($a, $b) {
                return $b['total_revenue'] <=> $a['total_revenue'];
            });

            return array_slice($venueStats, 0, 10);
        } catch (\Exception $e) {
            \Log::error("Error en getVenueStats: " . $e->getMessage());
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

        // Ordenar por revenue y limitar a 10
        usort($organizerStats, function($a, $b) {
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