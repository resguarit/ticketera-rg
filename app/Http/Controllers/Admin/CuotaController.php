<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Cuota;
use Inertia\Inertia;

class CuotaController extends Controller
{
    public function index()
    {
        $cuotas = Cuota::all();
        return Inertia::render('admin/cuotas/index', compact('cuotas'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'bin' => 'required|string|max:255',
            'cantidad_cuotas' => 'required|integer|min:1',
        ]);

        Cuota::create($request->all());

        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota creada exitosamente.');
    }

    public function destroy(Cuota $cuota)
    {
        $cuota->delete();
        return redirect()->route('admin.cuotas.index')->with('success', 'Cuota eliminada exitosamente.');
    }
}
