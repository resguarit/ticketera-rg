<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller 
{
    public function index(): Response
    {
        $organizer = Auth::user()->organizer;

        $events = $organizer->events;

        return Inertia::render('organizer/events/index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        $organizer = Auth::user()->organizer;
        
        // Get categories for select
        $categories = \App\Models\Category::select('id', 'name')
            ->orderBy('name')
            ->get();
            
        // Get venues for select
        $venues = \App\Models\Venue::select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        return Inertia::render('organizer/events/new', [
            'categories' => $categories,
            'venues' => $venues,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'banner_url' => 'nullable|image|max:2048',
            'category_id' => 'required|exists:categories,id',
            'venue_id' => 'required|exists:venues,id',
            'featured' => 'boolean',
            'functions' => 'required|array|min:1',
            'functions.*.name' => 'required|string|max:255',
            'functions.*.description' => 'nullable|string',
            'functions.*.start_time' => 'required|date',
            'functions.*.end_time' => 'required|date|after:functions.*.start_time',
        ]);

        try {
            DB::beginTransaction();

            $organizer = Auth::user()->organizer;
            
            // Handle banner upload
            $bannerPath = null;
            if ($request->hasFile('banner_url')) {
                $bannerPath = $request->file('banner_url')->store('events/banners', 'public');
            }

            // Create event
            $event = Event::create([
                'organizer_id' => $organizer->id,
                'category_id' => $validated['category_id'],
                'venue_id' => $validated['venue_id'],
                'name' => $validated['name'],
                'description' => $validated['description'],
                'banner_url' => $bannerPath,
                'featured' => $validated['featured'] ?? false,
            ]);

            // Create functions only (without ticket types for now)
            foreach ($validated['functions'] as $functionData) {
                EventFunction::create([
                    'event_id' => $event->id,
                    'name' => $functionData['name'],
                    'description' => $functionData['description'],
                    'start_time' => $functionData['start_time'],
                    'end_time' => $functionData['end_time'],
                    'is_active' => true,
                ]);
            }

            DB::commit();

            return redirect()->route('organizer.events.index')
                ->with('success', 'Evento creado exitosamente.');

        } catch (\Exception $e) {
            DB::rollback();
            
            // Delete uploaded banner if it exists
            if ($bannerPath) {
                Storage::disk('public')->delete($bannerPath);
            }
            
            return back()->withErrors(['error' => 'Error al crear el evento: ' . $e->getMessage()]);
        }
    }
}