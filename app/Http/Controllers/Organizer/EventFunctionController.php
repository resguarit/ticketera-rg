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
    private function checkOwnership(Event $event)
    {
        if (Auth::user()->role === UserRole::ADMIN && session('impersonated_organizer_id') == $event->organizer_id) {
            return;
        }

        if ($event->organizer_id !== Auth::user()->organizer_id) {
            abort(403);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

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
    public function create(Event $event): Response
    {
        $this->checkOwnership($event);

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
        $this->checkOwnership($event);

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
    public function edit(Event $event, EventFunction $function): Response
    {
        $this->checkOwnership($event);

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
        $this->checkOwnership($event);

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
    public function destroy(Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($event);

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
        $this->checkOwnership($event);

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
        $this->checkOwnership($event);

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
