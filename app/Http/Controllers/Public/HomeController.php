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
        // Eventos destacados (los primeros 3 eventos)
        $featuredEvents = Event::with(['venue', 'category', 'organizer', 'functions'])
            ->limit(3)
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->name,
                    'image' => $event->banner_url ?: "/placeholder.svg?height=400&width=800",
                    'date' => $event->functions->first()?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'location' => $event->venue->name,
                    'category' => $event->category->name,
                    'featured' => true,
                ];
            });

        // Todos los eventos para la grilla
        $events = Event::with(['venue', 'category', 'organizer', 'functions.ticketTypes'])
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
                    'title' => $event->name,
                    'image' => $event->banner_url ?: "/placeholder.svg?height=300&width=400",
                    'date' => $firstFunction?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
                    'time' => $firstFunction?->start_time?->format('H:i') ?? '',
                    'location' => $event->venue->name,
                    'city' => $this->extractCity($event->venue->address),
                    'category' => strtolower($event->category->name),
                    'price' => $minPrice,
                    'rating' => 4.5 + (rand(0, 8) / 10), // Temporal hasta implementar ratings reales
                ];
            });

        // Categorías disponibles
        $categories = Category::all()->map(function($category) {
            return [
                'id' => strtolower($category->name),
                'label' => $category->name,
                'icon' => $this->getCategoryIcon($category->name),
                'color' => 'primary',
            ];
        });

        return Inertia::render('public/home', [
            'featuredEvents' => $featuredEvents,
            'events' => $events,
            'categories' => $categories,
        ]);
    }

    /**
     * Extraer ciudad de la dirección
     */
    private function extractCity(string $address): string
    {
        $parts = explode(',', $address);
        
        // Buscar por palabras clave de ciudades conocidas
        $cities = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Montevideo'];
        
        foreach ($parts as $part) {
            $part = trim($part);
            foreach ($cities as $city) {
                if (stripos($part, $city) !== false) {
                    return $city;
                }
            }
        }
        
        // Si no encuentra ciudad conocida, retorna la penúltima parte o Buenos Aires por defecto
        return count($parts) > 1 ? trim($parts[count($parts) - 2]) : 'Buenos Aires';
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