<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organizer>
 */
class OrganizerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            'referring' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'logo_url' => null,
            'facebook_url' => 'https://facebook.com/' . $this->faker->userName,
            'instagram_url' => 'https://instagram.com/' . $this->faker->userName,
            'twitter_url' => 'https://twitter.com/' . $this->faker->userName,
            'tax' => 10.00, // 10% por defecto
            'decidir_public_key_prod' => null,
            'decidir_secret_key_prod' => null,
            'decidir_public_key_test' => 'test_public_key',
            'decidir_secret_key_test' => 'test_secret_key',
        ];
    }
}
