<?php
// filepath: database/seeders/EventFunctionSeeder.php

namespace Database\Seeders;

use App\Models\EventFunction;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventFunctionSeeder extends Seeder
{
    public function run(): void
    {
        $functions = [
            // Festival de Música Electrónica 2024
            [
                'event_id' => 1,
                'name' => 'Día 1 - Escenario Principal',
                'description' => 'Primera jornada del festival con los headliners principales',
                'start_time' => Carbon::create(2024, 3, 15, 20, 0),
                'end_time' => Carbon::create(2024, 3, 16, 4, 0),
                'is_active' => true,
            ],
            [
                'event_id' => 1,
                'name' => 'Día 2 - Escenario Principal',
                'description' => 'Segunda jornada del festival',
                'start_time' => Carbon::create(2024, 3, 16, 20, 0),
                'end_time' => Carbon::create(2024, 3, 17, 4, 0),
                'is_active' => true,
            ],
            
            // Concierto Sinfónico de Primavera
            [
                'event_id' => 2,
                'name' => 'Función Única',
                'description' => 'Concierto sinfónico con la Orquesta Nacional',
                'start_time' => Carbon::create(2024, 3, 22, 19, 30),
                'end_time' => Carbon::create(2024, 3, 22, 22, 0),
                'is_active' => true,
            ],
            
            // Copa Mundial de Fútbol
            [
                'event_id' => 3,
                'name' => 'Partido Clasificatorio',
                'description' => 'Argentina vs Brasil - Eliminatorias',
                'start_time' => Carbon::create(2024, 3, 30, 16, 0),
                'end_time' => Carbon::create(2024, 3, 30, 18, 0),
                'is_active' => true,
            ],
            
            // Romeo y Julieta
            [
                'event_id' => 4,
                'name' => 'Función de Viernes',
                'description' => 'Representación de Romeo y Julieta',
                'start_time' => Carbon::create(2024, 4, 5, 21, 0),
                'end_time' => Carbon::create(2024, 4, 5, 23, 30),
                'is_active' => true,
            ],
            [
                'event_id' => 4,
                'name' => 'Función de Sábado',
                'description' => 'Representación de Romeo y Julieta',
                'start_time' => Carbon::create(2024, 4, 6, 21, 0),
                'end_time' => Carbon::create(2024, 4, 6, 23, 30),
                'is_active' => true,
            ],
            
            // Festival de Jazz
            [
                'event_id' => 5,
                'name' => 'Día 1 - Jazz Clásico',
                'description' => 'Primera jornada con jazz tradicional',
                'start_time' => Carbon::create(2024, 4, 12, 18, 0),
                'end_time' => Carbon::create(2024, 4, 12, 23, 0),
                'is_active' => true,
            ],
            [
                'event_id' => 5,
                'name' => 'Día 2 - Jazz Fusión',
                'description' => 'Segunda jornada con jazz fusión y contemporáneo',
                'start_time' => Carbon::create(2024, 4, 13, 18, 0),
                'end_time' => Carbon::create(2024, 4, 13, 23, 0),
                'is_active' => true,
            ],
            
            // Campeonato de Tenis
            [
                'event_id' => 6,
                'name' => 'Semifinales',
                'description' => 'Partidos semifinales del torneo',
                'start_time' => Carbon::create(2024, 4, 20, 14, 0),
                'end_time' => Carbon::create(2024, 4, 20, 18, 0),
                'is_active' => true,
            ],
            [
                'event_id' => 6,
                'name' => 'Final',
                'description' => 'Partido final del campeonato',
                'start_time' => Carbon::create(2024, 4, 21, 16, 0),
                'end_time' => Carbon::create(2024, 4, 21, 19, 0),
                'is_active' => true,
            ],
            
            // Rock Nacional
            [
                'event_id' => 7,
                'name' => 'Concierto Único',
                'description' => 'Noche de rock con bandas nacionales',
                'start_time' => Carbon::create(2024, 4, 28, 21, 30),
                'end_time' => Carbon::create(2024, 4, 29, 2, 0),
                'is_active' => true,
            ],
            
            // Tech Conference
            [
                'event_id' => 8,
                'name' => 'Día 1 - Keynotes',
                'description' => 'Charlas magistrales y presentaciones principales',
                'start_time' => Carbon::create(2024, 5, 15, 9, 0),
                'end_time' => Carbon::create(2024, 5, 15, 18, 0),
                'is_active' => true,
            ],
            [
                'event_id' => 8,
                'name' => 'Día 2 - Workshops',
                'description' => 'Talleres prácticos y sesiones de networking',
                'start_time' => Carbon::create(2024, 5, 16, 9, 0),
                'end_time' => Carbon::create(2024, 5, 16, 17, 0),
                'is_active' => true,
            ],
        ];

        foreach ($functions as $function) {
            EventFunction::create($function);
        }
    }
}