<?php
// filepath: app/Http/Controllers/Organizer/TicketTypeController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TicketTypeController extends Controller
{
    /**
     * Muestra el formulario para crear un nuevo tipo de entrada para una función específica.
     */
    public function create(Event $event, EventFunction $function): Response
    {
        // Cargar el recinto del evento y sus sectores
        $event->load('venue.sectors');

        return Inertia::render('organizer/events/ticket-types/create', [
            'event' => $event,
            'function' => $function,
            'sectors' => $event->venue->sectors,
        ]);
    }

    /**
     * Guarda un nuevo tipo de entrada en la base de datos.
     */
    public function store(Request $request, Event $event, EventFunction $function): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'sector_id' => 'required|exists:sectors,id',
            'sales_start_date' => 'required|date',
            'sales_end_date' => 'required|date|after_or_equal:sales_start_date',
            'is_hidden' => 'sometimes|boolean',
        ]);

        // Asociar el ID de la función a los datos validados
        $validated['event_function_id'] = $function->id;

        TicketType::create($validated);

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with('success', 'Tipo de entrada creado exitosamente.');
    }

    /**
     * Muestra el formulario para editar un tipo de entrada existente.
     */
    public function edit(Event $event, EventFunction $function, TicketType $ticketType): Response
    {
        $event->load('venue.sectors');
        return Inertia::render('organizer/events/ticket-types/edit', [
            'event' => $event,
            'function' => $function,
            'ticketType' => $ticketType,
            'sectors' => $event->venue->sectors,
        ]);
    }

    /**
     * Actualiza un tipo de entrada existente en la base de datos.
     */
    public function update(Request $request, Event $event, EventFunction $function, TicketType $ticketType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'sector_id' => 'required|exists:sectors,id',
            'sales_start_date' => 'required|date',
            'sales_end_date' => 'required|date|after_or_equal:sales_start_date',
            'is_hidden' => 'sometimes|boolean',
        ]);

        $ticketType->update($validated);

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with('success', 'Tipo de entrada actualizado exitosamente.');
    }
}