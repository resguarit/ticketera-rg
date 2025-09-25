<?php
// filepath: app/Http/Controllers/Public/EventController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Category;
use App\Models\Ciudad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        if ($request->filled('city') && $request->get('city') !== 'all') {
            $city = $request->get('city');
            $query->whereHas('venue.ciudad', function($q) use ($city) {
                $q->where('name', $city);
            });
        }

        $events = $query->get();

        // Categorías para filtros
        $categories = Category::all()->map(function($category) {
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
                'with_ticket_info' => true // Agregar flag para incluir info de tickets
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
        $event->load(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes']);

        // Preparar funciones con sus tickets
        $functions = $event->functions->map(function($function) {
            return [
                'id' => $function->id,
                'name' => $function->name,
                'description' => $function->description,
                'start_time' => $function->start_time,
                'end_time' => $function->end_time ? $function->end_time : null,
                'date' => $function->start_time?->format('d M Y'),
                'time' => $function->start_time?->format('H:i'),
                'day_name' => $function->start_time?->format('l'),
                'is_active' => $function->is_active,
                'status' => $function->status->value,
                'ticketTypes' => $function->ticketTypes->map(function($ticket) {
                    return [
                        'id' => $ticket->id,
                        'name' => $ticket->name,
                        'description' => $ticket->description,
                        'price' => $ticket->price,
                        'available' => $ticket->quantity - $ticket->quantity_sold,
                        'quantity' => $ticket->quantity,
                        'quantity_sold' => $ticket->quantity_sold,
                        'max_purchase_quantity' => $ticket->max_purchase_quantity, // Asegurar que se incluya
                        'sales_start_date' => $ticket->sales_start_date,
                        'sales_end_date' => $ticket->sales_end_date,
                        'is_hidden' => $ticket->is_hidden,
                        'is_bundle' => $ticket->is_bundle, // Agregar información de bundle
                        'bundle_quantity' => $ticket->bundle_quantity, // Agregar información de bundle
                        'color' => 'from-blue-500 to-cyan-500',
                    ];
                }),
            ];
        });

        $eventData = [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'image_url' => $event->image_url ?: "/placeholder.svg?height=400&width=800",
            'hero_image_url' => $event->hero_image_url, // Agregar esta línea
            'location' => $event->venue->name,
            // ACTUALIZADO: usar la nueva estructura
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
            // Para compatibilidad con el código existente
            'date' => $functions->first()['date'] ?? 'Fecha por confirmar',
            'time' => $functions->first()['time'] ?? '',
        ];

        return Inertia::render('public/eventdetail', [
            'eventData' => $eventData
        ]);
    }
}