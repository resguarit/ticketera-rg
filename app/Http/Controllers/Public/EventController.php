<?php
// filepath: app/Http/Controllers/Public/EventController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Category;
use App\Models\Ciudad;
use App\Services\TicketLockService;
use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    protected TicketLockService $ticketLockService;

    public function __construct(TicketLockService $ticketLockService)
    {
        $this->ticketLockService = $ticketLockService;
    }

    public function index(Request $request): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia
        $query = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes']);

        // Filtros existentes...
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhereHas('venue', function ($venue) use ($search) {
                        $venue->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->filled('category') && $request->get('category') !== 'all') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->get('category') . '%');
            });
        }

        if ($request->filled('city') && $request->get('city') !== 'all') {
            $city = $request->get('city');
            $query->whereHas('venue.ciudad', function ($q) use ($city) {
                $q->where('name', $city);
            });
        }

        $events = $query->get();

        // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
        foreach ($events as $event) {
            foreach ($event->functions as $function) {
                $function->updateStatus();
            }
        }

        // Categorías para filtros
        $categories = Category::all()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon ?: 'default',
                'color' => 'primary',
            ];
        });

        $cities = Ciudad::orderBy('name')->get();

        return Inertia::render('public/events', [
            'events' => EventResource::collection($events)->additional([
                'with_ticket_info' => true
            ]),
            'categories' => $categories,
            'cities' => $cities,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', 'all'),
                'city' => $request->get('city', 'all'),
                'sortBy' => $request->get('sortBy', 'date'),
            ]
        ]);
    }

    public function show(Event $event): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia
        $event->load(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes.sector']);

        // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
        foreach ($event->functions as $function) {
            $function->updateStatus();
        }

        // Preparar funciones con sus tickets
        $functions = $event->functions
            ->filter(function ($function) {
                // Solo mostrar funciones activas al público
                return $function->is_active;
            })
            ->map(function ($function) {
                // Estados donde NO se deben mostrar tickets
                $hideTicketsStates = [
                    EventFunctionStatus::CANCELLED->value,
                    EventFunctionStatus::FINISHED->value,
                    EventFunctionStatus::UPCOMING->value,
                    EventFunctionStatus::INACTIVE->value,
                ];

                $shouldShowTickets = !in_array($function->status->value, $hideTicketsStates);

                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'description' => $function->description,
                    'start_time' => $function->start_time,
                    'end_time' => $function->end_time ? $function->end_time : null,
                    'date' => $function->start_time?->format('d M Y'),
                    'time' => $function->start_time?->format('H:i'),
                    'day_name' => $function->start_time?->locale('es')->format('l'),
                    'is_active' => $function->is_active,
                    'status' => $function->status->value,
                    'status_label' => $function->status->label(),
                    'status_color' => $function->status->color(),
                    'should_show_tickets' => $shouldShowTickets,
                    'ticketTypes' => $shouldShowTickets
                        ? $function->ticketTypes
                        ->filter(function ($ticket) {
                            // NUEVO: Filtrar por fechas de venta además de is_hidden
                            $now = now();

                            // No mostrar tickets ocultos
                            if ($ticket->is_hidden) {
                                return false;
                            }

                            // No mostrar si la venta aún no ha comenzado
                            if ($ticket->sales_start_date && $now->lt($ticket->sales_start_date)) {
                                return false;
                            }

                            // No mostrar si la venta ya ha finalizado
                            if ($ticket->sales_end_date && $now->gt($ticket->sales_end_date)) {
                                return false;
                            }

                            return true;
                        })
                        ->map(function ($ticket) {
                            $lockedQuantity = $this->ticketLockService->getLockedQuantity($ticket->id);
                            $realAvailable = max(0, ($ticket->quantity - $ticket->quantity_sold) - $lockedQuantity);

                            return [
                                'id' => $ticket->id,
                                'name' => $ticket->name . ($ticket->sector ? ' - ' . $ticket->sector->name : ''),
                                'description' => $ticket->description,
                                'price' => (float) $ticket->price,
                                'available' => $realAvailable,
                                'quantity' => $ticket->quantity,
                                'quantity_sold' => $ticket->quantity_sold,
                                'locked_quantity' => $lockedQuantity,
                                'max_purchase_quantity' => $ticket->max_purchase_quantity,
                                'sales_start_date' => $ticket->sales_start_date,
                                'sales_end_date' => $ticket->sales_end_date,
                                'is_hidden' => $ticket->is_hidden,
                                'is_bundle' => $ticket->is_bundle,
                                'bundle_quantity' => $ticket->bundle_quantity,
                                'color' => 'from-blue-500 to-cyan-500',
                            ];
                        })
                        ->values()
                        : [], // Array vacío si no se deben mostrar tickets
                ];
            })
            ->values();

        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url ?: "/placeholder.svg?height=400&width=800",
            'hero_image_url' => $event->hero_image_url,
            'location' => $event->venue->name,
            'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
            'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ?
                $event->venue->ciudad->provincia->name : null,
            'full_address' => $event->venue->getFullAddressAttribute(),
            'category' => strtolower($event->category->name),
            'reviews' => 1247,
            'duration' => '8 horas',
            'ageRestriction' => '18+',
            'functions' => $functions,
            'venue' => [
                'id' => $event->venue->id,
                'name' => $event->venue->name,
                'address' => $event->venue->address,
                'coordinates' => $event->venue->coordinates,
                'full_address' => $event->venue->getFullAddressAttribute(),
            ],
            'date' => $functions->first()['date'] ?? 'Fecha por confirmar',
            'time' => $functions->first()['time'] ?? '',
        ];

        return Inertia::render('public/eventdetail', [
            'eventData' => $eventData
        ]);
    }

    public function getAvailability(Event $event, Request $request)
    {
        $functionId = $request->get('function_id');
        $function = $event->functions()->with('ticketTypes.sector')->find($functionId);

        if (!$function) {
            return response()->json(['error' => 'Function not found'], 404);
        }

        // ACTUALIZAR ESTADO DE LA FUNCIÓN
        $function->updateStatus();

        $now = now();

        $ticketTypes = $function->ticketTypes
            ->filter(function ($ticket) use ($now) {
                // NUEVO: Aplicar el mismo filtro de fechas de venta
                if ($ticket->is_hidden) {
                    return false;
                }

                // No mostrar si la venta aún no ha comenzado
                if ($ticket->sales_start_date && $now->lt($ticket->sales_start_date)) {
                    return false;
                }

                // No mostrar si la venta ya ha finalizado
                if ($ticket->sales_end_date && $now->gt($ticket->sales_end_date)) {
                    return false;
                }

                return true;
            })
            ->map(function ($ticket) {
                $lockedQuantity = $this->ticketLockService->getLockedQuantity($ticket->id);
                $realAvailable = max(0, ($ticket->quantity - $ticket->quantity_sold) - $lockedQuantity);

                return [
                    'id' => $ticket->id,
                    'available' => $realAvailable,
                    'locked_quantity' => $lockedQuantity,
                ];
            })
            ->values();

        return response()->json([
            'ticket_types' => $ticketTypes,
            'function_status' => [
                'value' => $function->status->value,
                'label' => $function->status->label(),
                'color' => $function->status->color(),
            ]
        ]);
    }
}
