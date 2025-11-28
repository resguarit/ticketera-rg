<?php

// filepath: database/seeders/TicketTypeSeeder.php

namespace Database\Seeders;

use App\Models\EventFunction;
use App\Models\Sector;
use App\Models\TicketType;
use App\Models\Venue;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TicketTypeSeeder extends Seeder
{
    public function run(): void
    {
        $ticketTypes = [
            // Festival de Música Electrónica - Día 1
            [
                'event_function_id' => 1,
                'sector_name' => 'Campo', // Buscaremos el sector por nombre
                'name' => 'General',
                'description' => 'Acceso general al festival',
                'price' => 8500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 3, 15, 18, 0),
                'quantity' => 1500,
                'quantity_sold' => 1200,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 1,
                'sector_name' => 'Palcos VIP',
                'name' => 'VIP',
                'description' => 'Acceso VIP con área exclusiva y bar premium',
                'price' => 15000.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 3, 15, 18, 0),
                'quantity' => 300,
                'quantity_sold' => 280,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 1,
                'sector_name' => 'Palcos VIP',
                'name' => 'Premium',
                'description' => 'Acceso premium con backstage y meet & greet',
                'price' => 25000.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 3, 15, 18, 0),
                'quantity' => 50,
                'quantity_sold' => 45,
                'is_hidden' => false,
            ],

            // Festival de Música Electrónica - Día 2
            [
                'event_function_id' => 2,
                'sector_name' => 'Campo',
                'name' => 'General',
                'description' => 'Acceso general al festival',
                'price' => 8500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 3, 16, 18, 0),
                'quantity' => 1500,
                'quantity_sold' => 1100,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 2,
                'sector_name' => 'Palcos VIP',
                'name' => 'VIP',
                'description' => 'Acceso VIP con área exclusiva y bar premium',
                'price' => 15000.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 3, 16, 18, 0),
                'quantity' => 300,
                'quantity_sold' => 250,
                'is_hidden' => false,
            ],

            // Concierto Sinfónico
            [
                'event_function_id' => 3,
                'sector_name' => 'Platea',
                'name' => 'Platea',
                'description' => 'Asientos en platea principal',
                'price' => 12000.00,
                'sales_start_date' => Carbon::now()->subDays(20),
                'sales_end_date' => Carbon::create(2024, 3, 22, 17, 0),
                'quantity' => 800,
                'quantity_sold' => 650,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 3,
                'sector_name' => 'Palcos',
                'name' => 'Palco',
                'description' => 'Palcos exclusivos con vista privilegiada',
                'price' => 18000.00,
                'sales_start_date' => Carbon::now()->subDays(20),
                'sales_end_date' => Carbon::create(2024, 3, 22, 17, 0),
                'quantity' => 200,
                'quantity_sold' => 180,
                'is_hidden' => false,
            ],

            // Copa Mundial
            [
                'event_function_id' => 4,
                'sector_name' => 'Popular',
                'name' => 'Popular',
                'description' => 'Entrada general tribuna popular',
                'price' => 5000.00,
                'sales_start_date' => Carbon::now()->subDays(45),
                'sales_end_date' => Carbon::create(2024, 3, 30, 14, 0),
                'quantity' => 20000,
                'quantity_sold' => 18500,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 4,
                'sector_name' => 'Platea',
                'name' => 'Platea',
                'description' => 'Asientos en platea cubierta',
                'price' => 12000.00,
                'sales_start_date' => Carbon::now()->subDays(45),
                'sales_end_date' => Carbon::create(2024, 3, 30, 14, 0),
                'quantity' => 5000,
                'quantity_sold' => 4800,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 4,
                'sector_name' => 'Palcos',
                'name' => 'VIP',
                'description' => 'Palcos VIP con catering incluido',
                'price' => 25000.00,
                'sales_start_date' => Carbon::now()->subDays(45),
                'sales_end_date' => Carbon::create(2024, 3, 30, 14, 0),
                'quantity' => 500,
                'quantity_sold' => 480,
                'is_hidden' => false,
            ],

            // Romeo y Julieta - Viernes
            [
                'event_function_id' => 5,
                'sector_name' => 'Platea',
                'name' => 'General',
                'description' => 'Entrada general',
                'price' => 6500.00,
                'sales_start_date' => Carbon::now()->subDays(25),
                'sales_end_date' => Carbon::create(2024, 4, 5, 19, 0),
                'quantity' => 400,
                'quantity_sold' => 320,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 5,
                'sector_name' => 'Primer Piso',
                'name' => 'Premium',
                'description' => 'Asientos preferenciales',
                'price' => 9500.00,
                'sales_start_date' => Carbon::now()->subDays(25),
                'sales_end_date' => Carbon::create(2024, 4, 5, 19, 0),
                'quantity' => 100,
                'quantity_sold' => 85,
                'is_hidden' => false,
            ],

            // Romeo y Julieta - Sábado
            [
                'event_function_id' => 6,
                'sector_name' => 'Platea',
                'name' => 'General',
                'description' => 'Entrada general',
                'price' => 6500.00,
                'sales_start_date' => Carbon::now()->subDays(25),
                'sales_end_date' => Carbon::create(2024, 4, 6, 19, 0),
                'quantity' => 400,
                'quantity_sold' => 380,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 6,
                'sector_name' => 'Primer Piso',
                'name' => 'Premium',
                'description' => 'Asientos preferenciales',
                'price' => 9500.00,
                'sales_start_date' => Carbon::now()->subDays(25),
                'sales_end_date' => Carbon::create(2024, 4, 6, 19, 0),
                'quantity' => 100,
                'quantity_sold' => 95,
                'is_hidden' => false,
            ],

            // Jazz - Día 1
            [
                'event_function_id' => 7,
                'sector_name' => 'General',
                'name' => 'General',
                'description' => 'Acceso al festival',
                'price' => 4500.00,
                'sales_start_date' => Carbon::now()->subDays(35),
                'sales_end_date' => Carbon::create(2024, 4, 12, 16, 0),
                'quantity' => 2000,
                'quantity_sold' => 1600,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 7,
                'sector_name' => 'VIP',
                'name' => 'VIP',
                'description' => 'Área VIP con asientos y catering',
                'price' => 9500.00,
                'sales_start_date' => Carbon::now()->subDays(35),
                'sales_end_date' => Carbon::create(2024, 4, 12, 16, 0),
                'quantity' => 300,
                'quantity_sold' => 250,
                'is_hidden' => false,
            ],

            // Jazz - Día 2
            [
                'event_function_id' => 8,
                'sector_name' => 'General',
                'name' => 'General',
                'description' => 'Acceso al festival',
                'price' => 4500.00,
                'sales_start_date' => Carbon::now()->subDays(35),
                'sales_end_date' => Carbon::create(2024, 4, 13, 16, 0),
                'quantity' => 2000,
                'quantity_sold' => 1500,
                'is_hidden' => false,
            ],

            // Tenis - Semifinales
            [
                'event_function_id' => 9,
                'sector_name' => 'Tribuna Principal',
                'name' => 'General',
                'description' => 'Entrada general a las semifinales',
                'price' => 3500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 4, 20, 12, 0),
                'quantity' => 1000,
                'quantity_sold' => 750,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 9,
                'sector_name' => 'Palcos VIP',
                'name' => 'VIP',
                'description' => 'Asientos VIP con catering',
                'price' => 7500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 4, 20, 12, 0),
                'quantity' => 200,
                'quantity_sold' => 180,
                'is_hidden' => false,
            ],

            // Tenis - Final
            [
                'event_function_id' => 10,
                'sector_name' => 'Tribuna Principal',
                'name' => 'General',
                'description' => 'Entrada general a la final',
                'price' => 4500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 4, 21, 14, 0),
                'quantity' => 1000,
                'quantity_sold' => 900,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 10,
                'sector_name' => 'Palcos VIP',
                'name' => 'VIP',
                'description' => 'Asientos VIP con catering',
                'price' => 9500.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 4, 21, 14, 0),
                'quantity' => 200,
                'quantity_sold' => 195,
                'is_hidden' => false,
            ],

            // Rock Nacional
            [
                'event_function_id' => 11,
                'sector_name' => 'Campo',
                'name' => 'Campo',
                'description' => 'Entrada general - campo',
                'price' => 7800.00,
                'sales_start_date' => Carbon::now()->subDays(40),
                'sales_end_date' => Carbon::create(2024, 4, 28, 19, 0),
                'quantity' => 3000,
                'quantity_sold' => 2700,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 11,
                'sector_name' => 'Platea',
                'name' => 'Platea',
                'description' => 'Asientos en platea',
                'price' => 12000.00,
                'sales_start_date' => Carbon::now()->subDays(40),
                'sales_end_date' => Carbon::create(2024, 4, 28, 19, 0),
                'quantity' => 1000,
                'quantity_sold' => 850,
                'is_hidden' => false,
            ],

            // Tech Conference - Día 1
            [
                'event_function_id' => 12,
                'sector_name' => 'Auditorio Principal',
                'name' => 'Early Bird',
                'description' => 'Entrada anticipada con descuento',
                'price' => 8500.00,
                'sales_start_date' => Carbon::now()->subDays(60),
                'sales_end_date' => Carbon::now()->subDays(30),
                'quantity' => 200,
                'quantity_sold' => 200,
                'is_hidden' => false,
            ],
            [
                'event_function_id' => 12,
                'sector_name' => 'Auditorio Principal',
                'name' => 'General',
                'description' => 'Entrada general a la conferencia',
                'price' => 12000.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 5, 15, 7, 0),
                'quantity' => 800,
                'quantity_sold' => 650,
                'is_hidden' => false,
            ],

            // Tech Conference - Día 2
            [
                'event_function_id' => 13,
                'sector_name' => 'Sala de Workshops',
                'name' => 'General',
                'description' => 'Entrada general a workshops',
                'price' => 10000.00,
                'sales_start_date' => Carbon::now()->subDays(30),
                'sales_end_date' => Carbon::create(2024, 5, 16, 7, 0),
                'quantity' => 500,
                'quantity_sold' => 400,
                'is_hidden' => false,
            ],
        ];

        foreach ($ticketTypes as $ticketData) {
            // Obtener el event_function para saber el venue
            $eventFunction = EventFunction::with('event.venue')->find($ticketData['event_function_id']);
            $venue = $eventFunction->event->venue;

            // Buscar el sector por nombre y venue
            $sector = Sector::where('venue_id', $venue->id)
                ->where('name', $ticketData['sector_name'])
                ->first();

            if ($sector) {
                // Remover sector_name del array y agregar sector_id
                unset($ticketData['sector_name']);
                $ticketData['sector_id'] = $sector->id;

                TicketType::create($ticketData);
            }
        }
    }
}
