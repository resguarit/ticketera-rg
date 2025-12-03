<?php

namespace Database\Factories;

use App\Models\Ciudad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Venue>
 */
class VenueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company . ' Hall',
            'address' => $this->faker->streetAddress,
            'ciudad_id' => Ciudad::factory(),
            'coordinates' => $this->faker->latitude . ',' . $this->faker->longitude,
            'banner_url' => null,
            'referring' => $this->faker->name,
        ];
    }
}
