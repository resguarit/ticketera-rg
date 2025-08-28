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
        $featuredEvents = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->where('featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Todos los eventos para la grilla
        $events = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Categorías disponibles con colores de la BD
        $categories = Category::all()->map(function($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon ?: 'default',
                'color' => $category->color ?: '#3b82f6',
            ];
        });

        return Inertia::render('public/home', [
            'featuredEvents' => EventResource::collection($featuredEvents),
            'events' => EventResource::collection($events),
            'categories' => $categories,
        ]);
    }
}