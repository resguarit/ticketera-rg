<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Venue;
use App\Models\Sector;
use App\Models\TicketType;
use App\Models\IssuedTicket;
use App\Models\Person;
use App\Models\User;
use App\Models\Organizer;
use App\Models\Category;
use App\Enums\EventFunctionStatus;
use App\Enums\IssuedTicketStatus;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ScannerSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear Estructura Base (Organizador, Venue, Categoría)
        $organizer = Organizer::first() ?? Organizer::create(['name' => 'Productora Test', 'referring' => 'prod-test', 'email' => 'test@prod.com', 'tax' => '15']);
        $category = Category::first() ?? Category::create(['name' => 'Conciertos', 'icon' => 'conciertos', 'color' => '#ef4444']);
        
        $venue = Venue::create([
            'name' => 'Estadio Monumental Test',
            'address' => 'Av. Test 1234',
            'ciudad_id' => 1,
        ]);

        // 2. Crear Sectores
        $sectorCampo = Sector::create(['venue_id' => $venue->id, 'name' => 'Campo General', 'capacity' => 2000]);
        $sectorVip = Sector::create(['venue_id' => $venue->id, 'name' => 'Platea VIP', 'capacity' => 500]);

        // 3. Crear Evento
        $event = Event::create([
            'organizer_id' => $organizer->id,
            'venue_id' => $venue->id,
            'category_id' => $category->id,
            'name' => 'Festival de Rock - Prueba Scanner',
            'description' => 'Evento para probar la API de escaneo',
            'is_archived' => false,
            'featured' => true,
        ]);

        // 4. Crear Función para HOY (Activa)
        $function = EventFunction::create([
            'event_id' => $event->id,
            'name' => 'Noche Principal',
            'start_time' => Carbon::now()->addHours(2), // Empieza en 2 horas
            'end_time' => Carbon::now()->addHours(6),
            'is_active' => true,
            'status' => EventFunctionStatus::ON_SALE // O el enum que uses
        ]);

        // 5. Crear Tipos de Ticket
        $typeGeneral = TicketType::create([
            'event_function_id' => $function->id,
            'sector_id' => $sectorCampo->id,
            'name' => 'Entrada General',
            'price' => 15000,
            'quantity' => 2000,
            'quantity_sold' => 0,
            'sales_start_date' => now()->subDays(10),
            'sales_end_date' => now()->addDay(),
            'is_bundle' => false
        ]);

        $typeVip = TicketType::create([
            'event_function_id' => $function->id,
            'sector_id' => $sectorVip->id,
            'name' => 'VIP Experience',
            'price' => 50000,
            'quantity' => 500,
            'quantity_sold' => 0,
            'sales_start_date' => now()->subDays(10),
            'sales_end_date' => now()->addDay(),
            'is_bundle' => false
        ]);

        // 6. Generar Tickets de Prueba
        $this->command->info("Generando tickets para la función ID: {$function->id}...");

        // A. Ticket DE ORO (Para que lo pruebes manual)
        $this->createTicket($typeGeneral, 'TICKET-VALIDO-001', IssuedTicketStatus::AVAILABLE);
        $this->createTicket($typeGeneral, 'TICKET-USADO-001', IssuedTicketStatus::USED);
        $this->createTicket($typeVip, 'TICKET-VIP-001', IssuedTicketStatus::AVAILABLE);

        // B. Generar 50 tickets random
        for ($i = 0; $i < 50; $i++) {
            $status = rand(0, 10) > 9 ? IssuedTicketStatus::USED : IssuedTicketStatus::AVAILABLE;
            $this->createTicket($typeGeneral, 'GEN-' . Str::upper(Str::random(8)), $status);
        }
    }

    private function createTicket($type, $code, $status)
    {
        // Simulamos un comprador
        $person = Person::factory()->create();
        $user = User::factory()->create(['person_id' => $person->id]);

        IssuedTicket::create([
            'ticket_type_id' => $type->id,
            'client_id' => $user->id,
            'unique_code' => $code,
            'status' => $status,
            'issued_at' => now()->subDays(rand(1, 5)),
            'validated_at' => $status === IssuedTicketStatus::USED ? now()->subHours(1) : null,
            'device_used' => $status === IssuedTicketStatus::USED ? 'Puerta 1' : null,
        ]);
    }
}