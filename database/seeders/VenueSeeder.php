<?php

// filepath: database/seeders/VenueSeeder.php

namespace Database\Seeders;

use App\Models\Ciudad;
use App\Models\Venue;
use Illuminate\Database\Seeder;

class VenueSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener ciudades
        $buenosAires = Ciudad::where('name', 'Ciudad Autónoma de Buenos Aires')->first();
        $rosario = Ciudad::where('name', 'Rosario')->first();
        $montevideo = Ciudad::where('name', 'Montevideo')->first();

        $venues = [
            [
                'name' => 'Estadio Nacional',
                'address' => 'Av. Figueroa Alcorta 7597', // Solo calle y altura
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.5454,-58.4498',
                'banner_url' => 'recintos/estadio-nacional.jpg',
                'referring' => 'El estadio más icónico de Buenos Aires, ideal para grandes eventos deportivos y musicales.',
            ],
            [
                'name' => 'Teatro Colón',
                'address' => 'Cerrito 628',
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.6009,-58.3830',
                'banner_url' => 'recintos/teatro-colon.jpg',
                'referring' => 'Teatro de ópera histórico con acústica mundialmente reconocida.',
            ],
            [
                'name' => 'Luna Park',
                'address' => 'Bouchard 465',
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.6118,-58.3691',
                'banner_url' => 'recintos/luna-park.jpg',
                'referring' => 'Estadio cubierto ideal para conciertos y eventos deportivos.',
            ],
            [
                'name' => 'Teatro San Martín',
                'address' => 'Av. Corrientes 1530',
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.6033,-58.3886',
                'banner_url' => 'recintos/teatro-san-martin.jpg',
                'referring' => 'Complejo teatral con múltiples salas para diversas producciones.',
            ],
            [
                'name' => 'Parque Centenario',
                'address' => 'Av. Patricias Argentinas s/n',
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.6086,-58.4317',
                'banner_url' => 'recintos/parque-centenario.jpg',
                'referring' => 'Espacio al aire libre perfecto para festivales y eventos masivos.',
            ],
            [
                'name' => 'Centro de Convenciones',
                'address' => 'Puerto Madero, Dique 4',
                'ciudad_id' => $buenosAires->id,
                'coordinates' => '-34.6118,-58.3634',
                'banner_url' => 'recintos/centro-convenciones.jpg',
                'referring' => 'Moderno centro de convenciones para eventos empresariales.',
            ],
            [
                'name' => 'Club de Tenis',
                'address' => 'Av. Pellegrini 1050',
                'ciudad_id' => $rosario->id,
                'coordinates' => '-32.9442,-60.6505',
                'banner_url' => 'recintos/club-tenis.jpg',
                'referring' => 'Club deportivo especializado en tenis con canchas profesionales.',
            ],
            [
                'name' => 'Estadio Centenario',
                'address' => 'Av. Ricaldoni s/n',
                'ciudad_id' => $montevideo->id,
                'coordinates' => '-34.8946,-56.1636',
                'banner_url' => 'recintos/estadio-centenario.jpg',
                'referring' => 'Estadio histórico de Uruguay, sede de la primera Copa Mundial.',
            ],
        ];

        foreach ($venues as $venue) {
            Venue::create($venue);
        }
    }
}
