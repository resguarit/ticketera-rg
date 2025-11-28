<?php

// filepath: app/Http/Controllers/Admin/ReportController.php

namespace App\Http\Controllers\Admin;

use App\Enums\EventFunctionStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\IssuedTicket;
use App\Models\Order;
use App\Models\User;
use App\Services\ReportPDFService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private ReportPDFService $reportPDFService) {}

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

        return match ($reportType) {
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

        $todayTickets = IssuedTicket::whereHas('order', function ($query) use ($today) {
            $query->where('status', OrderStatus::PAID)
                ->whereDate('created_at', $today);
        })->count();

        $activeEvents = Event::whereHas('functions', function ($query) {
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

        $data = match ($type) {
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
        return match ($timeRange) {
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

        $totalTickets = IssuedTicket::whereHas('order', function ($query) use ($startDate) {
            $query->where('status', OrderStatus::PAID)
                ->where('created_at', '>=', $startDate);
        })->count();

        $monthlyTickets = IssuedTicket::whereHas('order', function ($query) {
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

        // Todas las órdenes iniciadas (incluye pending, cancelled, etc.)
        $totalOrdersStarted = Order::where('created_at', '>=', $startDate)->count();

        // Órdenes completadas
        $totalOrdersPaid = Order::where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Tasa de conversión: órdenes pagadas / órdenes iniciadas
        $conversionRate = $totalOrdersStarted > 0 ?
            round(($totalOrdersPaid / $totalOrdersStarted) * 100, 1) : 0;

        return [
            'totalRevenue' => $totalRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'totalTickets' => $totalTickets,
            'monthlyTickets' => $monthlyTickets,
            'averageTicketPrice' => $totalTickets > 0 ? $totalRevenue / $totalTickets : 0,
            'conversionRate' => $conversionRate,
            'growthRate' => round($growthRate, 1),
        ];
    }

    private function getTopEvents(Carbon $startDate, int $limit): array
    {
        return Event::with(['category', 'venue.ciudad', 'functions'])
            ->select('events.*')
            ->leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
            ->leftJoin('ticket_types', 'event_functions.id', '=', 'ticket_types.event_function_id')
            ->leftJoin('issued_tickets', 'ticket_types.id', '=', 'issued_tickets.ticket_type_id')
            ->leftJoin('orders', function ($join) use ($startDate) {
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

                // Calcular revenue del período anterior
                $previousPeriod = $startDate->copy()->sub($startDate->diff(Carbon::now()));
                $previousRevenue = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->whereBetween('orders.created_at', [$previousPeriod, $startDate])
                    ->sum('ticket_types.price');

                // Calcular tasa de crecimiento
                $growthRate = $previousRevenue > 0
                    ? round((($revenue - $previousRevenue) / $previousRevenue) * 100, 1)
                    : 0;

                // Formatear como string con signo
                $growthFormatted = $growthRate > 0
                    ? '+'.$growthRate.'%'
                    : $growthRate.'%';

                $ticketsSold = DB::table('issued_tickets')
                    ->join('ticket_types', 'issued_tickets.ticket_type_id', '=', 'ticket_types.id')
                    ->join('event_functions', 'ticket_types.event_function_id', '=', 'event_functions.id')
                    ->join('orders', 'issued_tickets.order_id', '=', 'orders.id')
                    ->where('event_functions.event_id', $event->id)
                    ->where('orders.status', OrderStatus::PAID)
                    ->where('orders.created_at', '>=', $startDate)
                    ->count();

                // Determinar estado del evento usando la misma lógica del EventController
                $statusInfo = $this->determineEventStatus($event);

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'category' => $event->category->name ?? 'Sin categoría',
                    'revenue' => $revenue,
                    'tickets_sold' => $ticketsSold,
                    'growth' => $growthFormatted,
                    'status' => $statusInfo['value'],
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'is_active' => $statusInfo['is_active'],
                ];
            })
            ->toArray();
    }

    /**
     * Determina el estado de un evento basado en sus funciones
     */
    private function determineEventStatus(Event $event): array
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
            ->filter(fn ($f) => $f->is_active) // Priorizar funciones activas
            ->sortBy(function ($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

        // Si no hay funciones activas, tomar cualquier función
        if (! $primaryFunction) {
            $primaryFunction = $event->functions
                ->sortBy(function ($function) use ($priorityOrder) {
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

    private function getMonthlyData(Carbon $startDate): array
    {
        $months = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current <= Carbon::now()->endOfMonth()) {
            $monthRevenue = Order::where('status', OrderStatus::PAID)
                ->whereBetween('created_at', [
                    $current->copy()->startOfMonth(),
                    $current->copy()->endOfMonth(),
                ])
                ->sum('total_amount');

            $monthTickets = IssuedTicket::whereHas('order', function ($query) use ($current) {
                $query->where('status', OrderStatus::PAID)
                    ->whereBetween('created_at', [
                        $current->copy()->startOfMonth(),
                        $current->copy()->endOfMonth(),
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
            ->filter(function ($item) {
                return $item['revenue'] > 0;
            })
            ->sortByDesc('revenue')
            ->values();

        $totalRevenue = $categories->sum('revenue');

        $colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

        return $categories->map(function ($category, $index) use ($totalRevenue, $colors) {
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
        $totalClients = User::where('role', UserRole::CLIENT)->count();

        if ($totalClients === 0) {
            return [];
        }

        // Usuarios verificados vs no verificados
        $verifiedUsers = User::where('role', UserRole::CLIENT)
            ->whereNotNull('email_verified_at')
            ->count();

        $unverifiedUsers = $totalClients - $verifiedUsers;

        // Usuarios con teléfono vs sin teléfono
        $usersWithPhone = User::where('role', UserRole::CLIENT)
            ->whereHas('person', function ($query) {
                $query->whereNotNull('phone');
            })
            ->count();

        $usersWithoutPhone = $totalClients - $usersWithPhone;

        return [
            [
                'age' => 'Email verificado',
                'percentage' => $totalClients > 0 ? round(($verifiedUsers / $totalClients) * 100, 1) : 0,
                'users' => $verifiedUsers,
            ],
            [
                'age' => 'Email sin verificar',
                'percentage' => $totalClients > 0 ? round(($unverifiedUsers / $totalClients) * 100, 1) : 0,
                'users' => $unverifiedUsers,
            ],
            [
                'age' => 'Con teléfono',
                'percentage' => $totalClients > 0 ? round(($usersWithPhone / $totalClients) * 100, 1) : 0,
                'users' => $usersWithPhone,
            ],
            [
                'age' => 'Sin teléfono',
                'percentage' => $totalClients > 0 ? round(($usersWithoutPhone / $totalClients) * 100, 1) : 0,
                'users' => $usersWithoutPhone,
            ],
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

        return $pdf->download('reporte-completo-'.date('Y-m-d').'.pdf');
    }
}
