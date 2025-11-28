<?php

// filepath: app/Http/Controllers/Admin/VenueController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Provincia;
use App\Models\Sector;
use App\Models\Venue; // <-- AÑADIR ESTO
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function index(): Response
    {
        $venues = Venue::with(['ciudad.provincia'])
            ->withCount(['eventos', 'sectors'])
            ->latest()
            ->get()
            ->map(function ($venue) {
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
            'venues' => $venues,
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
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048',
            'referring' => 'nullable|string|max:1000',
            'sectors' => 'required|array|min:1',
            'sectors.*.name' => 'required|string|max:255',
            'sectors.*.capacity' => 'required|integer|min:0',
            'sectors.*.description' => 'nullable|string|max:1000',
        ]);

        $venueData = $request->except(['sectors', 'banner']);
        $venueData['ciudad_id'] = $this->getOrCreateCiudad($request);

        if ($request->hasFile('banner')) {
            $venueData['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        $venue = Venue::create($venueData);

        // Crear los sectores
        foreach ($validated['sectors'] as $sectorData) {
            $venue->sectors()->create($sectorData);
        }

        return redirect()->route('admin.venues.index')
            ->with('success', 'Recinto creado exitosamente');
    }

    public function show(Venue $venue): Response
    {
        $venue->load(['eventos', 'sectors', 'ciudad.provincia']);

        return Inertia::render('admin/venues/show', [
            'venue' => $venue,
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
            'sectors' => $venue->sectors, // Pasar la colección de sectores
        ];

        return Inertia::render('admin/venues/edit', array_merge($this->getFormData(), [
            'venue' => $venueData,
        ]));
    }

    public function update(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'provincia_id_or_name' => 'required|string|max:255',
            'ciudad_name' => 'required|string|max:255',
            'coordinates' => 'nullable|string|max:100',
            'banner' => 'nullable|image|max:2048',
            'referring' => 'nullable|string|max:1000',
            'sectors' => 'present|array', // 'present' asegura que el campo sectors venga, aunque esté vacío
            'sectors.*.id' => 'nullable|integer', // No necesita 'exists' aquí, lo manejaremos nosotros
            'sectors.*.name' => 'required|string|max:255',
            'sectors.*.capacity' => 'required|integer|min:0',
            'sectors.*.description' => 'nullable|string|max:1000',
        ]);

        $venueData = $request->except(['sectors', 'banner', '_method']);
        $venueData['ciudad_id'] = $this->getOrCreateCiudad($request);

        if ($request->hasFile('banner')) {
            if ($venue->banner_url) {
                Storage::disk('public')->delete($venue->banner_url);
            }
            $venueData['banner_url'] = $request->file('banner')->store('recintos', 'public');
        }

        $venue->update($venueData);

        // Sincronizar sectores
        $incomingSectors = $validated['sectors'] ?? [];
        $incomingSectorIds = [];

        foreach ($incomingSectors as $sectorData) {
            // Si el ID es real (no el timestamp de JS), lo usamos para actualizar.
            // Si no, creamos uno nuevo.
            $sector = $venue->sectors()->updateOrCreate(
                [
                    'id' => isset($sectorData['id']) && Sector::find($sectorData['id']) ? $sectorData['id'] : null,
                ],
                [
                    'name' => $sectorData['name'],
                    'capacity' => $sectorData['capacity'],
                    'description' => $sectorData['description'],
                ]
            );
            $incomingSectorIds[] = $sector->id;
        }

        // Eliminar sectores que ya no están en la petición
        $venue->sectors()->whereNotIn('id', $incomingSectorIds)->delete();

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
            ->map(function ($venue) {
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
