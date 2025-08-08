<?php
// filepath: app/Http/Controllers/Organizer/VenueController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VenueController extends Controller
{
    public function index(): Response
    {
        $venues = Venue::withCount(['eventos', 'sectors'])
            ->latest()
            ->get();
        
        return Inertia::render('organizer/venues', [
            'venues' => $venues
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('organizer/venues/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'banner_url' => 'nullable|string|max:255',
            'referring' => 'nullable|string|max:1000'
        ]);

        Venue::create($request->only([
            'name', 
            'address', 
            'coordinates', 
            'banner_url', 
            'referring'
        ]));

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Venue creado exitosamente');
    }

    public function show(Venue $venue): Response
    {
        $venue->load(['eventos', 'sectors']);
        
        return Inertia::render('organizer/venues/show', [
            'venue' => $venue
        ]);
    }

    public function edit(Venue $venue): Response
    {
        return Inertia::render('organizer/venues/edit', [
            'venue' => $venue
        ]);
    }

    public function update(Request $request, Venue $venue): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'banner_url' => 'nullable|string|max:255',
            'referring' => 'nullable|string|max:1000'
        ]);

        $venue->update($request->only([
            'name', 
            'address', 
            'coordinates', 
            'banner_url', 
            'referring'
        ]));

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Venue actualizado exitosamente');
    }

    public function destroy(Venue $venue): RedirectResponse
    {
        // Verificar si tiene eventos asociados
        if ($venue->eventos()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un venue que tiene eventos asociados');
        }

        $venue->delete();

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Venue eliminado exitosamente');
    }

    // API endpoint para select options
    public function getForSelect()
    {
        $venues = Venue::select('id', 'name', 'address')->get();
        
        return response()->json($venues);
    }
}