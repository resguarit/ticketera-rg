<?php
// filepath: app/Http/Controllers/Organizer/VenueController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\Ciudad;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VenueController extends Controller
{
    public function index(): Response
    {
        // ACTUALIZADO: incluir ciudad y provincia
        $venues = Venue::with(['ciudad.provincia'])
            ->withCount(['eventos', 'sectors'])
            ->latest()
            ->get()
            ->map(function($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'address' => $venue->address,
                    'city' => $venue->ciudad ? $venue->ciudad->name : 'Sin ciudad',
                    'province' => $venue->ciudad && $venue->ciudad->provincia ? 
                        $venue->ciudad->provincia->name : null,
                    'full_address' => $venue->getFullAddressAttribute(),
                    'eventos_count' => $venue->eventos_count,
                    'sectors_count' => $venue->sectors_count,
                    'coordinates' => $venue->coordinates,
                    'banner_url' => $venue->banner_url,
                    'referring' => $venue->referring,
                ];
            });
        
        return Inertia::render('organizer/venues', [
            'venues' => $venues
        ]);
    }

    public function create(): Response
    {
        // Obtener ciudades para el select
        $ciudades = Ciudad::with('provincia')->orderBy('name')->get();
        
        return Inertia::render('organizer/venues/create', [
            'ciudades' => $ciudades
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'ciudad_id' => 'required|exists:ciudades,id', // NUEVO: validar ciudad
            'coordinates' => 'nullable|string|max:100',
            'banner_url' => 'nullable|string|max:255',
            'referring' => 'nullable|string|max:1000'
        ]);

        Venue::create($request->only([
            'name', 
            'address', 
            'ciudad_id', // NUEVO: incluir ciudad_id
            'coordinates', 
            'banner_url', 
            'referring'
        ]));

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Venue creado exitosamente');
    }

    public function show(Venue $venue): Response
    {
        // ACTUALIZADO: cargar ciudad y provincia
        $venue->load(['eventos', 'sectors', 'ciudad.provincia']);
        
        return Inertia::render('organizer/venues/show', [
            'venue' => $venue
        ]);
    }

    public function edit(Venue $venue): Response
    {
        // Cargar ciudad y provincia del venue
        $venue->load('ciudad.provincia');
        
        // Obtener todas las ciudades para el select
        $ciudades = Ciudad::with('provincia')->orderBy('name')->get();
        
        return Inertia::render('organizer/venues/edit', [
            'venue' => $venue,
            'ciudades' => $ciudades
        ]);
    }

    public function update(Request $request, Venue $venue): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'ciudad_id' => 'required|exists:ciudades,id', // NUEVO: validar ciudad
            'coordinates' => 'nullable|string|max:100',
            'banner_url' => 'nullable|string|max:255',
            'referring' => 'nullable|string|max:1000'
        ]);

        $venue->update($request->only([
            'name', 
            'address', 
            'ciudad_id', // NUEVO: incluir ciudad_id
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
        // ACTUALIZADO: incluir ciudad
        $venues = Venue::with('ciudad')
            ->select('id', 'name', 'address', 'ciudad_id')
            ->get()
            ->map(function($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'address' => $venue->address,
                    'city' => $venue->ciudad ? $venue->ciudad->name : 'Sin ciudad',
                    'full_address' => $venue->getFullAddressAttribute(),
                ];
            });
        
        return response()->json($venues);
    }
}