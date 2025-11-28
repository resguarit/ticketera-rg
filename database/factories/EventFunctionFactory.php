<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Event; // Importar Modelo
use App\Enums\EventFunctionStatus; // Importar Enum

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventFunction>
 */
class EventFunctionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => $this->faker->sentence,
            'description' => $this->faker->sentence,
            'start_time' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
            'end_time' => $this->faker->dateTimeBetween('+1 month', '+2 months'),
            'status' => EventFunctionStatus::UPCOMING,
            'is_active' => true,
        ];
    }
}
