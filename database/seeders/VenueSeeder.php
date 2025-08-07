<?php
// filepath: database/seeders/VenueSeeder.php

namespace Database\Seeders;

use App\Models\Venue;
use Illuminate\Database\Seeder;

class VenueSeeder extends Seeder
{
    public function run(): void
    {
        $venues = [
            [
                'name' => 'Estadio Nacional',
                'address' => 'Av. Figueroa Alcorta 7597, Buenos Aires, Argentina',
                'coordinates' => '-34.5454,-58.4498',
                'banner_url' => '/venues/estadio-nacional.jpg',
                'referring' => 'El estadio más icónico de Buenos Aires, ideal para grandes eventos deportivos y musicales.',
            ],
            [
                'name' => 'Teatro Colón',
                'address' => 'Cerrito 628, C1010AAR CABA, Argentina',
                'coordinates' => '-34.6009,-58.3830',
                'banner_url' => '/venues/teatro-colon.jpg',
                'referring' => 'Teatro de ópera histórico con acústica mundialmente reconocida.',
            ],
            [
                'name' => 'Luna Park',
                'address' => 'Bouchard 465, C1106ABG CABA, Argentina',
                'coordinates' => '-34.6118,-58.3691',
                'banner_url' => '/venues/luna-park.jpg',
                'referring' => 'Estadio cubierto ideal para conciertos y eventos deportivos.',
            ],
            [
                'name' => 'Teatro San Martín',
                'address' => 'Av. Corrientes 1530, C1042AAO CABA, Argentina',
                'coordinates' => '-34.6033,-58.3886',
                'banner_url' => '/venues/teatro-san-martin.jpg',
                'referring' => 'Complejo teatral con múltiples salas para diversas producciones.',
            ],
            [
                'name' => 'Parque Centenario',
                'address' => 'Av. Patricias Argentinas, CABA, Argentina',
                'coordinates' => '-34.6086,-58.4317',
                'banner_url' => '/venues/parque-centenario.jpg',
                'referring' => 'Espacio al aire libre perfecto para festivales y eventos masivos.',
            ],
            [
                'name' => 'Estadio Centenario',
                'address' => 'Av. Ricaldoni, 11600 Montevideo, Uruguay',
                'coordinates' => '-34.8946,-56.1636',
                'banner_url' => '/venues/estadio-centenario.jpg',
                'referring' => 'Estadio histórico de Uruguay, sede de la primera Copa Mundial.',
            ],
            [
                'name' => 'Centro de Convenciones',
                'address' => 'Puerto Madero, Buenos Aires, Argentina',
                'coordinates' => '-34.6118,-58.3634',
                'banner_url' => '/venues/centro-convenciones.jpg',
                'referring' => 'Moderno centro de convenciones para eventos empresariales.',
            ],
            [
                'name' => 'Club de Tenis',
                'address' => 'Rosario, Santa Fe, Argentina',
                'coordinates' => '-32.9442,-60.6505',
                'banner_url' => '/venues/club-tenis.jpg',
                'referring' => 'Club deportivo especializado en tenis con canchas profesionales.',
            ],
        ];

        foreach ($venues as $venue) {
            Venue::create($venue);
        }
    }
}