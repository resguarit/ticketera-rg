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

            // Crear personas y usuarios base
            $person = Person::create([
                'name' => 'Juan',
                'last_name' => 'Gimenez',
            ]);

            User::create([
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => UserRole::ADMIN,
                'person_id' => $person->id,
            ]);

            $person = Person::create([
                'name' => 'Federico',
                'last_name' => 'Perez',
                'dni' => '87654321',
            ]);

            User::create([
                'email' => 'organizer@example.com',
                'password' => bcrypt('password'),
                'role' => UserRole::ORGANIZER,
                'person_id' => $person->id,
            ]);

            // Ejecutar seeders de las tablas principales
            $this->call([
                ProvinciaSeeder::class,
                CiudadSeeder::class,
                CategorySeeder::class,
                VenueSeeder::class,
                SectorSeeder::class,
                OrganizerSeeder::class,
                EventSeeder::class,
                EventFunctionSeeder::class,
                TicketTypeSeeder::class,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
