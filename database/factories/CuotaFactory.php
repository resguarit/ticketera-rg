<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cuota>
 */
class CuotaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(), // CAMBIAR: era organizer_id
            'bin' => $this->faker->numerify('######'),
            'cantidad_cuotas' => $this->faker->randomElement([1, 3, 6, 12]),
            'habilitada' => true,
            'banco' => $this->faker->randomElement(['Visa', 'Mastercard', 'American Express']),
        ];
    }
}
