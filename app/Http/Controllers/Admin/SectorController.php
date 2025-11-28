<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class SectorController extends Controller
{
    public function store(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'sectors' => 'required|array|min:1',
            'sectors.*.id' => 'nullable|exists:sectors,id',
            'sectors.*.name' => 'required|string|max:255',
            'sectors.*.capacity' => 'required|integer|min:0',
            'sectors.*.description' => 'nullable|string|max:1000',
        ]);

        $existingSectorIds = $venue->sectors()->pluck('id')->toArray();
        $incomingSectorIds = [];

        foreach ($validated['sectors'] as $sectorData) {
            $sector = $venue->sectors()->updateOrCreate(
                ['id' => $sectorData['id'] ?? null],
                [
                    'name' => $sectorData['name'],
                    'capacity' => $sectorData['capacity'],
                    'description' => $sectorData['description'],
                ]
            );
            $incomingSectorIds[] = $sector->id;
        }

        // Eliminar sectores que ya no vienen en la petición
        $sectorsToDelete = array_diff($existingSectorIds, $incomingSectorIds);
        if (!empty($sectorsToDelete)) {
            Sector::destroy($sectorsToDelete);
        }

        return redirect()->route('admin.venues.show', $venue->id)
            ->with('success', 'Sectores actualizados correctamente.');
    }
}