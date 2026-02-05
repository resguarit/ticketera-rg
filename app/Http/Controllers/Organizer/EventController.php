<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Services\RevenueService;
use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(private RevenueService $revenueService) {}

    /**
     * Obtiene el organizador correcto considerando impersonación
     */
    private function getOrganizer(Request $request): \App\Models\Organizer
    {
        if ($request->session()->has('impersonated_organizer_id')) {
            return \App\Models\Organizer::findOrFail($request->session()->get('impersonated_organizer_id'));
        }
        
        return Auth::user()->organizer;
    }

    public function index(Request $request): Response
    {
        // 🔧 Usar el método helper
        $organizer = $this->getOrganizer($request);

        // Obtener filtros del request
        $filters = [
            'search' => $request->get('search', ''),
            'category_id' => $request->get('category_id', 'all'),
            'venue_id' => $request->get('venue_id', 'all'),
            'status' => $request->get('status', 'all'),
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_direction' => $request->get('sort_direction', 'desc'),
            'include_archived' => $request->boolean('include_archived'),
            'price_min' => $request->get('price_min', ''),
            'price_max' => $request->get('price_max', ''),
        ];

        // Query base de eventos
        $query = $organizer->events()
            ->when(!$filters['include_archived'], function ($query) {
                $query->where('is_archived', false);
            })
            ->with(['category', 'venue', 'organizer', 'functions.ticketTypes']);

        // Aplicar filtro de búsqueda
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        // Aplicar filtro por categoría
        if ($filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        // Aplicar filtro por venue
        if ($filters['venue_id'] !== 'all') {
            $query->where('venue_id', $filters['venue_id']);
        }

        // Aplicar filtro por estado usando el enum
        if ($filters['status'] !== 'all') {
            $query->whereHas('functions', function ($q) use ($filters) {
                $q->where('status', $filters['status']);
            });
        }

        // Aplicar ordenamiento
        switch ($filters['sort_by']) {
            case 'name':
                $query->orderBy('name', $filters['sort_direction']);
                break;
            default:
                $query->orderBy('created_at', $filters['sort_direction']);
        }

        $events = $query->get()
            ->map(function ($event) {
                // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
                foreach ($event->functions as $function) {
                    $function->updateStatus();
                }

                // Calcular precios mínimo y máximo
                $functions = $event->functions->load('ticketTypes');
                $allPrices = $functions->flatMap(function ($function) {
                    return $function->ticketTypes->pluck('price');
                })->filter();

                $minPrice = $allPrices->min() ?? 0;
                $maxPrice = $allPrices->max() ?? 0;

                // Próxima función activa
                $nextFunction = $event->functions
                    ->where('is_active', true)
                    ->where('start_time', '>=', now())
                    ->sortBy('start_time')
                    ->first();

                // Determinar estado del evento
                $statusInfo = $this->determineEventStatus($event);

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'image_url' => $event->image_url,
                    'featured' => $event->featured,
                    'is_archived' => $event->is_archived,
                    'category' => $event->category,
                    'venue' => $event->venue,
                    'organizer' => $event->organizer,
                    'created_at' => $event->created_at,
                    'updated_at' => $event->updated_at,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                    'next_function_date' => $nextFunction ? $nextFunction->start_time : null,
                    'functions_count' => $event->functions->count(),
                    'status' => $statusInfo['value'],
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'is_active' => $statusInfo['is_active'],
                    'functions' => $event->functions->map(function ($function) {
                        return [
                            'id' => $function->id,
                            'name' => $function->name,
                            'description' => $function->description,
                            'start_time' => $function->start_time,
                            'end_time' => $function->end_time ? $function->end_time : null,
                            'date' => $function->start_time?->format('d M Y'),
                            'time' => $function->start_time?->format('H:i'),
                            'formatted_date' => $function->start_time?->format('Y-m-d'),
                            'day_name' => $function->start_time?->locale('es')->isoFormat('dddd'),
                            'is_active' => $function->is_active,
                            'status' => $function->status->value,
                            'status_label' => $function->status->label(),
                            'status_color' => $function->status->color(),
                        ];
                    }),
                ];
            });

        // Obtener categorías y venues para los selects
        $categories = \App\Models\Category::select('id', 'name')
            ->orderBy('name')
            ->get();

        $venues = \App\Models\Venue::select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        // Estados disponibles del enum
        $statuses = collect(EventFunctionStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ]);

        return Inertia::render('organizer/events/index', [
            'events' => $events,
            'categories' => $categories,
            'venues' => $venues,
            'statuses' => $statuses,
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        // 🔧 Usar el método helper
        $organizer = $this->getOrganizer($request);

        // Get categories for select
        $categories = \App\Models\Category::select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get venues for select
        $venues = \App\Models\Venue::select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        // Estados disponibles del enum
        $statuses = collect(EventFunctionStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'color' => $status->color(),
        ]);

        return Inertia::render('organizer/events/new', [
            'categories' => $categories,
            'venues' => $venues,
            'statuses' => $statuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'banner_url' => 'nullable|image|max:2048',
            'hero_banner_url' => 'nullable|image|max:5120',
            'category_id' => 'required|exists:categories,id',
            'venue_id' => 'required|exists:venues,id',
            'functions' => 'required|array|min:1',
            'functions.*.name' => 'required|string|max:255',
            'functions.*.description' => 'nullable|string',
            'functions.*.start_time' => 'required|date',
            'functions.*.end_time' => 'nullable|date|after:functions.*.start_time',
            'functions.*.status' => 'nullable|in:' . implode(',', array_column(EventFunctionStatus::cases(), 'value')),
        ]);

        try {
            DB::beginTransaction();

            // 🔧 Usar el método helper
            $organizer = $this->getOrganizer($request);

            // Handle banner upload
            $bannerPath = null;
            if ($request->hasFile('banner_url')) {
                $bannerPath = $request->file('banner_url')->store('events/banners', 'public');
            }

            // Handle hero banner upload
            $heroBannerPath = null;
            if ($request->hasFile('hero_banner_url')) {
                $heroBannerPath = $request->file('hero_banner_url')->store('events/hero-banners', 'public');
            }

            // Create event
            $event = Event::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'banner_url' => $bannerPath,
                'hero_banner_url' => $heroBannerPath,
                'category_id' => $validated['category_id'],
                'venue_id' => $validated['venue_id'],
                'organizer_id' => $organizer->id,
                'tax' => $organizer->tax,
            ]);

            // Create functions with status
            foreach ($validated['functions'] as $functionData) {
                $event->functions()->create([
                    'name' => $functionData['name'],
                    'description' => $functionData['description'] ?? null,
                    'start_time' => $functionData['start_time'],
                    'end_time' => $functionData['end_time'] ?? null,
                    'status' => $functionData['status'] ?? EventFunctionStatus::UPCOMING->value,
                ]);
            }

            DB::commit();

            return redirect()->route('organizer.events.index')
                ->with('success', 'Evento creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollback();

            // Delete uploaded files if they exist
            if (isset($bannerPath)) {
                Storage::disk('public')->delete($bannerPath);
            }
            if (isset($heroBannerPath)) {
                Storage::disk('public')->delete($heroBannerPath);
            }

            return back()->withErrors(['error' => 'Error al crear el evento: ' . $e->getMessage()]);
        }
    }

    public function edit(Request $request, Event $event): Response
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para editar este evento');
        }

        // Cargar relaciones
        $event->load(['functions']);

        // Agregar hero_image_url al evento que se pasa al frontend
        $eventData = $event->toArray();
        $eventData['hero_image_url'] = $event->hero_image_url;

        // Get categories for select
        $categories = \App\Models\Category::select('id', 'name')->orderBy('name')->get();

        // Get venues for select
        $venues = \App\Models\Venue::select('id', 'name', 'address')->orderBy('name')->get();

        return Inertia::render('organizer/events/edit', [
            'event' => $eventData,
            'categories' => $categories,
            'venues' => $venues,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para actualizar este evento');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'banner_url' => 'nullable|image|max:2048',
            'hero_banner_url' => 'nullable|image|max:5120',
            'category_id' => 'required|exists:categories,id',
            'venue_id' => 'required|exists:venues,id',
        ]);

        try {
            DB::beginTransaction();

            // Preservar las rutas existentes por defecto
            $bannerPath = $event->banner_url;
            $heroBannerPath = $event->hero_banner_url;

            // Handle normal banner
            if ($request->hasFile('banner_url')) {
                if ($event->banner_url) {
                    Storage::disk('public')->delete($event->banner_url);
                }
                $bannerPath = $request->file('banner_url')->store('events/banners', 'public');
            }

            // Handle hero banner
            if ($request->hasFile('hero_banner_url')) {
                if ($event->hero_banner_url) {
                    Storage::disk('public')->delete($event->hero_banner_url);
                }
                $heroBannerPath = $request->file('hero_banner_url')->store('events/hero-banners', 'public');
            }

            // Update event
            $event->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'banner_url' => $bannerPath,
                'category_id' => $validated['category_id'],
                'venue_id' => $validated['venue_id'],
                'hero_banner_url' => $heroBannerPath,
            ]);

            DB::commit();

            return redirect()->route('organizer.events.index')
                ->with('success', 'Evento actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al actualizar el evento: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function toggleArchive(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para archivar este evento');
        }

        $event->update(['is_archived' => !$event->is_archived]);

        return redirect()->back()->with('success', 'El estado del evento ha sido actualizado.');
    }

    public function manage(Request $request, Event $event): Response
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento');
        }

        // Cargar el evento con todas sus relaciones
        $event->load(['category', 'venue', 'organizer', 'functions.ticketTypes']);

        // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
        foreach ($event->functions as $function) {
            $function->updateStatus();
        }

        // Calcular estadísticas del evento
        $totalEntradasVendidas = 0;
        $totalTicketsEmitidos = 0;

        foreach ($event->functions as $function) {
            foreach ($function->ticketTypes as $ticketType) {
                if ($ticketType->is_bundle) {
                    $lotesVendidos = $ticketType->issuedTickets()
                        ->whereHas('order', function($q) {
                            $q->where('status', \App\Enums\OrderStatus::PAID);
                        })
                        ->distinct('order_id')
                        ->count('order_id');
                    
                    $totalEntradasVendidas += $lotesVendidos;
                    $totalTicketsEmitidos += $lotesVendidos * ($ticketType->bundle_quantity ?? 1);
                } else {
                    $vendidos = $ticketType->issuedTickets()
                        ->whereHas('order', function($q) {
                            $q->where('status', \App\Enums\OrderStatus::PAID);
                        })
                        ->count();
                    
                    $totalEntradasVendidas += $vendidos;
                    $totalTicketsEmitidos += $vendidos;
                }
            }
        }

        // Formatear los datos del evento (tu código existente de mapeo)
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url,
            'featured' => $event->featured,
            'is_archived' => $event->is_archived,
            'category' => $event->category,
            'venue' => $event->venue,
            'organizer' => $event->organizer,
            'created_at' => $event->created_at,
            'updated_at' => $event->updated_at,
            'net_revenue' => $this->revenueService->netRevenueForEvent($event),
            'entradas_vendidas' => $totalEntradasVendidas,
            'tickets_emitidos' => $totalTicketsEmitidos,
        ];

        return Inertia::render('organizer/events/manage', [
            'event' => $eventData,
            'currentDateTime' => now()->toISOString(),
        ]);
    }

    public function tickets(Request $request, Event $event): Response
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento');
        }

        // Cargar el evento con todas sus relaciones incluyendo tipos de entradas
        // Cargar el evento con todas sus relaciones incluyendo tipos de entradas
        $event->load([
            'functions.ticketTypes.issuedTickets.order',
            'category',
            'venue',
            'organizer'
        ]);

        // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
        foreach ($event->functions as $function) {
            $function->updateStatus();
        }

        // Formatear los datos del evento
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url,
            'featured' => $event->featured,
            'category' => $event->category,
            'venue' => $event->venue,
            'organizer' => $event->organizer,
            'created_at' => $event->created_at,
            'updated_at' => $event->updated_at,
            'functions' => $event->functions->map(function ($function) {
                $ticketTypes = $function->ticketTypes;
                $totalLotes = (int) $ticketTypes->sum('quantity');
                $lotesVendidos = (int) $ticketTypes->sum('quantity_sold');
                $entradasEmitidas = (int) $ticketTypes->sum(function ($ticketType) {
                    $sold = (int) $ticketType->quantity_sold;
                    return $ticketType->is_bundle ? $sold * ($ticketType->bundle_quantity ?? 1) : $sold;
                });
                $availableLotes = max(0, $totalLotes - $lotesVendidos);
                $netRevenue = $this->revenueService->netRevenueForFunction($function);
                $visibleTickets = (int) $ticketTypes->where('is_hidden', false)->count();
                $totalTypes = (int) $ticketTypes->count();

                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'description' => $function->description,
                    'start_time' => $function->start_time,
                    'end_time' => $function->end_time,
                    'date' => $function->start_time?->format('d M Y'),
                    'time' => $function->start_time?->format('H:i'),
                    'formatted_date' => $function->start_time?->format('Y-m-d'),
                    'day_name' => $function->start_time?->locale('es')->isoFormat('dddd'),
                    'is_active' => $function->is_active,
                    'status' => $function->status->value,
                    'status_label' => $function->status->label(),
                    'status_color' => $function->status->color(),
                    'total_lotes' => $totalLotes,
                    'lotes_vendidos' => $lotesVendidos,
                    'entradas_emitidas' => $entradasEmitidas,
                    'available_lotes' => $availableLotes,
                    'stats' => [
                        'totalTickets' => $totalLotes,
                        'soldTickets' => $lotesVendidos,
                        'availableTickets' => $availableLotes,
                        'entradasEmitidas' => $entradasEmitidas,
                        'totalRevenue' => (float) $netRevenue,
                        'visibleTickets' => $visibleTickets,
                        'totalTypes' => $totalTypes,
                    ],
                    'ticketTypes' => $function->ticketTypes->map(function ($ticketType) {
                        $actualSoldTickets = (int) $ticketType->quantity_sold;
                        $availableTickets = max(0, $ticketType->quantity - $actualSoldTickets);
                        $soldPercentage = $ticketType->quantity > 0 ? ($actualSoldTickets / $ticketType->quantity) * 100 : 0;
                        $totalIncome = $this->revenueService->netRevenueForTicketType($ticketType);

                        if ($totalIncome === null) {
                            $totalIncome = 0.0;
                        }

                        return [
                            'id' => $ticketType->id,
                            'name' => $ticketType->name . ($ticketType->sector ? ' - ' . $ticketType->sector->name : ''),
                            'description' => $ticketType->description,
                            'price' => (float) ($ticketType->price ?? 0),
                            'sales_start_date' => $ticketType->sales_start_date,
                            'sales_end_date' => $ticketType->sales_end_date,
                            'quantity' => (int) ($ticketType->quantity ?? 0),
                            'quantity_sold' => $actualSoldTickets,
                            'quantity_available' => (int) $availableTickets,
                            'sold_percentage' => round($soldPercentage, 1),
                            'total_income' => (float) $totalIncome,
                            'is_hidden' => (bool) $ticketType->is_hidden,
                            'is_bundle' => (bool) ($ticketType->is_bundle ?? false),
                            'bundle_quantity' => (int) ($ticketType->bundle_quantity ?? 1),
                            'invited_count' => (int) $ticketType->invited_count,
                            'tickets_issued' => $ticketType->is_bundle
                                ? $actualSoldTickets * ($ticketType->bundle_quantity ?? 1)
                                : $actualSoldTickets,
                            'max_purchase_quantity' => (int) ($ticketType->max_purchase_quantity ?? 10),
                            'event_function_id' => $ticketType->event_function_id,
                            'sector_id' => $ticketType->sector_id,
                            'sector' => $ticketType->sector,
                            'created_at' => $ticketType->created_at,
                            'updated_at' => $ticketType->updated_at,
                        ];
                    }),
                ];
            }),
        ];

        return Inertia::render('organizer/events/tickets', [
            'event' => $eventData,
        ]);
    }

    /**
     * Show the functions management page for an event.
     */
    public function functions(Request $request, Event $event): Response
    {
        // 🔧 CORREGIDO: Usar el método helper
        $organizer = $this->getOrganizer($request);

        if ($event->organizer_id !== $organizer->id) {
            abort(403, 'No tienes permisos para gestionar este evento');
        }

        // Cargar el evento con sus funciones
        $event->load(['functions' => function ($query) {
            $query->orderBy('start_time', 'asc')->with('ticketTypes');
        }]);

        // ACTUALIZAR ESTADOS DE TODAS LAS FUNCIONES
        foreach ($event->functions as $function) {
            $function->updateStatus();
        }

        // Formatear los datos del evento
        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url,
            'functions' => $event->functions->map(function ($function) {
                return [
                    'id' => $function->id,
                    'name' => $function->name,
                    'description' => $function->description,
                    'start_time' => $function->start_time,
                    'end_time' => $function->end_time,
                    'is_active' => $function->is_active,
                    'status' => $function->status->value,
                    'status_label' => $function->status->label(),
                    'status_color' => $function->status->color(),
                ];
            }),
        ];

        return Inertia::render('organizer/events/functions', [
            'event' => $eventData,
        ]);
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
            EventFunctionStatus::SOLD_OUT->value => 4,
            EventFunctionStatus::INACTIVE->value => 5,
            EventFunctionStatus::CANCELLED->value => 6,
            EventFunctionStatus::FINISHED->value => 7,
        ];

        $primaryFunction = $event->functions
            ->filter(fn($f) => $f->is_active)
            ->sortBy(function ($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

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
}
