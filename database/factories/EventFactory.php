<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Organizer;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'organizer_id' => Organizer::factory(), // Crear organizer automáticamente
            'venue_id' => Venue::factory(), // Crear venue automáticamente
            'category_id' => Category::factory(), // Crear category automáticamente
            'tax' => 0.10, // 10% servicio
            'is_archived' => false,
        ];
    }
}
