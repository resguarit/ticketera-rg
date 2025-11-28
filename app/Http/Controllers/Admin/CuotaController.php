<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Cuota;
use App\Models\Event;
use Inertia\Inertia;

class CuotaController extends Controller
{
    public function index()
    {
        $cuotas = Cuota::with(['event:id,name'])
            ->orderBy('event_id')
            ->orderByDesc('habilitada')
            ->get();

        return Inertia::render('admin/cuotas/index', compact('cuotas'));
    }

    public function create()
    {
        $events = Event::select('id', 'name')->orderBy('name')->get();
        return Inertia::render('admin/cuotas/new', compact('events'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'bin' => 'required|string|max:255',
            'cantidad_cuotas' => 'required|integer|min:1',
            'banco' => 'nullable|string|max:255',
            'habilitada' => 'sometimes|boolean',
        ]);

        $validated['habilitada'] = $validated['habilitada'] ?? true;

        Cuota::create($validated);

        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota creada exitosamente.');
    }

    public function edit(Cuota $cuota)
    {
        $cuota->load('event:id,name');
        $events = Event::select('id', 'name')->orderBy('name')->get();
        return Inertia::render('admin/cuotas/edit', compact('cuota', 'events'));
    }

    public function update(Request $request, Cuota $cuota)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'bin' => 'required|string|max:255',
            'cantidad_cuotas' => 'required|integer|min:1',
            'banco' => 'nullable|string|max:255',
            'habilitada' => 'sometimes|boolean',
        ]);

        $validated['habilitada'] = $validated['habilitada'] ?? false;

        $cuota->update($validated);

        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota actualizada exitosamente.');
    }

    public function destroy(Cuota $cuota)
    {
        $cuota->habilitada = false;
        $cuota->save();
        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota deshabilitada exitosamente.');
    }

    public function enable(Cuota $cuota)
    {
        $cuota->habilitada = true;
        $cuota->save();
        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota habilitada nuevamente.');
    }
}
