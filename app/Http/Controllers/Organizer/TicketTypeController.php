<?php
// filepath: app/Http/Controllers/Organizer/TicketTypeController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use App\Models\Sector;
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

        // Calcular disponibilidad por sector para esta función
        $sectorsWithAvailability = $event->venue->sectors->map(function ($sector) use ($function) {
            // Obtener todos los ticket types de esta función para este sector
            $ticketTypes = TicketType::where('event_function_id', $function->id)
                ->where('sector_id', $sector->id)
                ->get();
            
            // Calcular entradas ya asignadas (considerando bundles)
            $usedCapacity = $ticketTypes->sum(function ($ticketType) {
                return $ticketType->is_bundle 
                    ? $ticketType->quantity * $ticketType->bundle_quantity
                    : $ticketType->quantity;
            });
            
            $availableCapacity = $sector->capacity - $usedCapacity;
            
            return [
                'id' => $sector->id,
                'name' => $sector->name,
                'capacity' => $sector->capacity,
                'used_capacity' => $usedCapacity,
                'available_capacity' => max(0, $availableCapacity),
            ];
        });

        return Inertia::render('organizer/events/ticket-types/create', [
            'event' => $event,
            'function' => $function,
            'sectors' => $event->venue->sectors,
            'sectorsWithAvailability' => $sectorsWithAvailability,
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
            'sector_id' => 'required|exists:sectors,id',
            'quantity' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) use ($request) {
                    $sector = Sector::find($request->input('sector_id'));
                    $isBundle = $request->boolean('is_bundle');
                    $bundleQuantity = $request->input('bundle_quantity', 1);
                    
                    if ($sector) {
                        $realQuantity = $isBundle ? $value * $bundleQuantity : $value;
                        if ($realQuantity > $sector->capacity) {
                            $fail("La cantidad real de entradas ({$realQuantity}) no puede ser mayor que la capacidad del sector ({$sector->capacity}).");
                        }
                    }
                },
            ],
            'max_purchase_quantity' => [
                'required',
                'integer',
                'min:1',
                'max:50',
                function ($attribute, $value, $fail) use ($request) {
                    $quantity = $request->input('quantity');
                    if ($quantity && $value > $quantity) {
                        $fail("El máximo por compra no puede ser mayor que la cantidad total disponible.");
                    }
                },
            ],
            'sales_start_date' => 'required|date',
            'sales_end_date' => 'required|date|after_or_equal:sales_start_date',
            'is_hidden' => 'sometimes|boolean',
            'is_bundle' => 'sometimes|boolean',
            'bundle_quantity' => [
                'nullable',
                'integer',
                'min:2',
                'max:20',
                'required_if:is_bundle,true',
            ],
        ]);

        // Asociar el ID de la función a los datos validados
        $validated['event_function_id'] = $function->id;

        // Si no es bundle, asegurar que bundle_quantity sea null
        if (!$validated['is_bundle']) {
            $validated['bundle_quantity'] = null;
        }

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
            'sector_id' => 'required|exists:sectors,id',
            'quantity' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) use ($request, $ticketType) {
                    $sector = Sector::find($request->input('sector_id'));
                    $isBundle = $request->boolean('is_bundle');
                    $bundleQuantity = $request->input('bundle_quantity', 1);
                    
                    if ($sector) {
                        $realQuantity = $isBundle ? $value * $bundleQuantity : $value;
                        if ($realQuantity > $sector->capacity) {
                            $fail("La cantidad real de entradas ({$realQuantity}) no puede ser mayor que la capacidad del sector ({$sector->capacity}).");
                        }
                    }

                    // MODIFICACIÓN: Para bundles, validar contra lotes vendidos, no entradas emitidas
                    $currentSold = $ticketType->quantity_sold; // Lotes vendidos para bundles
                    if ($value < $currentSold) {
                        $bundleText = $ticketType->is_bundle ? 'lotes' : 'entradas';
                        $fail("No se puede reducir la cantidad por debajo de los {$bundleText} ya vendidos ({$currentSold}).");
                    }
                },
            ],
            'max_purchase_quantity' => [
                'required',
                'integer',
                'min:1',
                'max:50',
                function ($attribute, $value, $fail) use ($request) {
                    $quantity = $request->input('quantity');
                    if ($quantity && $value > $quantity) {
                        $fail("El máximo por compra no puede ser mayor que la cantidad total disponible.");
                    }
                },
            ],
            'sales_start_date' => 'required|date',
            'sales_end_date' => 'required|date|after_or_equal:sales_start_date',
            'is_hidden' => 'sometimes|boolean',
            'is_bundle' => 'sometimes|boolean',
            'bundle_quantity' => [
                'nullable',
                'integer',
                'min:2',
                'max:20',
                'required_if:is_bundle,true',
                function ($attribute, $value, $fail) use ($request, $ticketType) {
                    $isBundle = $request->boolean('is_bundle');
                    
                    // Si ya hay ventas y se está cambiando de bundle a normal o viceversa
                    if ($ticketType->quantity_sold > 0 && $ticketType->is_bundle !== $isBundle) {
                        $fail("No se puede cambiar el tipo de entrada (individual/lote) cuando ya hay ventas registradas.");
                    }
                    
                    // Si ya hay ventas y se está cambiando la cantidad del bundle
                    if ($ticketType->quantity_sold > 0 && $isBundle && $ticketType->bundle_quantity !== $value) {
                        $fail("No se puede cambiar la cantidad del lote cuando ya hay ventas registradas.");
                    }
                },
            ],
        ]);

        // Si no es bundle, asegurar que bundle_quantity sea null
        if (!$validated['is_bundle']) {
            $validated['bundle_quantity'] = null;
        }

        $ticketType->update($validated);

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with('success', 'Tipo de entrada actualizado exitosamente.');
    }

    /**
     * Cambia la visibilidad de un tipo de entrada (oculto/visible).
     */
    public function toggleVisibility(Event $event, EventFunction $function, TicketType $ticketType)
    {
        $ticketType->is_hidden = !$ticketType->is_hidden;
        $ticketType->save();

        if (request()->expectsJson()) {
            return response()->json(['success' => true, 'is_hidden' => $ticketType->is_hidden]);
        }

        return redirect()->route('organizer.events.tickets', $event->id);
    }

    /**
     * Duplica un tipo de entrada en todas las funciones de un evento, excepto en la función original.
     */
    public function duplicateAll(Request $request, Event $event, EventFunction $function, TicketType $ticketType): RedirectResponse
    {
        $validated = $request->validate([
            'functions' => 'required|array',
            'functions.*' => 'integer|exists:event_functions,id',
        ]);

        $functionIds = $validated['functions'];

        $functionsToDuplicateIn = EventFunction::where('event_id', $event->id)
            ->whereIn('id', $functionIds)
            ->get();

        foreach ($functionsToDuplicateIn as $func) {
            // Evitar duplicar en la función original o si ya existe un ticket con el mismo nombre y sector
            $exists = TicketType::where('event_function_id', $func->id)
                ->where('name', $ticketType->name)
                ->where('sector_id', $ticketType->sector_id)
                ->exists();

            if ($func->id === $ticketType->event_function_id || $exists) {
                continue;
            }

            TicketType::create([
                'name' => $ticketType->name,
                'description' => $ticketType->description,
                'price' => $ticketType->price,
                'quantity' => $ticketType->quantity,
                'max_purchase_quantity' => $ticketType->max_purchase_quantity,
                'sector_id' => $ticketType->sector_id,
                'sales_start_date' => $ticketType->sales_start_date,
                'sales_end_date' => $ticketType->sales_end_date,
                'is_hidden' => $ticketType->is_hidden,
                'is_bundle' => $ticketType->is_bundle,
                'bundle_quantity' => $ticketType->bundle_quantity,
                'event_function_id' => $func->id,
            ]);
        }

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with('success', 'Tipo de entrada duplicado en las funciones seleccionadas.');
    }

    /**
     * Elimina un tipo de entrada de la base de datos.
     */
    public function destroy(Event $event, EventFunction $function, TicketType $ticketType): RedirectResponse
    {
        // Verificar que no haya entradas vendidas
        if ($ticketType->quantity_sold > 0) {
            return redirect()->route('organizer.events.tickets', $event->id)
                ->with('error', 'No se puede eliminar un tipo de entrada que ya tiene ventas registradas.');
        }

        $ticketType->delete();

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with('success', 'Tipo de entrada eliminado exitosamente.');
    }
}