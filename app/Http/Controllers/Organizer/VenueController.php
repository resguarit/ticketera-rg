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
use Illuminate\Support\Facades\Storage;

class VenueController extends Controller
{
    public function index(): Response
    {
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
                    'banner_url' => $venue->image_url, // Usa el accesor del modelo
                    'referring' => $venue->referring,
                ];
            });
        
        // CORREGIDO: Apuntar a la vista index dentro de la carpeta venues
        return Inertia::render('organizer/venues/index', [
            'venues' => $venues
        ]);
    }

    public function create(): Response
    {
        $ciudades = Ciudad::with('provincia')->orderBy('name')->get();
        
        return Inertia::render('organizer/venues/create', [
            'ciudades' => $ciudades
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'ciudad_id' => 'required|exists:ciudades,id',
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048', // CORREGIDO: Validación de imagen
            'referring' => 'nullable|string|max:1000'
        ]);

        if ($request->hasFile('banner')) {
            // ACTUALIZADO: Cambiar 'venues' por 'recintos'
            $validated['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        Venue::create($validated);

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Recinto creado exitosamente');
    }

    public function show(Venue $venue): Response
    {
        $venue->load(['eventos', 'sectors', 'ciudad.provincia']);
        
        return Inertia::render('organizer/venues/show', [
            'venue' => $venue
        ]);
    }

    public function edit(Venue $venue): Response
    {
        $venue->load('ciudad.provincia');
        $ciudades = Ciudad::with('provincia')->orderBy('name')->get();
        
        // Mapear el venue para asegurar que el accesor image_url se aplique
        $venueData = [
            'id' => $venue->id,
            'name' => $venue->name,
            'address' => $venue->address,
            'ciudad_id' => $venue->ciudad_id,
            'coordinates' => $venue->coordinates,
            'banner_url' => $venue->image_url, // Usar el accesor
            'referring' => $venue->referring,
            'ciudad' => $venue->ciudad,
        ];

        return Inertia::render('organizer/venues/edit', [
            'venue' => $venueData,
            'ciudades' => $ciudades
        ]);
    }

    // CORREGIDO: El método update ahora maneja la carga de archivos
    public function update(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'ciudad_id' => 'required|exists:ciudades,id',
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048', // Validación de imagen
            'referring' => 'nullable|string|max:1000'
        ]);

        if ($request->hasFile('banner')) {
            // Eliminar el banner anterior si existe
            if ($venue->banner_url) {
                Storage::disk('public')->delete($venue->banner_url);
            }
            // ACTUALIZADO: Cambiar 'venues' por 'recintos'
            $validated['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        $venue->update($validated);

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Recinto actualizado exitosamente');
    }

    public function destroy(Venue $venue): RedirectResponse
    {
        if ($venue->eventos()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un recinto que tiene eventos asociados');
        }

        // Eliminar el banner si existe
        if ($venue->banner_url) {
            Storage::disk('public')->delete($venue->banner_url);
        }

        $venue->delete();

        return redirect()->route('organizer.venues.index')
            ->with('success', 'Recinto eliminado exitosamente');
    }

    public function getForSelect()
    {
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