<?php
// filepath: app/Http/Controllers/Public/EventController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Category;
use App\Models\Ciudad;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia
        $query = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes']);

        // Filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhereHas('venue', function($venue) use ($search) {
                      $venue->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category') && $request->get('category') !== 'all') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->get('category') . '%');
            });
        }

        // ACTUALIZADO: filtro por ciudad usando la nueva relación
        if ($request->filled('city') && $request->get('city') !== 'all') {
            $city = $request->get('city');
            $query->whereHas('venue.ciudad', function($q) use ($city) {
                $q->where('name', $city);
            });
        }

        $events = $query->get()->map(function($event) {
            $firstFunction = $event->functions->first();
            $minPrice = 0;
            
            // Obtener precio mínimo si hay funciones y tickets
            if ($event->functions->isNotEmpty()) {
                $allTickets = $event->functions->flatMap(fn($func) => $func->ticketTypes ?? collect());
                $minPrice = $allTickets->where('quantity_sold', '<', 'quantity')->min('price') ?? 0;
            }
            
            return [
                'id' => $event->id,
                'title' => $event->name,
                'image' => $event->banner_url ?: "/placeholder.svg?height=300&width=400",
                'date' => $firstFunction?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                'time' => $firstFunction?->start_time?->format('H:i') ?? '',
                'location' => $event->venue->name,
                // ACTUALIZADO: usar la nueva estructura
                'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                    $event->venue->ciudad->provincia->name : null,
                'category' => strtolower($event->category->name),
                'price' => $minPrice,
                'rating' => 4.5 + (rand(0, 8) / 10),
                'featured' => false,
            ];
        });

        // Categorías para filtros
        $categories = Category::all()->map(function($category) {
            return [
                'id' => strtolower($category->name),
                'label' => $category->name,
                'icon' => $this->getCategoryIcon($category->name),
                'color' => 'primary',
            ];
        });

        // ACTUALIZADO: ciudades desde la tabla ciudades
        $cities = Ciudad::orderBy('name')->pluck('name');

        return Inertia::render('public/events', [
            'events' => $events,
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
        $event->load(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes']);

        // Preparar funciones con sus tickets
        $functions = $event->functions->map(function($function) {
            return [
                'id' => $function->id,
                'name' => $function->name,
                'description' => $function->description,
                'start_time' => $function->start_time,
                'end_time' => $function->end_time,
                'date' => $function->start_time?->format('d M Y'),
                'time' => $function->start_time?->format('H:i'),
                'day_name' => $function->start_time?->format('l'),
                'is_active' => $function->is_active,
                'ticketTypes' => $function->ticketTypes->map(function($ticket) {
                    return [
                        'id' => $ticket->id,
                        'name' => $ticket->name,
                        'description' => $ticket->description,
                        'price' => $ticket->price,
                        'available' => $ticket->quantity - $ticket->quantity_sold,
                        'quantity' => $ticket->quantity,
                        'quantity_sold' => $ticket->quantity_sold,
                        'sales_start_date' => $ticket->sales_start_date,
                        'sales_end_date' => $ticket->sales_end_date,
                        'is_hidden' => $ticket->is_hidden,
                        'color' => 'from-blue-500 to-cyan-500',
                    ];
                }),
            ];
        });

        $eventData = [
            'id' => $event->id,
            'title' => $event->name,
            'description' => $event->description,
            'image' => $event->banner_url ?: "/placeholder.svg?height=400&width=800",
            'location' => $event->venue->name,
            // ACTUALIZADO: usar la nueva estructura
            'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
            'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                $event->venue->ciudad->provincia->name : null,
            'full_address' => $event->venue->getFullAddressAttribute(),
            'category' => strtolower($event->category->name),
            'rating' => 4.8,
            'reviews' => 1247,
            'duration' => '8 horas',
            'ageRestriction' => '18+',
            'functions' => $functions,
            // Para compatibilidad con el código existente
            'date' => $functions->first()['date'] ?? 'Fecha por confirmar',
            'time' => $functions->first()['time'] ?? '',
        ];

        return Inertia::render('public/eventdetail', [
            'eventData' => $eventData
        ]);
    }

    private function getCategoryIcon(string $categoryName): string
    {
        $iconMap = [
            'Música' => 'music',
            'Teatro' => 'theater',
            'Deportes' => 'trophy',
            'Conferencias' => 'presentation',
            'Gastronómico' => 'utensils',
            'Cultural' => 'palette',
            'Comedia' => 'laugh',
            'Familiar' => 'users',
        ];

        return $iconMap[$categoryName] ?? 'music';
    }
}