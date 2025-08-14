<?php
// filepath: database/seeders/ProvinciaSeeder.php

namespace Database\Seeders;

use App\Models\Provincia;
use Illuminate\Database\Seeder;

class ProvinciaSeeder extends Seeder
{
    public function run(): void
    {
        $provincias = [
            // Argentina
            ['name' => 'Buenos Aires', 'code' => 'BA', 'country' => 'Argentina'],
            ['name' => 'Ciudad Autónoma de Buenos Aires', 'code' => 'CABA', 'country' => 'Argentina'],
            ['name' => 'Córdoba', 'code' => 'CB', 'country' => 'Argentina'],
            ['name' => 'Santa Fe', 'code' => 'SF', 'country' => 'Argentina'],
            ['name' => 'Mendoza', 'code' => 'MZ', 'country' => 'Argentina'],
            ['name' => 'Tucumán', 'code' => 'TM', 'country' => 'Argentina'],
            ['name' => 'Entre Ríos', 'code' => 'ER', 'country' => 'Argentina'],
            ['name' => 'Salta', 'code' => 'SA', 'country' => 'Argentina'],
            ['name' => 'Misiones', 'code' => 'MN', 'country' => 'Argentina'],
            ['name' => 'Chaco', 'code' => 'CC', 'country' => 'Argentina'],
            ['name' => 'Corrientes', 'code' => 'CN', 'country' => 'Argentina'],
            ['name' => 'Santiago del Estero', 'code' => 'SE', 'country' => 'Argentina'],
            ['name' => 'Jujuy', 'code' => 'JY', 'country' => 'Argentina'],
            ['name' => 'San Juan', 'code' => 'SJ', 'country' => 'Argentina'],
            ['name' => 'San Luis', 'code' => 'SL', 'country' => 'Argentina'],
            ['name' => 'Catamarca', 'code' => 'CT', 'country' => 'Argentina'],
            ['name' => 'La Rioja', 'code' => 'LR', 'country' => 'Argentina'],
            ['name' => 'Formosa', 'code' => 'FM', 'country' => 'Argentina'],
            ['name' => 'Chubut', 'code' => 'CH', 'country' => 'Argentina'],
            ['name' => 'Río Negro', 'code' => 'RN', 'country' => 'Argentina'],
            ['name' => 'Neuquén', 'code' => 'NQ', 'country' => 'Argentina'],
            ['name' => 'Santa Cruz', 'code' => 'SC', 'country' => 'Argentina'],
            ['name' => 'Tierra del Fuego', 'code' => 'TF', 'country' => 'Argentina'],
            ['name' => 'La Pampa', 'code' => 'LP', 'country' => 'Argentina'],
            
            // Uruguay
            ['name' => 'Montevideo', 'code' => 'MO', 'country' => 'Uruguay'],
            ['name' => 'Canelones', 'code' => 'CA', 'country' => 'Uruguay'],
            ['name' => 'Maldonado', 'code' => 'MA', 'country' => 'Uruguay'],
            ['name' => 'Colonia', 'code' => 'CO', 'country' => 'Uruguay'],
        ];

        foreach ($provincias as $provincia) {
            Provincia::create($provincia);
        }
    }
}