<?php
// filepath: app/Http/Controllers/Admin/VenueController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\Ciudad;
use App\Models\Provincia;
use App\Models\Sector; // <-- AÑADIR ESTO
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

        return Inertia::render('admin/venues/index', [
            'venues' => $venues
        ]);
    }

    private function getFormData(): array
    {
        return [
            'provincias' => Provincia::orderBy('name')->get(),
            'ciudades' => Ciudad::orderBy('name')->get(),
        ];
    }

    public function create(): Response
    {
        return Inertia::render('admin/venues/create', $this->getFormData());
    }

    private function getOrCreateCiudad(Request $request): int
    {
        $provincia_input = $request->input('provincia_id_or_name');
        $ciudad_input = $request->input('ciudad_name');

        // Si el input de provincia es numérico, es un ID. Si no, es un nombre para crear.
        if (is_numeric($provincia_input)) {
            $provincia = Provincia::findOrFail($provincia_input);
        } else {
            $provincia = Provincia::firstOrCreate(['name' => $provincia_input]);
        }

        // Buscar o crear la ciudad asociada a esa provincia
        $ciudad = Ciudad::firstOrCreate(
            ['name' => $ciudad_input, 'provincia_id' => $provincia->id]
        );

        return $ciudad->id;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'provincia_id_or_name' => 'required|string|max:255',
            'ciudad_name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1', // <-- AÑADIR VALIDACIÓN
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048',
            'referring' => 'nullable|string|max:1000'
        ]);

        $venueData = $request->except('capacity'); // Excluir capacidad de los datos del venue
        $venueData['ciudad_id'] = $this->getOrCreateCiudad($request);

        if ($request->hasFile('banner')) {
            $venueData['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        $venue = Venue::create($venueData);

        // Crear el sector "General" con la capacidad proporcionada
        $venue->sectors()->create([
            'name' => 'General',
            'capacity' => $request->input('capacity')
        ]);

        return redirect()->route('admin.venues.index')
            ->with('success', 'Recinto creado exitosamente');
    }

    public function show(Venue $venue): Response
    {
        $venue->load(['eventos', 'sectors', 'ciudad.provincia']);

        return Inertia::render('admin/venues/show', [
            'venue' => $venue
        ]);
    }

    public function edit(Venue $venue): Response
    {
        $venue->load('ciudad.provincia', 'sectors'); // Cargar la relación de sectores
        
        $venueData = [
            'id' => $venue->id,
            'name' => $venue->name,
            'address' => $venue->address,
            'ciudad_id' => $venue->ciudad_id,
            'provincia_id' => $venue->ciudad->provincia_id,
            'coordinates' => $venue->coordinates,
            'banner_url' => $venue->image_url,
            'referring' => $venue->referring,
            'ciudad' => $venue->ciudad,
            // Obtener la capacidad del primer sector (asumimos que es el "General")
            'capacity' => $venue->sectors->first()->capacity ?? 0,
        ];

        return Inertia::render('admin/venues/edit', array_merge($this->getFormData(), [
            'venue' => $venueData
        ]));
    }

    public function update(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'provincia_id_or_name' => 'required|string|max:255',
            'ciudad_name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1', // <-- AÑADIR VALIDACIÓN
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048',
            'referring' => 'nullable|string|max:1000'
        ]);

        $venueData = $request->except('capacity');
        $venueData['ciudad_id'] = $this->getOrCreateCiudad($request);

        if ($request->hasFile('banner')) {
            if ($venue->banner_url) {
                Storage::disk('public')->delete($venue->banner_url);
            }
            $venueData['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        $venue->update($venueData);

        // Actualizar o crear el sector "General"
        $venue->sectors()->updateOrCreate(
            ['name' => 'General'], // Condición para buscar
            ['capacity' => $request->input('capacity')] // Datos para actualizar o crear
        );

        return redirect()->route('admin.venues.index')
            ->with('success', 'Recinto actualizado exitosamente');
    }

    public function destroy(Venue $venue): RedirectResponse
    {
        if ($venue->eventos()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un recinto que tiene eventos asociados');
        }

        if ($venue->banner_url) {
            Storage::disk('public')->delete($venue->banner_url);
        }

        $venue->delete();

        return redirect()->route('admin.venues.index')
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