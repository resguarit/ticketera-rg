<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use App\Models\IssuedTicket;
use App\Services\RevenueService;
use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(private RevenueService $revenueService)
    {
    }

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
        $totalUsers = User::where('role', 'CLIENT')->count();
        $newUsersThisPeriod = User::where('role', 'CLIENT')->where('created_at', '>=', $startDate)->count();
        $previousPeriodUsers = User::where('role', 'CLIENT')
            ->where('created_at', '<', $startDate)
            ->where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(Carbon::now())))
            ->count();
        
        $userGrowth = $previousPeriodUsers > 0 
            ? round((($newUsersThisPeriod - $previousPeriodUsers) / $previousPeriodUsers) * 100)
            : 0;

        // Eventos activos (usando el nuevo enum status y is_active)
        $activeEvents = Event::whereHas('functions', function($query) {
            $query->whereIn('status', [
                EventFunctionStatus::ON_SALE->value,
                EventFunctionStatus::UPCOMING->value,
            ])
            ->where('is_active', true)
            ->where('start_time', '>=', Carbon::now());
        })->count();
        
        $newEventsThisPeriod = Event::where('created_at', '>=', $startDate)->count();
        
        // Ingresos totales
        $totalRevenue = $this->revenueService->forPlatform($startDate, Carbon::now());
        $previousRevenue = $this->revenueService->forPlatform($startDate->copy()->subDays($startDate->diffInDays(Carbon::now())), $startDate);

        $revenueGrowth = $previousRevenue > 0 
            ? round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100)
            : 0;

        $ticketsSold = $this->revenueService->ticketsSold($startDate);

        return [
            [
                'title' => 'Total Clientes',
                'value' => number_format($totalUsers),
                'change' => ($userGrowth >= 0 ? '+' : '') . $userGrowth . '%',
                'changeType' => $userGrowth >= 0 ? 'positive' : 'negative',
                'description' => 'Clientes registrados en el periodo'
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
                'value' => number_format($totalRevenue, 2),
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
        return Event::with(['organizer', 'venue.ciudad.provincia', 'functions.ticketTypes'])
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
                $revenue = $event->getRevenue();

                // Determinar status usando el enum y la lógica de prioridad
                $statusInfo = $this->determineEventStatus($event);

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'organizer' => $event->organizer->name ?? 'Organizador',
                    'date' => $function ? $function->start_time->toDateString() : $event->created_at->toDateString(),
                    'status' => $statusInfo['value'],
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'is_active' => $statusInfo['is_active'],
                    'tickets_sold' => $soldTickets,
                    'total_tickets' => $totalTickets,
                    'revenue' => $revenue,
                    'venue' => $event->venue->name ?? 'Sin venue',
                    'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                    'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                        $event->venue->ciudad->provincia->name : null,
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

                if ($user->role->value === 'client') {
                    $purchases = Order::where('client_id', $user->id)
                        ->where('status', 'PAID')
                        ->count();
                } elseif ($user->role->value === 'organizer') {
                    $eventsCreated = Event::where('organizer_id', $user->organizer_id)->count();
                }

                return [
                    'id' => $user->id,
                    'name' => $user->person->name ?? $user->email,
                    'last_name' => $user->person->last_name,
                    'email' => $user->email,
                    'role' => $user->role->value,
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
                  ->where('start_time', '<=', Carbon::now()->addDays(7))
                  ->whereIn('status', [
                      EventFunctionStatus::ON_SALE->value,
                      EventFunctionStatus::UPCOMING->value,
                  ])
                  ->where('is_active', true);
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

        // Verificar eventos cancelados recientes
        $recentCancelledEvents = Event::whereHas('functions', function($query) {
            $query->where('status', EventFunctionStatus::CANCELLED->value)
                  ->where('updated_at', '>=', Carbon::now()->subDay());
        })->count();

        if ($recentCancelledEvents > 0) {
            $alerts[] = [
                'id' => 3,
                'type' => 'error',
                'title' => 'Eventos cancelados',
                'message' => "{$recentCancelledEvents} eventos fueron cancelados en las últimas 24 horas",
                'time' => 'Últimas 24 horas'
            ];
        }

        // Verificar eventos agotados próximos
        $upcomingSoldOut = Event::whereHas('functions', function($query) {
            $query->where('status', EventFunctionStatus::SOLD_OUT->value)
                  ->where('start_time', '>=', Carbon::now())
                  ->where('start_time', '<=', Carbon::now()->addWeek());
        })->count();

        if ($upcomingSoldOut > 0) {
            $alerts[] = [
                'id' => 4,
                'type' => 'info',
                'title' => 'Eventos agotados',
                'message' => "{$upcomingSoldOut} eventos próximos están agotados",
                'time' => 'Próxima semana'
            ];
        }

        // Verificar funciones inactivas con fechas futuras
        $inactiveFutureFunctions = Event::whereHas('functions', function($query) {
            $query->where('is_active', false)
                  ->where('start_time', '>=', Carbon::now())
                  ->whereIn('status', [
                      EventFunctionStatus::ON_SALE->value,
                      EventFunctionStatus::UPCOMING->value,
                  ]);
        })->count();

        if ($inactiveFutureFunctions > 0) {
            $alerts[] = [
                'id' => 5,
                'type' => 'warning',
                'title' => 'Funciones inactivas',
                'message' => "{$inactiveFutureFunctions} funciones futuras están marcadas como inactivas",
                'time' => 'Verificación automática'
            ];
        }

        return $alerts;
    }

    private function getSystemStatus(): array
    {
        $status = [];

        // 1. Estado de la Base de Datos
        try {
            $dbStart = microtime(true);
            DB::connection()->getPdo();
            $dbTime = (microtime(true) - $dbStart) * 1000; // Convertir a ms
            
            $dbStatus = 'operational';
            $dbLabel = 'Operativo';
            $dbDetails = round($dbTime, 2) . 'ms';
            
            if ($dbTime > 100) {
                $dbStatus = 'slow';
                $dbLabel = 'Lento';
            }
            if ($dbTime > 500) {
                $dbStatus = 'down';
                $dbLabel = 'Crítico';
            }
        } catch (\Exception $e) {
            $dbStatus = 'down';
            $dbLabel = 'Desconectado';
            $dbDetails = 'Error de conexión';
        }

        $status[] = [
            'name' => 'Base de Datos',
            'status' => $dbStatus,
            'label' => $dbLabel,
            'details' => $dbDetails ?? null
        ];

        // 2. Estado del Cache
        try {
            $cacheStart = microtime(true);
            Cache::put('health_check', true, 1);
            $cacheResult = Cache::get('health_check');
            $cacheTime = (microtime(true) - $cacheStart) * 1000;
            
            $cacheStatus = $cacheResult ? 'operational' : 'down';
            $cacheLabel = $cacheResult ? 'Operativo' : 'Fallo';
            $cacheDetails = $cacheResult ? round($cacheTime, 2) . 'ms' : 'Sin respuesta';
            
            if ($cacheTime > 50 && $cacheResult) {
                $cacheStatus = 'slow';
                $cacheLabel = 'Lento';
            }
        } catch (\Exception $e) {
            $cacheStatus = 'down';
            $cacheLabel = 'Error';
            $cacheDetails = 'Fallo de cache';
        }

        $status[] = [
            'name' => 'Sistema de Cache',
            'status' => $cacheStatus,
            'label' => $cacheLabel,
            'details' => $cacheDetails
        ];

        // 3. Uso de Memoria
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ini_get('memory_limit');
        $memoryLimitBytes = $this->parseBytes($memoryLimit);
        $memoryPercent = ($memoryUsage / $memoryLimitBytes) * 100;

        $memoryStatus = 'operational';
        $memoryLabel = 'Normal';
        if ($memoryPercent > 70) {
            $memoryStatus = 'slow';
            $memoryLabel = 'Alto';
        }
        if ($memoryPercent > 90) {
            $memoryStatus = 'down';
            $memoryLabel = 'Crítico';
        }

        $status[] = [
            'name' => 'Memoria PHP',
            'status' => $memoryStatus,
            'label' => $memoryLabel,
            'details' => $this->formatBytes($memoryUsage) . ' / ' . $memoryLimit . ' (' . round($memoryPercent, 1) . '%)'
        ];

        // 4. Espacio en Disco
        $diskFree = disk_free_space('/');
        $diskTotal = disk_total_space('/');
        $diskUsedPercent = (($diskTotal - $diskFree) / $diskTotal) * 100;

        $diskStatus = 'operational';
        $diskLabel = 'Normal';
        if ($diskUsedPercent > 80) {
            $diskStatus = 'slow';
            $diskLabel = 'Alto';
        }
        if ($diskUsedPercent > 95) {
            $diskStatus = 'down';
            $diskLabel = 'Crítico';
        }

        $status[] = [
            'name' => 'Espacio en Disco',
            'status' => $diskStatus,
            'label' => $diskLabel,
            'details' => $this->formatBytes($diskFree) . ' libre (' . round(100 - $diskUsedPercent, 1) . '%)'
        ];

        // 5. Cola de Trabajos (Jobs Queue)
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            $queueStatus = 'operational';
            $queueLabel = 'Normal';
            $queueDetails = '0 trabajos fallidos';

            if ($failedJobs > 0) {
                $queueStatus = 'slow';
                $queueLabel = 'Atención';
                $queueDetails = $failedJobs . ' trabajos fallidos';
            }
            if ($failedJobs > 10) {
                $queueStatus = 'down';
                $queueLabel = 'Crítico';
            }
        } catch (\Exception $e) {
            $queueStatus = 'operational';
            $queueLabel = 'N/A';
            $queueDetails = 'No configurado';
        }

        $status[] = [
            'name' => 'Cola de Trabajos',
            'status' => $queueStatus,
            'label' => $queueLabel,
            'details' => $queueDetails
        ];

        return $status;
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
            ->filter(fn($f) => $f->is_active) // Priorizar funciones activas
            ->sortBy(function($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

        // Si no hay funciones activas, tomar cualquier función
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

    private function parseBytes(string $size): int
    {
        $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
        $size = preg_replace('/[^0-9\.]/', '', $size);
        
        if ($unit) {
            return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
        }
        
        return round($size);
    }

    private function formatBytes(int $size, int $precision = 2): string
    {
        $base = log($size, 1024);
        $suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];

        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
    }
}
