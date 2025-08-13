<?php
// filepath: database/seeders/CiudadSeeder.php

namespace Database\Seeders;

use App\Models\Ciudad;
use App\Models\Provincia;
use Illuminate\Database\Seeder;

class CiudadSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener provincias
        $buenosAires = Provincia::where('name', 'Buenos Aires')->first();
        $caba = Provincia::where('name', 'Ciudad Autónoma de Buenos Aires')->first();
        $cordoba = Provincia::where('name', 'Córdoba')->first();
        $santaFe = Provincia::where('name', 'Santa Fe')->first();
        $mendoza = Provincia::where('name', 'Mendoza')->first();
        $montevideo = Provincia::where('name', 'Montevideo')->first();

        $ciudades = [
            // CABA
            ['provincia_id' => $caba->id, 'name' => 'Ciudad Autónoma de Buenos Aires', 'postal_code' => 'C1000'],
            
            // Buenos Aires
            ['provincia_id' => $buenosAires->id, 'name' => 'La Plata', 'postal_code' => '1900'],
            ['provincia_id' => $buenosAires->id, 'name' => 'Mar del Plata', 'postal_code' => '7600'],
            ['provincia_id' => $buenosAires->id, 'name' => 'Bahía Blanca', 'postal_code' => '8000'],
            ['provincia_id' => $buenosAires->id, 'name' => 'San Nicolás', 'postal_code' => '2900'],
            ['provincia_id' => $buenosAires->id, 'name' => 'Tandil', 'postal_code' => '7000'],
            
            // Córdoba
            ['provincia_id' => $cordoba->id, 'name' => 'Córdoba', 'postal_code' => '5000'],
            ['provincia_id' => $cordoba->id, 'name' => 'Villa Carlos Paz', 'postal_code' => '5152'],
            ['provincia_id' => $cordoba->id, 'name' => 'Río Cuarto', 'postal_code' => '5800'],
            
            // Santa Fe
            ['provincia_id' => $santaFe->id, 'name' => 'Rosario', 'postal_code' => '2000'],
            ['provincia_id' => $santaFe->id, 'name' => 'Santa Fe', 'postal_code' => '3000'],
            
            // Mendoza
            ['provincia_id' => $mendoza->id, 'name' => 'Mendoza', 'postal_code' => '5500'],
            
            // Uruguay
            ['provincia_id' => $montevideo->id, 'name' => 'Montevideo', 'postal_code' => '11000'],
        ];

        foreach ($ciudades as $ciudad) {
            Ciudad::create($ciudad);
        }
    }
}