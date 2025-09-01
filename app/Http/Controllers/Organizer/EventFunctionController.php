<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EventFunctionController extends Controller
{
    private function checkOwnership(Event $event)
    {
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

        return Inertia::render('organizer/events/functions/create', [
            'event' => $event,
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
        ]);

        $event->functions()->create($validated);

        return redirect()->route('organizer.events.functions', $event->id)
            ->with('success', 'Función creada exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event, EventFunction $function): Response
    {
        $this->checkOwnership($event);

        return Inertia::render('organizer/events/functions/edit', [
            'event' => $event,
            'function' => $function,
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
        ]);

        $function->update($validated);

        return redirect()->route('organizer.events.functions', $event->id)
            ->with('success', 'Función actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event, EventFunction $function): RedirectResponse
    {
        $this->checkOwnership($event);

        // Add logic to check if tickets are sold before deleting
        if ($function->ticketTypes()->where('quantity_sold', '>', 0)->exists()) {
            return redirect()->route('organizer.events.functions', $event->id)
                ->with('error', 'No se puede eliminar una función con entradas vendidas.');
        }

        $function->delete();

        return redirect()->route('organizer.events.functions', $event->id)
            ->with('success', 'Función eliminada exitosamente.');
    }
}