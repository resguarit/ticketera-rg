<?php
// filepath: database/seeders/EventSeeder.php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Category;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener las categorías creadas previamente
        $musicCategory = Category::where('name', 'Música')->first();
        $theaterCategory = Category::where('name', 'Teatro')->first();
        $sportsCategory = Category::where('name', 'Deportes')->first();
        $conferenceCategory = Category::where('name', 'Conferencias')->first();
        $culturalCategory = Category::where('name', 'Cultural')->first();

        $events = [
            [
                'organizer_id' => 1, // MusicPro Events
                'venue_id' => 1, // Estadio Nacional
                'category_id' => $musicCategory->id,
                'name' => 'Festival de Música Electrónica 2024',
                'description' => 'El festival de música electrónica más grande de Sudamérica regresa con los mejores DJs internacionales. Una experiencia única con múltiples escenarios, efectos visuales espectaculares y la mejor tecnología de sonido.',
                'banner_url' => 'events/banners/festival-electronica-2024.jpg',
                'tax' => 15,
                'featured' => true, // Evento destacado
            ],
            [
                'organizer_id' => 1, // MusicPro Events
                'venue_id' => 2, // Teatro Colón
                'category_id' => $musicCategory->id,
                'name' => 'Concierto Sinfónico de Primavera',
                'description' => 'La Orquesta Sinfónica Nacional presenta un repertorio especial con obras clásicas y contemporáneas para celebrar la llegada de la primavera.',
                'banner_url' => 'events/banners/concierto-sinfonico.jpg',
                'tax' => 15,
                'featured' => false,
            ],
            [
                'organizer_id' => 5, // Liga Amateur
                'venue_id' => 6, // Estadio Centenario
                'category_id' => $sportsCategory->id,
                'name' => 'Copa Mundial de Fútbol',
                'description' => 'Partido clasificatorio para la Copa Mundial. Un evento deportivo imperdible que reunirá a los mejores equipos de la región.',
                'banner_url' => 'events/banners/copa-mundial.jpg',
                'tax' => 15,
                'featured' => true, // Evento destacado
            ],
            [
                'organizer_id' => 3, // Teatro Municipal
                'venue_id' => 4, // Teatro San Martín
                'category_id' => $theaterCategory->id,
                'name' => 'Obra de Teatro: Romeo y Julieta',
                'description' => 'La clásica obra de Shakespeare interpretada por el elenco del Teatro Municipal. Una puesta en escena moderna de esta historia atemporal.',
                'banner_url' => 'events/banners/romeo-julieta.jpg',
                'tax' => 15,
                'featured' => false,
            ],
            [
                'organizer_id' => 6, // Cultura Viva
                'venue_id' => 5, // Parque Centenario
                'category_id' => $musicCategory->id,
                'name' => 'Festival de Jazz Internacional',
                'description' => 'Tres días de jazz con artistas nacionales e internacionales en un ambiente único al aire libre. Música, gastronomía y arte en un solo lugar.',
                'banner_url' => 'events/banners/festival-jazz.jpg',
                'tax' => 15,
                'featured' => true, // Evento destacado
            ],
            [
                'organizer_id' => 5, // Liga Amateur
                'venue_id' => 8, // Club de Tenis
                'category_id' => $sportsCategory->id,
                'name' => 'Campeonato de Tenis',
                'description' => 'Torneo profesional de tenis con la participación de los mejores jugadores de Argentina y la región.',
                'banner_url' => 'events/banners/campeonato-tenis.jpg',
                'tax' => 15,
                'featured' => false,
            ],
            [
                'organizer_id' => 2, // Rock Producciones
                'venue_id' => 3, // Luna Park
                'category_id' => $musicCategory->id,
                'name' => 'Concierto de Rock Nacional',
                'description' => 'Una noche épica con las mejores bandas de rock nacional. Música, energía y una experiencia inolvidable.',
                'banner_url' => 'events/banners/rock-nacional.jpg',
                'tax' => 15,
                'featured' => false,
            ],
            [
                'organizer_id' => 4, // TechEvents
                'venue_id' => 7, // Centro de Convenciones
                'category_id' => $conferenceCategory->id,
                'name' => 'Conferencia Tech 2024',
                'description' => 'La conferencia de tecnología más importante del año. Speakers internacionales, workshops y networking.',
                'banner_url' => 'events/banners/tech-conference.jpg',
                'tax' => 15,
                'featured' => false,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}