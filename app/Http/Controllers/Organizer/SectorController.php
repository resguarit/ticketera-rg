<?php

// filepath: app/Http/Controllers/Organizer/SectorController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\Venue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectorController extends Controller
{
    public function index(): Response
    {
        $sectors = Sector::with('venue')
            ->latest()
            ->get();

        return Inertia::render('organizer/sectors', [
            'sectors' => $sectors,
        ]);
    }

    public function create(): Response
    {
        $venues = Venue::select('id', 'name')->get();

        return Inertia::render('organizer/sectors/create', [
            'venues' => $venues,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'capacity' => 'required|integer|min:1',
        ]);

        Sector::create($request->only([
            'venue_id',
            'name',
            'description',
            'capacity',
        ]));

        return redirect()->route('organizer.sectors.index')
            ->with('success', 'Sector creado exitosamente');
    }

    public function show(Sector $sector): Response
    {
        $sector->load('venue');

        return Inertia::render('organizer/sectors/show', [
            'sector' => $sector,
        ]);
    }

    public function edit(Sector $sector): Response
    {
        $venues = Venue::select('id', 'name')->get();

        return Inertia::render('organizer/sectors/edit', [
            'sector' => $sector,
            'venues' => $venues,
        ]);
    }

    public function update(Request $request, Sector $sector): RedirectResponse
    {
        $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'capacity' => 'required|integer|min:1',
        ]);

        $sector->update($request->only([
            'venue_id',
            'name',
            'description',
            'capacity',
        ]));

        return redirect()->route('organizer.sectors.index')
            ->with('success', 'Sector actualizado exitosamente');
    }

    public function destroy(Sector $sector): RedirectResponse
    {
        // Verificar si tiene asientos o tickets asociados
        if ($sector->seats()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un sector que tiene asientos asociados');
        }

        $sector->delete();

        return redirect()->route('organizer.sectors.index')
            ->with('success', 'Sector eliminado exitosamente');
    }

    // API endpoint para obtener sectores de un venue específico
    public function getByVenue(Venue $venue)
    {
        $sectors = $venue->sectors()->select('id', 'name', 'capacity')->get();

        return response()->json($sectors);
    }
}
