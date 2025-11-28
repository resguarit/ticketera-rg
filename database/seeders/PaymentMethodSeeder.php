<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('payment_method')->insert([
            ['name' => 'visa_credito', 'payway_id' => 1],
            ['name' => 'visa_debito', 'payway_id' => 31],
            ['name' => 'mastercard_credito', 'payway_id' => 104],
            ['name' => 'mastercard_debito', 'payway_id' => 105],
            ['name' => 'amex', 'payway_id' => 111],
            ['name' => 'visa_prepaga', 'payway_id' => 114],
            ['name' => 'mastercard_prepaga', 'payway_id' => 116],
        ]);
    }
}
