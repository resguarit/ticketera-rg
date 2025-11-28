<?php
// filepath: database/seeders/SectorSeeder.php

namespace Database\Seeders;

use App\Models\Sector;
use App\Models\Venue;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    public function run(): void
    {
        $venues = Venue::all();

        foreach ($venues as $venue) {
            // Crear sectores básicos para cada venue
            $sectors = $this->getSectorsForVenue($venue->name);
            
            foreach ($sectors as $sectorData) {
                Sector::create([
                    'venue_id' => $venue->id,
                    'name' => $sectorData['name'],
                    'capacity' => $sectorData['capacity'],
                ]);
            }
        }
    }

    private function getSectorsForVenue(string $venueName): array
    {
        switch ($venueName) {
            case 'Estadio Nacional':
                return [
                    ['name' => 'Campo', 'capacity' => 15000],
                    ['name' => 'Platea Baja', 'capacity' => 8000],
                    ['name' => 'Platea Alta', 'capacity' => 12000],
                    ['name' => 'Palcos VIP', 'capacity' => 500],
                ];

            case 'Teatro Colón':
                return [
                    ['name' => 'Platea', 'capacity' => 800],
                    ['name' => 'Primer Piso', 'capacity' => 400],
                    ['name' => 'Segundo Piso', 'capacity' => 300],
                    ['name' => 'Palcos', 'capacity' => 200],
                ];

            case 'Luna Park':
                return [
                    ['name' => 'Campo', 'capacity' => 3000],
                    ['name' => 'Platea', 'capacity' => 2000],
                    ['name' => 'Pullman', 'capacity' => 1500],
                ];

            case 'Teatro San Martín':
                return [
                    ['name' => 'Platea', 'capacity' => 400],
                    ['name' => 'Primer Piso', 'capacity' => 150],
                    ['name' => 'Segundo Piso', 'capacity' => 100],
                ];

            case 'Parque Centenario':
                return [
                    ['name' => 'General', 'capacity' => 10000],
                    ['name' => 'VIP', 'capacity' => 500],
                ];

            case 'Estadio Centenario':
                return [
                    ['name' => 'Popular', 'capacity' => 20000],
                    ['name' => 'Platea', 'capacity' => 5000],
                    ['name' => 'Palcos', 'capacity' => 500],
                ];

            case 'Centro de Convenciones':
                return [
                    ['name' => 'Auditorio Principal', 'capacity' => 1000],
                    ['name' => 'Sala de Workshops', 'capacity' => 200],
                ];

            case 'Club de Tenis':
                return [
                    ['name' => 'Tribuna Principal', 'capacity' => 800],
                    ['name' => 'Tribuna Lateral', 'capacity' => 400],
                    ['name' => 'Palcos VIP', 'capacity' => 200],
                ];

            default:
                return [
                    ['name' => 'General', 'capacity' => 1000],
                ];
        }
    }
}