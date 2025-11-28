<?php

namespace App\Http\Resources;

use App\Enums\EventFunctionStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Obtener la primera función activa para mostrar fecha/hora
        $firstFunction = $this->functions->where('is_active', true)->sortBy('start_time')->first();
        
        // Calcular precio mínimo
        $minPrice = null;
        foreach ($this->functions as $function) {
            foreach ($function->ticketTypes->where('is_hidden', false) as $ticketType) {
                if ($ticketType->price > 0) {
                    if ($minPrice === null || $ticketType->price < $minPrice) {
                        $minPrice = $ticketType->price;
                    }
                }
            }
        }

        // Verificar si tiene tipos de tickets
        $hasTicketTypes = $this->functions->flatMap(function ($function) {
            return $function->ticketTypes->where('is_hidden', false);
        })->isNotEmpty();

        // Verificar si tiene tickets gratuitos
        $hasFreeTickets = $this->functions->flatMap(function ($function) {
            return $function->ticketTypes->where('is_hidden', false)->where('price', 0);
        })->isNotEmpty();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'image_url' => $this->image_url ?: "/placeholder.svg?height=400&width=800",
            'featured' => $this->featured ?? false,
            'location' => $this->venue->name,
            'city' => $this->venue->ciudad ? $this->venue->ciudad->name : 'Sin ciudad',
            'province' => $this->venue->ciudad && $this->venue->ciudad->provincia ?
                $this->venue->ciudad->provincia->name : null,
            'category' => $this->category->name,
            'date' => $firstFunction ? $firstFunction->start_time->format('d M Y') : 'Fecha por confirmar',
            'time' => $firstFunction ? $firstFunction->start_time->format('H:i') : null,
            'price' => $minPrice,
            'has_ticket_types' => $hasTicketTypes,
            'has_free_tickets' => $hasFreeTickets,
            'venue' => [
                'id' => $this->venue->id,
                'name' => $this->venue->name,
                'address' => $this->venue->address,
            ],
            'functions' => $this->functions->map(function ($function) {
                return [
                    'id' => $function->id,
                    'start_time' => $function->start_time,
                    'status' => $function->status->value,
                ];
            }),
            'status' => $this->getConsolidatedStatus(), // Método para obtener estado consolidado con label y color
        ];
    }

    /**
     * Obtener el estado consolidado del evento basado en todas sus funciones
     */
    private function getConsolidatedStatus(): array
    {
        if ($this->functions->isEmpty()) {
            return [
                'value' => EventFunctionStatus::UPCOMING->value,
                'label' => EventFunctionStatus::UPCOMING->label(),
                'color' => EventFunctionStatus::UPCOMING->color(),
            ];
        }

        // Orden de prioridad para determinar el estado del evento
        $priorityOrder = [
            EventFunctionStatus::ON_SALE->value => 1,
            EventFunctionStatus::UPCOMING->value => 2,
            EventFunctionStatus::REPROGRAMMED->value => 3,
            EventFunctionStatus::CANCELLED->value => 4,
            EventFunctionStatus::SOLD_OUT->value => 5,
            EventFunctionStatus::INACTIVE->value => 6,
            EventFunctionStatus::FINISHED->value => 7,
        ];

        // Obtener funciones activas
        $activeFunctions = $this->functions->where('is_active', true);

        // Si no hay funciones activas, usar todas las funciones
        $functionsToCheck = $activeFunctions->isNotEmpty() ? $activeFunctions : $this->functions;

        // Obtener la función con el estado de mayor prioridad
        $primaryFunction = $functionsToCheck
            ->sortBy(function($function) use ($priorityOrder) {
                return $priorityOrder[$function->status->value] ?? 999;
            })
            ->first();

        if (!$primaryFunction) {
            return [
                'value' => EventFunctionStatus::UPCOMING->value,
                'label' => EventFunctionStatus::UPCOMING->label(),
                'color' => EventFunctionStatus::UPCOMING->color(),
            ];
        }

        return [
            'value' => $primaryFunction->status->value,
            'label' => $primaryFunction->status->label(),
            'color' => $primaryFunction->status->color(),
        ];
    }
}
