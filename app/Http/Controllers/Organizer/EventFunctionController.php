<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Enums\EventFunctionStatus;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EventFunctionController extends Controller
{
    /**
     * Obtiene el organizador correcto considerando impersonación
     */
    private function getOrganizer(Request $request): \App\Models\Organizer
    {
        if ($request->session()->has('impersonated_organizer_id')) {
            return \App\Models\Organizer::findOrFail($request->session()->get('impersonated_organizer_id'));
        }
        
        return Auth::user()->organizer;
    }

    private function checkOwnership(Request $request, Event $event)
    {
        // 🔧 CORREGIDO: Usar getOrganizer para obtener el organizador correcto
        $organizer = $this->getOrganizer($request);
        
        if ($event->organizer_id !== $organizer->id) {
            abort(403);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Event $event): Response
    {
        $this->checkOwnership($request, $event);

        $event->load(['functions' => function ($query) {
            $query->orderBy('start_time', 'asc');
        }]);

        return Inertia::render('organizer/events/functions/index', [
            'event' => $event,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, Event $event): Response
    {
        $this->checkOwnership($request, $event);

        // Estados disponibles del enum
        $statuses = collect(EventFunctionStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'color' => $status->color(),
        ]);

        return Inertia::render('organizer/events/functions/create', [
            'event' => $event,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->checkOwnership($request, $event);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'is_active' => 'required|boolean',
            'status' => 'required|in:' . implode(',', array_column(EventFunctionStatus::cases(), 'value')),
        ]);

        try {
            DB::beginTransaction();

            $event->functions()->create($validated);

            DB::commit();

            return redirect()->route('organizer.events.functions', $event->id)
                ->with('success', 'Función creada exitosamente.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al crear la función: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Event $event, EventFunction $function): Response
    {
        $this->checkOwnership($request, $event);

        // Estados disponibles del enum
        $statuses = collect(EventFunctionStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'color' => $status->color(),
        ]);

        return Inertia::render('organizer/events/functions/edit', [
            'event' => $event,
            'function' => [
                'id' => $function->id,
                'name' => $function->name,
                'description' => $function->description,
                'start_time' => $function->start_time,
                'end_time' => $function->end_time,
                'is_active' => $function->is_active,
                'status' => $function->status->value,
                'status_label' => $function->status->label(),
                'status_color' => $function->status->color(),
            ],
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($request, $event);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'is_active' => 'required|boolean',
            'status' => 'required|in:' . implode(',', array_column(EventFunctionStatus::cases(), 'value')),
        ]);

        try {
            DB::beginTransaction();

            $function->update($validated);

            DB::commit();

            return redirect()->route('organizer.events.functions', $event->id)
                ->with('success', 'Función actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al actualizar la función: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($request, $event);

        try {
            // Add logic to check if tickets are sold before deleting
            if ($function->ticketTypes()->where('quantity_sold', '>', 0)->exists()) {
                return back()->withErrors(['error' => 'No se puede eliminar una función con entradas vendidas.']);
            }

            DB::beginTransaction();

            $function->delete();

            DB::commit();

            return redirect()->route('organizer.events.functions', $event->id)
                ->with('success', 'Función eliminada exitosamente.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al eliminar la función: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the status of a function
     */
    public function updateStatus(Request $request, Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($request, $event);

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_column(EventFunctionStatus::cases(), 'value')),
        ]);

        try {
            DB::beginTransaction();

            $function->update([
                'status' => $validated['status']
            ]);

            DB::commit();

            $statusEnum = EventFunctionStatus::from($validated['status']);

            return redirect()->back()
                ->with('success', "Estado actualizado a: {$statusEnum->label()}");
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al actualizar el estado: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle active state of a function
     */
    public function toggleActive(Request $request, Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($request, $event);

        try {
            DB::beginTransaction();

            $function->update([
                'is_active' => !$function->is_active
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', $function->is_active
                    ? 'Función activada correctamente'
                    : 'Función desactivada correctamente');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Error al cambiar el estado: ' . $e->getMessage()]);
        }
    }
}
