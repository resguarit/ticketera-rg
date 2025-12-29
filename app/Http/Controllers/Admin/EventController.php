<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Category;
use App\Models\Venue;
use App\Models\Ciudad;
use App\Models\Order;
use App\Models\IssuedTicket;
use App\Services\RevenueService;
use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    public function __construct(private RevenueService $revenueService) {}

    public function index(Request $request): Response
    {
        // Obtener filtros
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $category = $request->get('category', 'all');
        $city = $request->get('city', 'all');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Consulta base con relaciones
        $query = Event::with([
            'organizer',
            'category',
            'venue.ciudad.provincia',
            'functions.ticketTypes'
        ]);

        // Aplicar filtros de búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('organizer', function ($oq) use ($search) {
                        $oq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('venue', function ($vq) use ($search) {
                        $vq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filtro por categoría
        if ($category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('name', $category);
            });
        }

        // Filtro por ciudad
        if ($city !== 'all') {
            $query->whereHas('venue.ciudad', function ($q) use ($city) {
                $q->where('name', $city);
            });
        }

        // Filtro por estado (usando el nuevo enum status)
        if ($status !== 'all') {
            switch ($status) {
                case 'on_sale':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::ON_SALE->value)
                            ->where('is_active', true);
                    });
                    break;
                case 'upcoming':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::UPCOMING->value);
                    });
                    break;
                case 'sold_out':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::SOLD_OUT->value);
                    });
                    break;
                case 'finished':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::FINISHED->value);
                    });
                    break;
                case 'inactive':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::INACTIVE->value)
                            ->orWhere('is_active', false);
                    });
                    break;
                case 'cancelled':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::CANCELLED->value);
                    });
                    break;
                case 'reprogrammed':
                    $query->whereHas('functions', function ($q) {
                        $q->where('status', EventFunctionStatus::REPROGRAMMED->value);
                    });
                    break;
                case 'draft':
                    $query->whereDoesntHave('functions');
                    break;
            }
        }

        // Ordenamiento
        switch ($sortBy) {
            case 'name':
                $query->orderBy('name', $sortDirection);
                break;
            case 'date':
                $query->leftJoin('event_functions', 'events.id', '=', 'event_functions.event_id')
                    ->orderBy('event_functions.start_time', $sortDirection)
                    ->select('events.*');
                break;
            case 'revenue':
                $query->withSum(['functions.ticketTypes' => function ($q) {
                    $q->select(DB::raw('SUM(quantity_sold * price)'));
                }], 'price')
                    ->orderBy('functions_ticket_types_sum_price', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
        }

        // Paginación
        $events = $query->paginate(10)->withQueryString();

        // Actualizar estado de las funciones
        foreach ($events as $event) {
            foreach ($event->functions as $function) {
                try {
                    $function->updateStatus();
                } catch (\Exception $e) {
                }
            }
        }

        // Procesar datos para el frontend
        $eventsData = $events->getCollection()->map(function ($event) {
            $firstFunction = $event->functions->first();
            $totalTickets = $event->functions->sum(function ($func) {
                return $func->ticketTypes->sum('quantity');
            });
            $soldTickets = $event->functions->sum(function ($func) {
                return $func->ticketTypes->sum('quantity_sold');
            });
            $revenue = $event->getRevenue();

            // Determinar estado basado en funciones
            $statusInfo = $this->determineEventStatus($event);

            // Calcular rango de precios
            $priceRange = $this->calculatePriceRange($event);

            return [
                'id' => $event->id,
                'name' => $event->name,
                'organizer' => [
                    'id' => $event->organizer->id,
                    'name' => $event->organizer->name,
                    'email' => $event->organizer->email,
                ],
                'category' => $event->category->name ?? 'Sin categoría',
                'date' => $firstFunction ? $firstFunction->start_time->format('Y-m-d') : null,
                'time' => $firstFunction ? $firstFunction->start_time->format('H:i') : null,
                'datetime' => $firstFunction ? $firstFunction->start_time->toISOString() : null,
                'location' => $event->venue->name ?? 'Sin venue',
                'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ?
                    $event->venue->ciudad->provincia->name : null,
                'status' => $statusInfo['value'],
                'status_label' => $statusInfo['label'],
                'status_color' => $statusInfo['color'],
                'is_active' => $statusInfo['is_active'],
                'tickets_sold' => $soldTickets,
                'total_tickets' => $totalTickets,
                'revenue' => $revenue,
                'price_range' => $priceRange,
                'created_at' => $event->created_at->format('Y-m-d'),
                'created_datetime' => $event->created_at->toISOString(),
                'image_url' => $event->image_url,
                'featured' => $event->featured,
                'functions_count' => $event->functions->count(),
            ];
        });

        // Reemplazar la colección original
        $events->setCollection($eventsData);

        // Estadísticas
        $stats = $this->getEventStats();

        // Filtros para el frontend
        $categories = Category::pluck('name')->unique();
        $cities = Ciudad::orderBy('name')->pluck('name');

        // Estados disponibles del enum
        $statuses = collect(EventFunctionStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ]);

        return Inertia::render('admin/events', [
            'events' => $events,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
                'city' => $city,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'categories' => $categories,
            'cities' => $cities,
            'statuses' => $statuses,
        ]);
    }

    public function show(int $eventId): Response
    {
        $event = Event::with([
            'organizer',
            'category',
            'venue.ciudad.provincia',
            'functions.ticketTypes'
        ])->findOrFail($eventId);

        // Calcular ingresos totales y netos
        $totalRevenue = $event->getRevenue();
        
        // Calcular ingreso neto (sin cargo por servicio)
        $orders = Order::where('status', OrderStatus::PAID)
            ->whereHas('issuedTickets.ticketType.eventFunction', function ($q) use ($event) {
                $q->where('event_id', $event->id);
            })
            ->get();

        $netRevenue = $orders->sum(function($order) {
            $discount = $order->subtotal * ($order->discount ?? 0);
            return $order->subtotal - $discount;
        });

        // Calcular tickets emitidos totales (incluyendo los de lotes)
        $totalIssuedTickets = IssuedTicket::whereHas('ticketType.eventFunction', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        })->count();

        // Datos procesados para el detalle
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url,
            'hero_image_url' => $event->hero_image_url,
            'featured' => $event->featured,
            'total_revenue' => $totalRevenue,
            'net_revenue' => $netRevenue,
            'service_fee' => $totalRevenue - $netRevenue,
            'organizer' => [
                'id' => $event->organizer->id,
                'name' => $event->organizer->name,
                'email' => $event->organizer->email,
                'image_url' => $event->organizer->image_url,
            ],
            'category' => [
                'id' => $event->category->id,
                'name' => $event->category->name,
            ],
            'venue' => [
                'id' => $event->venue->id,
                'name' => $event->venue->name,
                'address' => $event->venue->address,
                'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ?
                    $event->venue->ciudad->provincia->name : null,
                'full_address' => $event->venue->getFullAddressAttribute(),
            ],
            'functions' => $event->functions->map(function ($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'description' => $function->description,
                    'start_time' => $function->start_time->format('Y-m-d H:i:s'),
                    'start_date' => $function->start_time->format('Y-m-d'),
                    'start_time_only' => $function->start_time->format('H:i'),
                    'end_time' => $function->end_time ? $function->end_time->format('Y-m-d H:i:s') : null,
                    'end_date' => $function->end_time ? $function->end_time->format('Y-m-d') : null,
                    'end_time_only' => $function->end_time ? $function->end_time->format('H:i') : null,
                    'is_active' => $function->is_active,
                    'status' => $function->status->value,
                    'status_label' => $function->status->label(),
                    'status_color' => $function->status->color(),
                    'total_tickets' => $function->ticketTypes->sum('quantity'),
                    'function_revenue' => $function->getRevenue(),
                    'ticket_types' => $function->ticketTypes->map(function ($ticketType) {
                        return [
                            'id' => $ticketType->id,
                            'name' => $ticketType->name,
                            'price' => $ticketType->price,
                            'quantity' => $ticketType->quantity,
                            'quantity_sold' => $ticketType->quantity_sold,
                            'ticket_revenue' => $ticketType->getRevenue(),
                            'available' => $ticketType->quantity - $ticketType->quantity_sold,
                        ];
                    }),
                ];
            }),
            'created_at' => $event->created_at->format('Y-m-d'),
            'updated_at' => $event->updated_at->format('Y-m-d H:i:s'),
            'total_issued_tickets' => $totalIssuedTickets,
        ];

        // Actualizar estado de las funciones (nuevo código)
        foreach ($event->functions as $function) {
            $function->updateStatus();
        }

        return Inertia::render('admin/events/show', [
            'event' => $eventData,
        ]);
    }

    public function toggleFunction(Request $request, int $functionId): RedirectResponse
    {
        $function = EventFunction::findOrFail($functionId);

        $function->update([
            'is_active' => !$function->is_active
        ]);

        return redirect()->back()->with(
            'success',
            $function->is_active
                ? 'Función activada correctamente'
                : 'Función desactivada correctamente'
        );
    }

    public function updateFunctionStatus(Request $request, int $functionId): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_column(EventFunctionStatus::cases(), 'value'))
        ]);

        $function = EventFunction::findOrFail($functionId);

        $function->update([
            'status' => $request->status
        ]);

        $statusEnum = EventFunctionStatus::from($request->status);

        return redirect()->back()->with(
            'success',
            "Estado actualizado a: {$statusEnum->label()}"
        );
    }

    public function toggleFeatured(Request $request, int $eventId): RedirectResponse
    {
        $event = Event::findOrFail($eventId);

        $event->update([
            'featured' => !$event->featured
        ]);

        return redirect()->back()->with(
            'success',
            $event->featured
                ? 'Evento marcado como destacado'
                : 'Evento removido de destacados'
        );
    }

    private function getEventStats(): array
    {
        $totalEvents = Event::count();

        $onSaleEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::ON_SALE->value)
                ->where('is_active', true);
        })->count();

        $upcomingEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::UPCOMING->value);
        })->count();

        $soldOutEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::SOLD_OUT->value);
        })->count();

        $finishedEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::FINISHED->value);
        })->count();

        $inactiveEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::INACTIVE->value)
                ->orWhere('is_active', false);
        })->count();

        $cancelledEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::CANCELLED->value);
        })->count();

        $reprogrammedEvents = Event::whereHas('functions', function ($q) {
            $q->where('status', EventFunctionStatus::REPROGRAMMED->value);
        })->count();

        $draftEvents = Event::whereDoesntHave('functions')->count();

        // Calcular tickets vendidos totales
        $totalTicketsSold = $this->revenueService->ticketsSold();

        // Calcular ingresos totales
        $totalRevenue = $this->revenueService->forPlatform();

        return [
            'total' => $totalEvents,
            'on_sale' => $onSaleEvents,
            'upcoming' => $upcomingEvents,
            'sold_out' => $soldOutEvents,
            'finished' => $finishedEvents,
            'inactive' => $inactiveEvents,
            'cancelled' => $cancelledEvents,
            'reprogrammed' => $reprogrammedEvents,
            'draft' => $draftEvents,
            'totalTicketsSold' => $totalTicketsSold,
            'totalRevenue' => $totalRevenue,
        ];
    }

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
            ->sortBy(function ($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

        // Si no hay funciones activas, tomar cualquier función
        if (!$primaryFunction) {
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

    private function calculatePriceRange(Event $event): string
    {
        $prices = [];

        foreach ($event->functions as $function) {
            foreach ($function->ticketTypes as $ticketType) {
                $prices[] = $ticketType->price;
            }
        }

        if (empty($prices)) {
            return '-';
        }

        $minPrice = min($prices);
        $maxPrice = max($prices);

        if ($minPrice == $maxPrice) {
            return number_format($minPrice, 0, ',', '.');
        }

        return number_format($minPrice, 0, ',', '.') . ' - ' . number_format($maxPrice, 0, ',', '.');
    }
}
