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
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    public function __construct(private RevenueService $revenueService)
    {
    }

    public function index(Request $request): Response
    {
        // Obtener filtros
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $category = $request->get('category', 'all');
        $city = $request->get('city', 'all');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Consulta base con relaciones ACTUALIZADA
        $query = Event::with([
            'organizer',
            'category',
            'venue.ciudad.provincia', // NUEVO: incluir ciudad y provincia
            'functions.ticketTypes'
        ]);

        // Aplicar filtros de búsqueda
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('organizer', function($oq) use ($search) {
                      $oq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('venue', function($vq) use ($search) {
                      $vq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por categoría
        if ($category !== 'all') {
            $query->whereHas('category', function($q) use ($category) {
                $q->where('name', $category);
            });
        }

        // ACTUALIZADO: Filtro por ciudad usando la nueva relación
        if ($city !== 'all') {
            $query->whereHas('venue.ciudad', function($q) use ($city) {
                $q->where('name', $city);
            });
        }

        // Filtro por estado (basado en funciones)
        if ($status !== 'all') {
            switch ($status) {
                case 'active':
                    $query->whereHas('functions', function($q) {
                        $q->where('is_active', true)
                          ->where('start_time', '>', Carbon::now());
                    });
                    break;
                case 'inactive':
                    $query->whereHas('functions', function($q) {
                        $q->where('is_active', false);
                    });
                    break;
                case 'finished':
                    $query->whereHas('functions', function($q) {
                        $q->where('start_time', '<', Carbon::now());
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
                $query->withSum(['functions.ticketTypes' => function($q) {
                    $q->select(DB::raw('SUM(quantity_sold * price)'));
                }], 'price')
                ->orderBy('functions_ticket_types_sum_price', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
        }

        // Paginación
        $events = $query->paginate(10)->withQueryString();

        // Procesar datos para el frontend
        $eventsData = $events->getCollection()->map(function ($event) {
            $firstFunction = $event->functions->first();
            $totalTickets = $event->functions->sum(function($func) {
                return $func->ticketTypes->sum('quantity');
            });
            $soldTickets = $event->functions->sum(function($func) {
                return $func->ticketTypes->sum('quantity_sold');
            });
            $revenue = $event->getRevenue();

            // Determinar estado basado en funciones
            $status = $this->determineEventStatus($event);

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
                // ACTUALIZADO: usar la nueva estructura de ciudad
                'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                    $event->venue->ciudad->provincia->name : null,
                'status' => $status,
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
        
        // ACTUALIZADO: Obtener ciudades de la nueva tabla
        $cities = Ciudad::orderBy('name')->pluck('name');

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
        ]);
    }

    public function show(int $eventId): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia en la consulta
        $event = Event::with([
            'organizer',
            'category',
            'venue.ciudad.provincia',
            'functions.ticketTypes'
        ])->findOrFail($eventId);

        // Datos procesados para el detalle
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url, // CORREGIDO: usar image_url en lugar de banner_url
            'hero_image_url' => $event->hero_image_url,
            'featured' => $event->featured,
            'total_revenue' => $event->getRevenue(),
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
            'functions' => $event->functions->map(function($function) {
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
                    'total_tickets' => $function->ticketTypes->sum('quantity'),
                    'function_revenue' => $function->getRevenue(),
                    'ticket_types' => $function->ticketTypes->map(function($ticketType) {
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
        ];

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

        return redirect()->back()->with('success', 
            $function->is_active 
                ? 'Función activada correctamente' 
                : 'Función desactivada correctamente'
        );
    }

    public function toggleFeatured(Request $request, int $eventId): RedirectResponse
    {
        $event = Event::findOrFail($eventId);
        
        $event->update([
            'featured' => !$event->featured
        ]);

        return redirect()->back()->with('success', 
            $event->featured 
                ? 'Evento marcado como destacado' 
                : 'Evento removido de destacados'
        );
    }

    private function getEventStats(): array
    {
        $totalEvents = Event::count();
        
        $activeEvents = Event::whereHas('functions', function($q) {
            $q->where('is_active', true)
              ->where('start_time', '>', Carbon::now());
        })->count();

        $inactiveEvents = Event::whereHas('functions', function($q) {
            $q->where('is_active', false);
        })->count();

        $finishedEvents = Event::whereHas('functions', function($q) {
            $q->where('start_time', '<', Carbon::now());
        })->whereDoesntHave('functions', function($q) {
            $q->where('start_time', '>', Carbon::now());
        })->count();

        $draftEvents = Event::whereDoesntHave('functions')->count();

        // Calcular tickets vendidos totales
        $totalTicketsSold = $this->revenueService->ticketsSold();

        // Calcular ingresos totales
        $totalRevenue = $this->revenueService->forPlatform();

        return [
            'total' => $totalEvents,
            'active' => $activeEvents,
            'inactive' => $inactiveEvents,
            'finished' => $finishedEvents,
            'draft' => $draftEvents,
            'totalTicketsSold' => $totalTicketsSold,
            'totalRevenue' => $totalRevenue,
        ];
    }

    private function determineEventStatus(Event $event): string
    {
        if ($event->functions->isEmpty()) {
            return 'draft';
        }

        $now = Carbon::now();
        $hasActiveFutureFunctions = $event->functions
            ->where('is_active', true)
            ->where('start_time', '>', $now)
            ->isNotEmpty();

        $hasInactiveFunctions = $event->functions
            ->where('is_active', false)
            ->isNotEmpty();

        $allFunctionsFinished = $event->functions
            ->where('start_time', '>', $now)
            ->isEmpty();

        if ($hasActiveFutureFunctions) {
            return 'active';
        } elseif ($hasInactiveFunctions && !$allFunctionsFinished) {
            return 'inactive';
        } elseif ($allFunctionsFinished) {
            return 'finished';
        }

        return 'draft';
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