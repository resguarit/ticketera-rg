<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\IssuedTicket; // Cambié de Ticket a IssuedTicket
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Obtener rango de tiempo (por defecto 7 días)
        $timeRange = $request->get('timeRange', '7d');
        $startDate = $this->getStartDate($timeRange);

        // Estadísticas principales
        $stats = $this->getDashboardStats($startDate);
        
        // Eventos recientes
        $recentEvents = $this->getRecentEvents();
        
        // Usuarios recientes
        $recentUsers = $this->getRecentUsers();
        
        // Alertas del sistema
        $systemAlerts = $this->getSystemAlerts();
        
        // Estado del sistema
        $systemStatus = $this->getSystemStatus();

        return Inertia::render('admin/dashboard', [
            'dashboardStats' => $stats,
            'recentEvents' => $recentEvents,
            'recentUsers' => $recentUsers,
            'systemAlerts' => $systemAlerts,
            'systemStatus' => $systemStatus,
            'timeRange' => $timeRange
        ]);
    }

    private function getStartDate(string $timeRange): Carbon
    {
        return match($timeRange) {
            '1d' => Carbon::now()->subDay(),
            '7d' => Carbon::now()->subWeek(),
            '30d' => Carbon::now()->subMonth(),
            '90d' => Carbon::now()->subMonths(3),
            default => Carbon::now()->subWeek()
        };
    }

    private function getDashboardStats(Carbon $startDate): array
    {
        // Total de usuarios CLIENTES únicamente
        $totalUsers = User::where('role', 'CLIENT')->count(); // Cambié aquí
        $newUsersThisPeriod = User::where('role', 'CLIENT') // Y aquí
            ->where('created_at', '>=', $startDate)->count();
        $previousPeriodUsers = User::where('role', 'CLIENT') // Y aquí
            ->where('created_at', '<', $startDate)
            ->where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(Carbon::now())))
            ->count();
        
        $userGrowth = $previousPeriodUsers > 0 
            ? round((($newUsersThisPeriod - $previousPeriodUsers) / $previousPeriodUsers) * 100)
            : 0;

        // Eventos activos (sin filtro de status, solo eventos con funciones futuras)
        $activeEvents = Event::whereHas('functions', function($query) {
            $query->where('start_time', '>=', Carbon::now());
        })->count();

        $newEventsThisPeriod = Event::where('created_at', '>=', $startDate)->count();
        
        // Ingresos totales (usando el enum de OrderStatus)
        $totalRevenue = Order::where('status', 'CONFIRMED')
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $previousRevenue = Order::where('status', 'CONFIRMED')
            ->where('created_at', '<', $startDate)
            ->where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(Carbon::now())))
            ->sum('total_amount');

        $revenueGrowth = $previousRevenue > 0 
            ? round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100)
            : 0;

        // Tickets vendidos (usando IssuedTicket)
        $ticketsSold = IssuedTicket::whereHas('order', function($query) use ($startDate) {
            $query->where('status', 'CONFIRMED')
                  ->where('created_at', '>=', $startDate);
        })->count();

        return [
            [
                'title' => 'Total Clientes', // Cambié el título para mayor claridad
                'value' => number_format($totalUsers),
                'change' => ($userGrowth >= 0 ? '+' : '') . $userGrowth . '%',
                'changeType' => $userGrowth >= 0 ? 'positive' : 'negative',
                'description' => 'Clientes registrados en el periodo' // Actualicé la descripción
            ],
            [
                'title' => 'Eventos Activos',
                'value' => number_format($activeEvents),
                'change' => '+' . $newEventsThisPeriod,
                'changeType' => 'positive',
                'description' => 'Eventos activos y programados'
            ],
            [
                'title' => 'Ingresos Totales',
                'value' => '$' . number_format($totalRevenue / 1000, 1) . 'K',
                'change' => ($revenueGrowth >= 0 ? '+' : '') . $revenueGrowth . '%',
                'changeType' => $revenueGrowth >= 0 ? 'positive' : 'negative',
                'description' => 'Ingresos en el periodo'
            ],
            [
                'title' => 'Tickets Vendidos',
                'value' => number_format($ticketsSold),
                'change' => '+' . $ticketsSold,
                'changeType' => 'positive',
                'description' => 'Tickets vendidos en el periodo'
            ]
        ];
    }

    private function getRecentEvents(): array
    {
        return Event::with(['organizer', 'functions.ticketTypes'])
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($event) {
                $function = $event->functions->first();
                $totalTickets = $event->functions->sum(function($func) {
                    return $func->ticketTypes->sum('quantity');
                });
                $soldTickets = $event->functions->sum(function($func) {
                    return $func->ticketTypes->sum('quantity_sold');
                });
                $revenue = $event->functions->sum(function($func) {
                    return $func->ticketTypes->sum(function($ticket) {
                        return $ticket->quantity_sold * $ticket->price;
                    });
                });

                // Determinar status basado en las fechas de las funciones
                $status = 'draft';
                if ($event->functions->count() > 0) {
                    $now = Carbon::now();
                    $futureFunction = $event->functions->where('start_time', '>', $now)->first();
                    $pastFunction = $event->functions->where('start_time', '<', $now)->first();
                    
                    if ($futureFunction) {
                        $status = 'active';
                    } elseif ($pastFunction) {
                        $status = 'finished';
                    }
                }

                return [
                    'id' => $event->id,
                    'name' => $event->name, // Usar 'name' en lugar de 'title'
                    'organizer' => $event->organizer->name ?? 'Organizador', // Sin relación person
                    'date' => $function ? $function->start_time->toDateString() : $event->created_at->toDateString(),
                    'status' => $status,
                    'tickets_sold' => $soldTickets,
                    'total_tickets' => $totalTickets,
                    'revenue' => $revenue
                ];
            })->toArray();
    }

    private function getRecentUsers(): array
    {
        return User::with('person')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($user) {
                $purchases = 0;
                $eventsCreated = 0;

                if ($user->role->value === 'client') { // Usar el enum
                    $purchases = Order::where('client_id', $user->id)
                        ->where('status', 'CONFIRMED')
                        ->count();
                } elseif ($user->role->value === 'organizer') {
                    $eventsCreated = Event::where('organizer_id', $user->organizer_id)->count();
                }

                return [
                    'id' => $user->id,
                    'name' => $user->person->name ?? $user->email,
                    'email' => $user->email,
                    'role' => $user->role->value, // Obtener el valor del enum
                    'joined' => $user->created_at->toDateString(),
                    'status' => $user->email_verified_at ? 'active' : 'pending',
                    'purchases' => $purchases,
                    'events_created' => $eventsCreated
                ];
            })->toArray();
    }

    private function getSystemAlerts(): array
    {
        $alerts = [];
        
        // Verificar alto tráfico (ejemplo)
        $recentOrders = Order::where('created_at', '>=', Carbon::now()->subHour())->count();
        if ($recentOrders > 50) {
            $alerts[] = [
                'id' => 1,
                'type' => 'warning',
                'title' => 'Alto tráfico detectado',
                'message' => "Se han procesado {$recentOrders} órdenes en la última hora",
                'time' => 'hace ' . Carbon::now()->diffInMinutes(Carbon::now()->subHour()) . ' min'
            ];
        }

        // Verificar eventos próximos sin tickets
        $eventsWithoutTickets = Event::whereHas('functions', function($query) {
            $query->where('start_time', '>=', Carbon::now())
                  ->where('start_time', '<=', Carbon::now()->addDays(7));
        })->whereDoesntHave('functions.ticketTypes')->count();

        if ($eventsWithoutTickets > 0) {
            $alerts[] = [
                'id' => 2,
                'type' => 'warning',
                'title' => 'Eventos sin tickets',
                'message' => "{$eventsWithoutTickets} eventos próximos no tienen tickets configurados",
                'time' => 'Verificación automática'
            ];
        }

        // Backup simulado
        $alerts[] = [
            'id' => 3,
            'type' => 'success',
            'title' => 'Backup completado',
            'message' => 'Backup diario completado exitosamente',
            'time' => 'hace 6 horas'
        ];

        return $alerts;
    }

    private function getSystemStatus(): array
    {
        return [
            [
                'name' => 'Servidores',
                'status' => 'operational',
                'label' => 'Operativo'
            ],
            [
                'name' => 'Base de Datos',
                'status' => 'operational', 
                'label' => 'Operativo'
            ],
            [
                'name' => 'CDN',
                'status' => 'slow',
                'label' => 'Lento'
            ]
        ];
    }
}
