<?php

namespace Database\Factories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sector>
 */
class SectorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'venue_id' => Venue::factory(),
            'name' => $this->faker->randomElement(['Platea', 'Pullman', 'Tribuna', 'Campo', 'VIP']),
            'capacity' => $this->faker->numberBetween(100, 1000),
            'description' => $this->faker->sentence,
        ];
    }
}
