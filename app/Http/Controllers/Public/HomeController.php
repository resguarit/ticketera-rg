<?php

// filepath: app/Http/Controllers/Public/HomeController.php

namespace App\Http\Controllers\Public;

use App\Enums\EventFunctionStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
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
            ->map(function ($event) {
                // Obtener funciones activas
                $activeFunctions = $event->functions->where('is_active', true);

                // Determinar el estado del evento basado en sus funciones activas
                $priorityOrder = [
                    EventFunctionStatus::ON_SALE->value => 1,
                    EventFunctionStatus::UPCOMING->value => 2,
                    EventFunctionStatus::REPROGRAMMED->value => 3,
                    EventFunctionStatus::CANCELLED->value => 4,
                    EventFunctionStatus::SOLD_OUT->value => 5,
                    EventFunctionStatus::INACTIVE->value => 6,
                    EventFunctionStatus::FINISHED->value => 7,
                ];

                $primaryFunction = $activeFunctions
                    ->sortBy(function ($function) use ($priorityOrder) {
                        return $priorityOrder[$function->status->value] ?? 999;
                    })
                    ->first();

                // Si no hay función activa, usar cualquiera
                if (! $primaryFunction) {
                    $primaryFunction = $event->functions->first();
                }

                $eventStatus = $primaryFunction ? [
                    'value' => $primaryFunction->status->value,
                    'label' => $primaryFunction->status->label(),
                    'color' => $primaryFunction->status->color(),
                ] : [
                    'value' => 'upcoming',
                    'label' => 'Próximamente',
                    'color' => 'blue',
                ];

                $firstFunction = $event->functions->sortBy('start_time')->first();
                $minPrice = $event->functions->flatMap(fn ($func) => $func->ticketTypes ?? collect())->min('price') ?? 0;

                return [
                    'id' => $event->id,
                    'slug' => $event->slug,
                    'name' => $event->name,
                    'description' => $event->description,
                    'image_url' => $event->hero_image_url ?: $event->image_url, // Priorizar hero banner
                    'hero_image_url' => $event->hero_image_url, // Para uso específico del hero
                    'date' => $firstFunction?->start_time ? $firstFunction->start_time->format('d M Y') : 'Fecha por confirmar',
                    'time' => $firstFunction?->start_time ? $firstFunction->start_time->format('H:i') : null,
                    'location' => $event->venue ? $event->venue->name : 'Ubicación por definir',
                    'city' => $event->venue?->ciudad?->name,
                    'province' => $event->venue?->ciudad?->provincia?->name,
                    'category' => strtolower($event->category->name),
                    'price' => $minPrice,
                    'featured' => $event->featured,
                    'status' => $eventStatus,
                    'has_active_functions' => $activeFunctions->isNotEmpty(),
                ];
            });

        // Resto de eventos para la grilla
        $events = Event::with(['venue.ciudad.provincia', 'category', 'organizer', 'functions.ticketTypes'])
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::all()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'icon' => $category->icon,
            ];
        });

        $cities = Event::with(['venue.ciudad.provincia'])
            ->get()
            ->pluck('venue.ciudad')
            ->filter()
            ->unique('id')
            ->map(function ($ciudad) {
                return [
                    'id' => $ciudad->id,
                    'name' => $ciudad->name,
                    'provincia' => $ciudad->provincia?->name,
                ];
            })
            ->sortBy('name')
            ->values();

        $processedEvents = $events->map(function ($event) {
            // Obtener funciones activas
            $activeFunctions = $event->functions->where('is_active', true);

            // Determinar el estado del evento basado en sus funciones activas
            $priorityOrder = [
                EventFunctionStatus::ON_SALE->value => 1,
                EventFunctionStatus::UPCOMING->value => 2,
                EventFunctionStatus::REPROGRAMMED->value => 3,
                EventFunctionStatus::CANCELLED->value => 4,
                EventFunctionStatus::SOLD_OUT->value => 5,
                EventFunctionStatus::INACTIVE->value => 6,
                EventFunctionStatus::FINISHED->value => 7,
            ];

            $primaryFunction = $activeFunctions
                ->sortBy(function ($function) use ($priorityOrder) {
                    return $priorityOrder[$function->status->value] ?? 999;
                })
                ->first();

            // Si no hay función activa, usar cualquiera
            if (! $primaryFunction) {
                $primaryFunction = $event->functions->first();
            }

            $eventStatus = $primaryFunction ? [
                'value' => $primaryFunction->status->value,
                'label' => $primaryFunction->status->label(),
                'color' => $primaryFunction->status->color(),
            ] : [
                'value' => 'upcoming',
                'label' => 'Próximamente',
                'color' => 'blue',
            ];

            $firstFunction = $event->functions->sortBy('start_time')->first();
            $minPrice = $event->functions->flatMap(fn ($func) => $func->ticketTypes ?? collect())->min('price') ?? 0;

            return [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'image_url' => $event->image_url, // Banner normal para la grilla
                'date' => $firstFunction?->start_time ? $firstFunction->start_time->format('d M Y') : 'Fecha por confirmar',
                'time' => $firstFunction?->start_time ? $firstFunction->start_time->format('H:i') : null,
                'location' => $event->venue ? $event->venue->name : 'Ubicación por definir',
                'city' => $event->venue?->ciudad?->name,
                'province' => $event->venue?->ciudad?->provincia?->name,
                'category' => strtolower($event->category->name),
                'price' => $minPrice,
                'featured' => $event->featured,
                'status' => $eventStatus,
                'has_active_functions' => $activeFunctions->isNotEmpty(),
            ];
        });

        return Inertia::render('public/home', [
            'featuredEvents' => $featuredEvents,
            'events' => $processedEvents,
            'categories' => $categories,
            'cities' => $cities,
        ]);
    }
}
