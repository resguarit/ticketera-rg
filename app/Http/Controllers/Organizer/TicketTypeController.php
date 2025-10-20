<?php
// filepath: app/Http/Controllers/Organizer/TicketTypeController.php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'quantity' => 'required|integer|min:1',
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
            'sales_end_date' => 'nullable|date|after_or_equal:sales_start_date',
            'is_hidden' => 'sometimes|boolean',
            'is_bundle' => 'sometimes|boolean',
            'bundle_quantity' => [
                'nullable',
                'integer',
                'min:2',
                'max:20',
                'required_if:is_bundle,true',
            ],
            'create_stages' => 'sometimes|boolean',
            'stages_count' => 'nullable|integer|min:2|max:10|required_if:create_stages,true',
            'price_increment' => 'nullable|numeric|min:0|max:100|required_if:create_stages,true',
        ], [
            'name.required' => 'El nombre de la entrada es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un número válido.',
            'price.min' => 'El precio no puede ser negativo.',
            'sector_id.required' => 'Debe seleccionar un sector.',
            'quantity.required' => 'La cantidad es obligatoria.',
            'quantity.min' => 'La cantidad debe ser mayor a 0.',
            'max_purchase_quantity.required' => 'El máximo por compra es obligatorio.',
            'sales_start_date.required' => 'La fecha de inicio de venta es obligatoria.',
        ]);

        try {
            DB::beginTransaction();

            // Asociar el ID de la función a los datos validados
            $validated['event_function_id'] = $function->id;

            // Si no es bundle, asegurar que bundle_quantity sea null
            if (!$validated['is_bundle']) {
                $validated['bundle_quantity'] = null;
            }

            // NUEVA LÓGICA: Crear tandas o entrada normal
            if ($validated['create_stages'] ?? false) {
                $result = $this->createStages($validated, $event, $function);
                DB::commit();
                return $result;
            }

            // Lógica existente para entrada normal
            $result = $this->createSingleTicketType($validated, $event, $function);
            DB::commit();
            return $result;

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Error creating ticket type: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Error al crear la entrada: ' . $e->getMessage()])
                        ->withInput();
        }
    }

    /**
     * Crea múltiples tandas de un tipo de entrada
     */
    private function createStages(array $validated, Event $event, EventFunction $function): RedirectResponse
    {
        $stagesCount = $validated['stages_count'];
        $priceIncrement = $validated['price_increment'] / 100; // Convertir porcentaje a decimal
        $basePrice = $validated['price'];
        $baseName = $validated['name'];
        
        // Verificar capacidad total para todas las tandas
        $sector = Sector::find($validated['sector_id']);
        $isBundle = $validated['is_bundle'] ?? false;
        $bundleQuantity = $validated['bundle_quantity'] ?? 1;
        $realQuantityPerStage = $isBundle ? $validated['quantity'] * $bundleQuantity : $validated['quantity'];
        $totalRealQuantity = $realQuantityPerStage * $stagesCount;
        
        // Calcular capacidad ya utilizada
        $usedCapacity = TicketType::where('event_function_id', $function->id)
            ->where('sector_id', $sector->id)
            ->get()
            ->sum(function ($ticketType) {
                return $ticketType->is_bundle 
                    ? $ticketType->quantity * $ticketType->bundle_quantity
                    : $ticketType->quantity;
            });
        
        $totalAfterCreation = $usedCapacity + $totalRealQuantity;
        $createdStages = [];
        
        // Crear cada tanda
        for ($i = 1; $i <= $stagesCount; $i++) {
            $stagePrice = $basePrice * (1 + ($priceIncrement * ($i - 1)));
            
            $stageData = $validated;
            $stageData['name'] = $baseName . ' ' . $i;
            $stageData['price'] = $stagePrice;
            $stageData['is_hidden'] = $i > 1; // Solo la primera tanda visible
            
            // Remover campos específicos de tandas antes de crear
            unset($stageData['create_stages'], $stageData['stages_count'], $stageData['price_increment']);
            
            $ticketType = TicketType::create($stageData);
            $createdStages[] = $ticketType;
        }
        
        // Preparar mensaje
        $message = "Se crearon {$stagesCount} tandas exitosamente:";
        foreach ($createdStages as $stage) {
            $status = $stage->is_hidden ? '(Oculta)' : '(Activa)';
            $message .= "\n• {$stage->name}: \${$stage->price} {$status}";
        }
        
        if ($totalAfterCreation > $sector->capacity) {
            $excess = $totalAfterCreation - $sector->capacity;
            $message .= "\n\n⚠️ ATENCIÓN: Has superado la capacidad del sector '{$sector->name}' por {$excess} entradas. Total asignado: {$totalAfterCreation}/{$sector->capacity}.";
        }

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with($totalAfterCreation > $sector->capacity ? 'warning' : 'success', $message);
    }

    /**
     * Crea una sola entrada (lógica existente)
     */
    private function createSingleTicketType(array $validated, Event $event, EventFunction $function): RedirectResponse
    {
        // Verificar si se supera la capacidad y agregar mensaje de advertencia
        $sector = Sector::find($validated['sector_id']);
        $isBundle = $validated['is_bundle'] ?? false;
        $bundleQuantity = $validated['bundle_quantity'] ?? 1;
        $realQuantity = $isBundle ? $validated['quantity'] * $bundleQuantity : $validated['quantity'];
        
        // Calcular capacidad ya utilizada
        $usedCapacity = TicketType::where('event_function_id', $function->id)
            ->where('sector_id', $sector->id)
            ->get()
            ->sum(function ($ticketType) {
                return $ticketType->is_bundle 
                    ? $ticketType->quantity * $ticketType->bundle_quantity
                    : $ticketType->quantity;
            });
        
        $totalAfterCreation = $usedCapacity + $realQuantity;
        $message = 'Tipo de entrada creado exitosamente.';
        
        if ($totalAfterCreation > $sector->capacity) {
            $excess = $totalAfterCreation - $sector->capacity;
            $message = "Tipo de entrada creado exitosamente. ⚠️ ATENCIÓN: Has superado la capacidad del sector '{$sector->name}' por {$excess} entradas. Total asignado: {$totalAfterCreation}/{$sector->capacity}.";
        }

        // Remover campos específicos de tandas antes de crear
        unset($validated['create_stages'], $validated['stages_count'], $validated['price_increment']);
        
        TicketType::create($validated);

        return redirect()->route('organizer.events.tickets', $event->id)
            ->with($totalAfterCreation > $sector->capacity ? 'warning' : 'success', $message);
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
                    $currentSold = $ticketType->quantity_sold;
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
            'sales_end_date' => 'nullable|date|after_or_equal:sales_start_date',
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
                    
                    if ($ticketType->quantity_sold > 0 && $ticketType->is_bundle !== $isBundle) {
                        $fail("No se puede cambiar el tipo de entrada (individual/lote) cuando ya hay ventas registradas.");
                    }
                    
                    if ($ticketType->quantity_sold > 0 && $isBundle && $ticketType->bundle_quantity !== $value) {
                        $fail("No se puede cambiar la cantidad del lote cuando ya hay ventas registradas.");
                    }
                },
            ],
        ], [
            'name.required' => 'El nombre de la entrada es obligatorio.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un número válido.',
            'sector_id.required' => 'Debe seleccionar un sector.',
            'quantity.required' => 'La cantidad es obligatoria.',
            'max_purchase_quantity.required' => 'El máximo por compra es obligatorio.',
            'sales_start_date.required' => 'La fecha de inicio de venta es obligatoria.',
        ]);

        try {
            DB::beginTransaction();

            // Si no es bundle, asegurar que bundle_quantity sea null
            if (!$validated['is_bundle']) {
                $validated['bundle_quantity'] = null;
            }

            // Verificar capacidad después de la actualización
            $sector = Sector::find($validated['sector_id']);
            $isBundle = $validated['is_bundle'] ?? false;
            $bundleQuantity = $validated['bundle_quantity'] ?? 1;
            $realQuantity = $isBundle ? $validated['quantity'] * $bundleQuantity : $validated['quantity'];
            
            // Calcular capacidad ya utilizada (excluyendo el ticket que se está actualizando)
            $usedCapacity = TicketType::where('event_function_id', $function->id)
                ->where('sector_id', $sector->id)
                ->where('id', '!=', $ticketType->id)
                ->get()
                ->sum(function ($tt) {
                    return $tt->is_bundle 
                        ? $tt->quantity * $tt->bundle_quantity
                        : $tt->quantity;
                });
            
            $totalAfterUpdate = $usedCapacity + $realQuantity;
            $message = 'Tipo de entrada actualizado exitosamente.';
            
            if ($totalAfterUpdate > $sector->capacity) {
                $excess = $totalAfterUpdate - $sector->capacity;
                $message = "Tipo de entrada actualizado exitosamente. ⚠️ ATENCIÓN: Has superado la capacidad del sector '{$sector->name}' por {$excess} entradas. Total asignado: {$totalAfterUpdate}/{$sector->capacity}.";
            }

            $ticketType->update($validated);

            DB::commit();

            return redirect()->route('organizer.events.tickets', $event->id)
                ->with($totalAfterUpdate > $sector->capacity ? 'warning' : 'success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Error updating ticket type: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Error al actualizar la entrada: ' . $e->getMessage()])
                        ->withInput();
        }
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
        try {
            // Verificar que no haya entradas vendidas
            if ($ticketType->quantity_sold > 0) {
                return redirect()->route('organizer.events.tickets', $event->id)
                    ->with('error', 'No se puede eliminar un tipo de entrada que ya tiene ventas registradas.');
            }

            DB::beginTransaction();

            $ticketType->delete();

            DB::commit();

            return redirect()->route('organizer.events.tickets', $event->id)
                ->with('success', 'Tipo de entrada eliminado exitosamente.');

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Error deleting ticket type: ' . $e->getMessage());
            
            return redirect()->route('organizer.events.tickets', $event->id)
                ->with('error', 'Error al eliminar la entrada: ' . $e->getMessage());
        }
    }
}