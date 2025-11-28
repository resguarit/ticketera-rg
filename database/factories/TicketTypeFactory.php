<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\EventFunction;
use App\Models\Sector;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketType>
 */
class TicketTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_function_id' => EventFunction::factory(),
            'sector_id' => Sector::factory(),
            'name' => 'General',
            'description' => $this->faker->sentence,
            'price' => 1000,
            'sales_start_date' => Carbon::now(),
            'sales_end_date' => Carbon::now()->addDays(30),
            'quantity' => 100,
            'quantity_sold' => 0,
            'max_purchase_quantity' => 10,
            'is_hidden' => false,
            'is_bundle' => false,
            'bundle_quantity' => null,
        ];
    }
}
