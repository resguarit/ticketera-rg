<?php
// filepath: app/Http/Controllers/Public/EventController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Event::with(['venue', 'category', 'organizer', 'functions.ticketTypes'])
            ->whereHas('functions', function($query) {
                $query->where('start_time', '>=', now());
            });

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

        if ($request->filled('city') && $request->get('city') !== 'all') {
            $city = $request->get('city');
            $query->whereHas('venue', function($q) use ($city) {
                $q->where('address', 'LIKE', "%{$city}%");
            });
        }

        $events = $query->get()->map(function($event) {
            $firstFunction = $event->functions->first();
            $minPrice = $event->functions
                ->flatMap(fn($func) => $func->ticketTypes)
                ->where('quantity_sold', '<', 'quantity')
                ->min('price');
            
            return [
                'id' => $event->id,
                'title' => $event->name,
                'image' => $event->banner_url ?: "/placeholder.svg?height=300&width=400",
                'date' => $firstFunction?->start_time?->format('d M Y'),
                'time' => $firstFunction?->start_time?->format('H:i'),
                'location' => $event->venue->name,
                'city' => $this->extractCity($event->venue->address),
                'category' => strtolower($event->category->name),
                'price' => $minPrice ?: 0,
                'rating' => 4.5 + (rand(0, 8) / 10),
                'featured' => false, // Puedes agregar un campo featured a la tabla events
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

        return Inertia::render('public/events', [
            'events' => $events,
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', 'all'),
                'city' => $request->get('city', 'all'),
            ]
        ]);
    }

    public function show(Event $event): Response
    {
        $event->load(['venue', 'category', 'organizer', 'functions.ticketTypes']);

        $eventData = [
            'id' => $event->id,
            'title' => $event->name,
            'description' => $event->description,
            'image' => $event->banner_url ?: "/placeholder.svg?height=400&width=800",
            'date' => $event->functions->first()?->start_time?->format('d M Y'),
            'time' => $event->functions->first()?->start_time?->format('H:i'),
            'location' => $event->venue->name,
            'city' => $this->extractCity($event->venue->address),
            'category' => strtolower($event->category->name),
            'rating' => 4.8, // Temporal
            'reviews' => 1247, // Temporal
            'duration' => '8 horas', // Temporal
            'ageRestriction' => '18+', // Temporal
            'ticketTypes' => $event->functions->first()?->ticketTypes->map(function($ticket) {
                return [
                    'id' => $ticket->id,
                    'name' => $ticket->name,
                    'description' => $ticket->description,
                    'price' => $ticket->price,
                    'available' => $ticket->quantity - $ticket->quantity_sold,
                    'color' => 'from-blue-500 to-cyan-500', // Temporal
                ];
            }) ?? collect([]),
        ];

        return Inertia::render('public/eventdetail', [
            'eventData' => $eventData
        ]);
    }

    private function extractCity(string $address): string
    {
        $parts = explode(',', $address);
        $cities = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Montevideo'];
        
        foreach ($parts as $part) {
            $part = trim($part);
            foreach ($cities as $city) {
                if (stripos($part, $city) !== false) {
                    return $city;
                }
            }
        }
        
        return count($parts) > 1 ? trim($parts[count($parts) - 2]) : 'Buenos Aires';
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