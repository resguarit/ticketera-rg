<?php
// filepath: app/Http/Controllers/Public/HomeController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia en las consultas
        // Eventos destacados (solo los que tienen featured = 1/true)
        $featuredEvents = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions'])
            ->where('featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'image_url' => $event->image_url ?: "/placeholder.svg?height=400&width=800",
                    'date' => $event->functions->first()?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'location' => $event->venue->name,
                    // ACTUALIZADO: usar la nueva estructura
                    'city' => $event->venue->ciudad ? $event->venue->ciudad->name : 'Sin ciudad',
                    'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                        $event->venue->ciudad->provincia->name : null,
                    'category' => $event->category->name,
                    'featured' => $event->featured,
                ];
            });

        // Todos los eventos para la grilla
        $events = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($event) {
                $firstFunction = $event->functions->first();
                $minPrice = 0;
                
                // Obtener precio mínimo si hay funciones y tickets
                if ($event->functions->isNotEmpty()) {
                    $allTickets = $event->functions->flatMap(fn($func) => $func->ticketTypes ?? collect());
                    $minPrice = $allTickets->where('quantity_sold', '<', 'quantity')->min('price') ?? 0;
                }
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'image_url' => $event->image_url ?: "/placeholder.svg?height=300&width=400",
                    'date' => $firstFunction?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'time' => $firstFunction?->start_time?->format('H:i') ?? '',
                    'location' => $event->venue->name,
                    // ACTUALIZADO: usar la nueva estructura
                    'city' => $event->venue->ciudad ? $event->venue->ciudad->name : null,
                    'province' => $event->venue->ciudad && $event->venue->ciudad->provincia ? 
                        $event->venue->ciudad->provincia->name : null,
                    'category' => strtolower($event->category->name),
                    'price' => $minPrice,
                    'featured' => $event->featured,
                ];
            });

        // Categorías disponibles con colores de la BD
        $categories = Category::all()->map(function($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon ?: $this->getCategoryIcon($category->name),
                'color' => $category->color ?: '#3b82f6',
            ];
        });

        return Inertia::render('public/home', [
            'featuredEvents' => $featuredEvents,
            'events' => $events,
            'categories' => $categories,
        ]);
    }

    /**
     * Mapear nombre de categoría a icono
     */
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