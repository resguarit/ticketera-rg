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
use App\Services\ReportPDFService;

class ReportController extends Controller
{
    public function __construct(private ReportPDFService $reportPDFService)
    {
    }

    public function index(Request $request): Response
    {
        $timeRange = $request->get('timeRange', '6m');
        $startDate = $this->getStartDate($timeRange);

        // Obtener datos principales
        $salesData = $this->getSalesData($startDate);
        $topEvents = $this->getTopEvents($startDate, 10);
        $monthlyData = $this->getMonthlyData($startDate);
        $categoryData = $this->getCategoryData($startDate);
        $userDemographics = $this->getUserDemographics();

        return Inertia::render('admin/reports', [
            'salesData' => $salesData,
            'topEvents' => $topEvents,
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
            'userDemographics' => $userDemographics,
            'timeRange' => $timeRange,
        ]);
    }

    /**
     * Descargar reporte específico en PDF
     */
    public function downloadReport(Request $request, string $reportType)
    {
        $timeRange = $request->get('timeRange', '6m');
        $startDate = $this->getStartDate($timeRange);

        return match($reportType) {
            'sales' => $this->reportPDFService->generateSalesReport($startDate, $timeRange),
            'events' => $this->reportPDFService->generateEventsReport($startDate, $timeRange),
            'financial' => $this->reportPDFService->generateFinancialReport($startDate, $timeRange),
            'users' => $this->reportPDFService->generateUsersReport($startDate, $timeRange),
            'complete' => $this->reportPDFService->generateCompleteReport($startDate, $timeRange),
            default => abort(404, 'Tipo de reporte no encontrado'),
        };
    }

    /**
     * Obtener estadísticas en tiempo real para el dashboard
     */
    public function realTimeStats()
    {
        $today = Carbon::today();
        
        $todaySales = Order::where('status', OrderStatus::PAID)
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $todayTickets = IssuedTicket::whereHas('order', function($query) use ($today) {
            $query->where('status', OrderStatus::PAID)
                  ->whereDate('created_at', $today);
        })->count();

        $activeEvents = Event::whereHas('functions', function($query) {
            $query->where('start_time', '>', Carbon::now());
        })->count();

        $totalUsers = User::where('role', UserRole::CLIENT)->count();

        return response()->json([
            'today_sales' => $todaySales,
            'today_tickets' => $todayTickets,
            'active_events' => $activeEvents,
            'total_users' => $totalUsers,
            'last_update' => Carbon::now()->format('d/m/Y H:i:s'),
        ]);
    }

    /**
     * Exportar datos para procesamiento externo (no PDF)
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'sales');
        $timeRange = $request->get('timeRange', '6m');
        $startDate = $this->getStartDate($timeRange);

        $data = match($type) {
            'sales' => $this->getSalesData($startDate),
            'events' => $this->getTopEvents($startDate, 50),
            'users' => $this->getUserStats($startDate),
            default => [],
        };

        return response()->json([
            'message' => 'Datos exportados correctamente',
            'data' => $data,
        ]);
    }

    // Métodos privados de utilidad
    private function getStartDate(string $timeRange): Carbon
    {
        return match($timeRange) {
            '1m' => Carbon::now()->subMonth(),
            '3m' => Carbon::now()->subMonths(3),
            '6m' => Carbon::now()->subMonths(6),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subMonths(6),
        };
    }

    private function getSalesData(Carbon $startDate): array
    {
        $totalRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $monthlyRevenue = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('total_amount');

        $totalTickets = IssuedTicket::whereHas('order', function($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID)
                  ->where('created_at', '>=', $startDate);
        })->count();

        $monthlyTickets = IssuedTicket::whereHas('order', function($query) {
            $query->where('status', OrderStatus::PAID)
                  ->where('created_at', '>=', Carbon::now()->startOfMonth());
        })->count();

        $totalOrders = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Calcular tasa de crecimiento comparando con período anterior
        $previousPeriod = $startDate->copy()->sub($startDate->diff(Carbon::now()));
        $previousRevenue = Order::where('status', OrderStatus::PAID)
            ->whereBetween('created_at', [$previousPeriod, $startDate])
            ->sum('total_amount');

        $growthRate = $previousRevenue > 0 ? 
            (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;

        return [
            'totalRevenue' => $totalRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'totalTickets' => $totalTickets,
            'monthlyTickets' => $monthlyTickets,
            'averageTicketPrice' => $totalTickets > 0 ? $totalRevenue / $totalTickets : 0,
            'conversionRate' => 73.5, // Puedes calcular esto basado en visitas vs compras
            'growthRate' => round($growthRate, 1),
        ];
    }

    private function getTopEvents(Carbon $startDate, int $limit): array
    {
        return Event::with(['category', 'venue.ciudad'])
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
                    'id' => $event->id,
                    'name' => $event->name,
                    'category' => $event->category->name ?? 'Sin categoría',
                    'revenue' => $revenue,
                    'tickets_sold' => $ticketsSold,
                    'growth' => '+' . rand(5, 25) . '%', // Puedes calcular el crecimiento real
                    'status' => $event->functions()->where('start_time', '>', Carbon::now())->exists() ? 'active' : 'completed',
                ];
            })
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
                'tickets' => $monthTickets,
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getCategoryData(Carbon $startDate): array
    {
        $categories = Category::with(['events'])
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

                return [
                    'category' => $category->name,
                    'revenue' => $categoryRevenue,
                ];
            })
            ->filter(function($item) {
                return $item['revenue'] > 0;
            })
            ->sortByDesc('revenue')
            ->values();

        $totalRevenue = $categories->sum('revenue');
        
        $colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        
        return $categories->map(function($category, $index) use ($totalRevenue, $colors) {
            return [
                'category' => $category['category'],
                'revenue' => $category['revenue'],
                'percentage' => $totalRevenue > 0 ? round(($category['revenue'] / $totalRevenue) * 100, 1) : 0,
                'color' => $colors[$index % count($colors)],
            ];
        })->toArray();
    }

    private function getUserDemographics(): array
    {
        // Datos simulados de demografía - puedes implementar la lógica real
        return [
            ['age' => '18-25', 'percentage' => 30, 'users' => 1500],
            ['age' => '26-35', 'percentage' => 35, 'users' => 1750],
            ['age' => '36-45', 'percentage' => 20, 'users' => 1000],
            ['age' => '46+', 'percentage' => 15, 'users' => 750],
        ];
    }

    private function getUserStats(Carbon $startDate): array
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();
        $newUsers = User::where('role', UserRole::CLIENT)
            ->where('created_at', '>=', $startDate)
            ->count();

        return [
            'totalUsers' => $totalUsers,
            'newUsers' => $newUsers,
            'activeUsers' => User::where('role', UserRole::CLIENT)
                ->whereNotNull('email_verified_at')
                ->count(),
        ];
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
}