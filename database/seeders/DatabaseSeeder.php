<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Enums\UserRole;
use Illuminate\Support\Facades\DB;
use App\Models\Person;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        try {
            DB::beginTransaction();

            $person = Person::create([
                'name' => 'Jorge',
                'last_name' => 'Raul',
            ]);

            User::create([
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => UserRole::ADMIN,
                'person_id' => $person->id,
                'password_changed_at' => now(),
            ]);

            $this->call([
                ProvinciaSeeder::class,
                CiudadSeeder::class,
                CategorySeeder::class,
                FaqCategorySeeder::class,
                FaqSeeder::class,
                PaymentMethodSeeder::class,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
