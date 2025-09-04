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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_url' => $this->image_url ?: "/placeholder.svg?height=300&width=400",
            'date' => $this->first_function?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
            'time' => $this->first_function?->start_time?->format('H:i') ?? '',
            'price' => $this->min_price,
            'location' => $this->venue?->name,
            'city' => $this->venue?->ciudad?->name,
            'province' => $this->venue?->provincia?->name,
            'category' => strtolower($this->category?->name),
            'featured' => $this->featured,
            'venue' => $this->venue,
            'status' => $this->getConsolidatedStatus(),
            'functions' => $this->whenLoaded('functions', function () {
                return $this->functions;
            }),
        ];
    }

    /**
     * Get the consolidated status for the event based on its functions.
     *
     * @return string
     */
    private function getConsolidatedStatus(): string
    {
        if ($this->resource->relationLoaded('functions')) {
            $functions = $this->functions;

            if ($functions->isEmpty()) {
                return EventFunctionStatus::UPCOMING->value;
            }

            $statuses = $functions->pluck('status')->map(fn ($s) => $s->value);

            if ($statuses->every(fn ($s) => $s === EventFunctionStatus::FINISHED->value)) {
                return EventFunctionStatus::FINISHED->value;
            }

            if ($statuses->every(fn ($s) => in_array($s, [EventFunctionStatus::SOLD_OUT->value, EventFunctionStatus::FINISHED->value]))) {
                return EventFunctionStatus::SOLD_OUT->value;
            }

            if ($statuses->contains(EventFunctionStatus::ON_SALE->value)) {
                return EventFunctionStatus::ON_SALE->value;
            }

            if ($statuses->contains(EventFunctionStatus::UPCOMING->value)) {
                return EventFunctionStatus::UPCOMING->value;
            }
        }

        // Default status
        return EventFunctionStatus::ON_SALE->value;
    }
}
