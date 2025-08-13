<?php
// filepath: app/Http/Controllers/Admin/ReportController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\IssuedTicket;
use App\Models\Category;
use App\Enums\UserRole;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        // Obtener rango de tiempo (por defecto 6 meses)
        $timeRange = $request->get('timeRange', '6m');
        $startDate = $this->getStartDate($timeRange);

        // Estadísticas principales de ventas
        $salesData = $this->getSalesData($startDate);
        
        // Top eventos por ingresos
        $topEvents = $this->getTopEvents($startDate);
        
        // Datos mensuales para gráficos
        $monthlyData = $this->getMonthlyData($startDate);
        
        // Datos por categorías
        $categoryData = $this->getCategoryData($startDate);
        
        // Demografía de usuarios
        $userDemographics = $this->getUserDemographics();

        return Inertia::render('admin/reports', [
            'salesData' => $salesData,
            'topEvents' => $topEvents,
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
            'userDemographics' => $userDemographics,
            'timeRange' => $timeRange
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->get('type', 'complete');
        $timeRange = $request->get('timeRange', '6m');
        $startDate = $this->getStartDate($timeRange);

        switch ($type) {
            case 'sales':
                return $this->exportSalesReport($startDate);
            case 'events':
                return $this->exportEventsReport($startDate);
            case 'users':
                return $this->exportUsersReport($startDate);
            default:
                return $this->exportCompleteReport($startDate);
        }
    }

    private function getStartDate(string $timeRange): Carbon
    {
        return match($timeRange) {
            '1m' => Carbon::now()->subMonth(),
            '3m' => Carbon::now()->subMonths(3),
            '6m' => Carbon::now()->subMonths(6),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subMonths(6)
        };
    }

    private function getSalesData(Carbon $startDate): array
    {
        // Ingresos totales usando órdenes pagadas
        $totalRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $previousPeriodRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '<', $startDate)
            ->where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(Carbon::now())))
            ->sum('total_amount');

        $revenueGrowth = $previousPeriodRevenue > 0 
            ? round((($totalRevenue - $previousPeriodRevenue) / $previousPeriodRevenue) * 100, 1)
            : 0;

        // Tickets vendidos usando IssuedTicket con órdenes pagadas
        $totalTickets = IssuedTicket::whereHas('order', function($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID)
                  ->where('created_at', '>=', $startDate);
        })->count();

        // Ingresos mensuales
        $monthlyRevenue = Order::where('status', OrderStatus::PAID)
            ->whereBetween('created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->sum('total_amount');

        // Tickets mensuales
        $monthlyTickets = IssuedTicket::whereHas('order', function($query) {
            $query->where('status', OrderStatus::PAID)
                  ->whereBetween('created_at', [
                      Carbon::now()->startOfMonth(),
                      Carbon::now()->endOfMonth()
                  ]);
        })->count();

        // Precio promedio
        $averageTicketPrice = $totalTickets > 0 ? round($totalRevenue / $totalTickets) : 0;

        // Tasa de conversión (simulada)
        $conversionRate = 12.5;

        return [
            'totalRevenue' => $totalRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'totalTickets' => $totalTickets,
            'monthlyTickets' => $monthlyTickets,
            'averageTicketPrice' => $averageTicketPrice,
            'conversionRate' => $conversionRate,
            'growthRate' => $revenueGrowth
        ];
    }

    private function getTopEvents(Carbon $startDate): array
    {
        // Obtener eventos con ingresos calculados usando IssuedTicket y Order
        return Event::with(['category'])
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
            ->limit(5)
            ->get()
            ->map(function ($event) use ($startDate) {
                // Calcular ingresos del evento
                $revenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->sum('ticket_types.price');

                // Calcular tickets vendidos
                $ticketsSold = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->count();

                // Determinar estado
                $status = 'completed';
                $hasActiveFunctions = DB::table('event_functions')
                    ->where('event_id', $event->id)
                    ->where('start_time', '>', Carbon::now())
                    ->exists();
                
                if ($hasActiveFunctions) {
                    $status = 'active';
                }

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'category' => $event->category->name ?? 'Sin categoría',
                    'revenue' => $revenue,
                    'tickets_sold' => $ticketsSold,
                    'growth' => '+' . rand(5, 30) . '%', // Simulado
                    'status' => $status
                ];
            })
            ->filter(function($item) {
                return $item['revenue'] > 0;
            })
            ->values()
            ->toArray();
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

            $months[] = [
                'month' => $current->locale('es')->format('M'),
                'revenue' => $monthRevenue,
                'tickets' => $monthTickets
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getCategoryData(Carbon $startDate): array
    {
        $totalRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        return Category::with(['events'])
            ->get()
            ->map(function ($category) use ($startDate, $totalRevenue) {
                // Calcular ingresos por categoría usando queries directas
                $categoryRevenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('events', 'event_functions.event_id', '=', 'events.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('events.category_id', $category->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->sum('ticket_types.price');

                $percentage = $totalRevenue > 0 ? round(($categoryRevenue / $totalRevenue) * 100, 1) : 0;

                return [
                    'category' => $category->name,
                    'percentage' => $percentage,
                    'revenue' => $categoryRevenue,
                    'color' => $category->color ?? 'bg-blue-500' // Color desde BD
                ];
            })
            ->filter(function($item) {
                return $item['revenue'] > 0;
            })
            ->sortByDesc('revenue')
            ->values()
            ->toArray();
    }

    private function getUserDemographics(): array
    {
        $totalClients = User::where('role', UserRole::CLIENT)->count();
        
        return [
            ['age' => '18-25', 'percentage' => 30, 'users' => round($totalClients * 0.30)],
            ['age' => '26-35', 'percentage' => 35, 'users' => round($totalClients * 0.35)],
            ['age' => '36-45', 'percentage' => 20, 'users' => round($totalClients * 0.20)],
            ['age' => '46-55', 'percentage' => 10, 'users' => round($totalClients * 0.10)],
            ['age' => '56+', 'percentage' => 5, 'users' => round($totalClients * 0.05)]
        ];
    }

    private function exportSalesReport(Carbon $startDate)
    {
        $salesData = $this->getSalesData($startDate);
        $monthlyData = $this->getMonthlyData($startDate);

        return response()->json([
            'message' => 'Reporte de ventas generado',
            'data' => [
                'sales' => $salesData,
                'monthly' => $monthlyData
            ]
        ]);
    }

    private function exportEventsReport(Carbon $startDate)
    {
        $topEvents = $this->getTopEvents($startDate);

        return response()->json([
            'message' => 'Reporte de eventos generado',
            'data' => $topEvents
        ]);
    }

    private function exportUsersReport(Carbon $startDate)
    {
        $userStats = [
            'total_users' => User::where('role', UserRole::CLIENT)->count(),
            'new_users' => User::where('role', UserRole::CLIENT)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'active_users' => User::where('role', UserRole::CLIENT)
                ->whereNotNull('email_verified_at')
                ->count(),
            'demographics' => $this->getUserDemographics()
        ];

        return response()->json([
            'message' => 'Reporte de usuarios generado',
            'data' => $userStats
        ]);
    }

    private function exportCompleteReport(Carbon $startDate)
    {
        return response()->json([
            'message' => 'Reporte completo generado',
            'data' => [
                'sales' => $this->getSalesData($startDate),
                'events' => $this->getTopEvents($startDate),
                'monthly' => $this->getMonthlyData($startDate),
                'categories' => $this->getCategoryData($startDate),
                'users' => $this->getUserDemographics()
            ]
        ]);
    }

    public function downloadReport(Request $request)
    {
        $type = $request->get('type', 'pdf');
        $reportType = $request->get('report', 'complete');
        $timeRange = $request->get('timeRange', '6m');

        return response()->json([
            'message' => "Descargando reporte {$reportType} en formato {$type}",
            'url' => '/storage/reports/' . $reportType . '_' . date('Y-m-d') . '.' . $type
        ]);
    }

    public function realTimeStats(Request $request)
    {
        $today = Carbon::today();
        
        return response()->json([
            'today_sales' => Order::where('status', OrderStatus::PAID)
                ->whereDate('created_at', $today)
                ->sum('total_amount'),
            'today_tickets' => IssuedTicket::whereHas('order', function($query) use ($today) {
                $query->where('status', OrderStatus::PAID)
                      ->whereDate('created_at', $today);
            })->count(),
            'active_events' => Event::whereHas('functions', function($query) {
                $query->where('start_time', '>', Carbon::now());
            })->count(),
            'total_users' => User::where('role', UserRole::CLIENT)->count(),
            'last_update' => Carbon::now()->format('H:i:s')
        ]);
    }
}