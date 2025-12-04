<?php

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Person>
 */
class PersonFactory extends Factory
{
    protected $model = Person::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'dni' => fake()->unique()->numerify('########'), // Genera un DNI de 8 números
            'phone' => fake()->optional()->numerify('##########'),
            'address' => fake()->optional()->address(),
        ];
    }

    /**
     * Person without DNI.
     */
    public function withoutDni(): static
    {
        return $this->state(fn (array $attributes) => [
            'dni' => null,
        ]);
    }

    /**
     * Person with specific DNI.
     */
    public function withDni(string $dni): static
    {
        return $this->state(fn (array $attributes) => [
            'dni' => $dni,
        ]);
    }
}
