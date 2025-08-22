<?php

namespace App\Http\Resources;

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

            //
            'date' => $this->first_function?->start_time?->format('d M Y') ?? 'Fecha por confirmar',
            'time' => $this->first_function?->start_time?->format('H:i') ?? '',
            'price' => $this->min_price,
            'location' => $this->venue?->name,
            'city' => $this->venue?->ciudad?->name,
            'province' => $this->venue?->provincia?->name,
            'category' => strtolower($this->category?->name),
            'featured' => $this->featured,
            'venue' => $this->venue,
        ];
    }
}
