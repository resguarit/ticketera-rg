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
            'status' => $this->getConsolidatedStatus(), // Método para obtener estado consolidado
        ];
    }

    /**
     * Obtener el estado consolidado del evento basado en todas sus funciones
     */
    private function getConsolidatedStatus()
    {
        if ($this->functions->isEmpty()) {
            return 'upcoming';
        }

        $statuses = $this->functions->pluck('status')->map(function ($status) {
            return $status->value;
        })->unique();

        // Si hay al menos una función en venta, el evento está en venta
        if ($statuses->contains('on_sale')) {
            return 'on_sale';
        }

        // Si todas están agotadas, el evento está agotado
        if ($statuses->every(fn ($status) => $status === 'sold_out')) {
            return 'sold_out';
        }

        // Si todas están finalizadas, el evento está finalizado
        if ($statuses->every(fn ($status) => $status === 'finished')) {
            return 'finished';
        }

        // Si hay alguna inactiva y el resto son upcoming, es upcoming
        if ($statuses->contains('upcoming') || $statuses->contains('inactive')) {
            return 'upcoming';
        }

        return 'upcoming';
    }
}
