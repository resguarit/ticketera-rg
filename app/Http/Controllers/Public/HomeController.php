<?php
// filepath: app/Http/Controllers/Public/HomeController.php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // Eventos destacados con hero banners
        $featuredEvents = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->where('featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($event) {
                $firstFunction = $event->functions->sortBy('start_time')->first();
                $minPrice = $event->functions->flatMap(fn($func) => $func->ticketTypes ?? collect())->min('price') ?? 0;

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'image_url' => $event->hero_image_url ?: $event->image_url, // Priorizar hero banner
                    'hero_image_url' => $event->hero_image_url, // Para uso específico del hero
                    'date' => $firstFunction?->start_time ? $firstFunction->start_time->format('Y-m-d') : null,
                    'time' => $firstFunction?->start_time ? $firstFunction->start_time->format('H:i') : null,
                    'location' => $event->venue ? $event->venue->name : 'Ubicación por definir',
                    'city' => $event->venue?->ciudad?->name,
                    'province' => $event->venue?->ciudad?->provincia?->name,
                    'category' => strtolower($event->category->name),
                    'price' => $minPrice,
                ];
            });

        // Resto de eventos para la grilla (sin cambios)
        $events = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::all()->map(function($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'icon' => $category->icon,
            ];
        });

        $processedEvents = $events->map(function($event) {
            $firstFunction = $event->functions->sortBy('start_time')->first();
            $minPrice = $event->functions->flatMap(fn($func) => $func->ticketTypes ?? collect())->min('price') ?? 0;
            
            return [
                'id' => $event->id,
                'name' => $event->name,
                'image_url' => $event->image_url, // Banner normal para la grilla
                'date' => $firstFunction?->start_time ? $firstFunction->start_time->format('Y-m-d') : null,
                'time' => $firstFunction?->start_time ? $firstFunction->start_time->format('H:i') : null,
                'location' => $event->venue ? $event->venue->name : 'Ubicación por definir',
                'city' => $event->venue?->ciudad?->name,
                'province' => $event->venue?->ciudad?->provincia?->name,
                'category' => strtolower($event->category->name),
                'price' => $minPrice,
            ];
        });

        return Inertia::render('public/home', [
            'featuredEvents' => $featuredEvents,
            'events' => $processedEvents,
            'categories' => $categories,
        ]);
    }
}