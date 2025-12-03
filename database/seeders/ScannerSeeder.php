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
use App\Models\Order;
use App\Models\Assistant;
use App\Enums\EventFunctionStatus;
use App\Enums\IssuedTicketStatus;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
        $sectorCampo = Sector::create(['venue_id' => $venue->id, 'name' => 'Campo General', 'capacity' => 40000]);
        $sectorVip = Sector::create(['venue_id' => $venue->id, 'name' => 'Platea VIP', 'capacity' => 15000]);

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
            'status' => EventFunctionStatus::ON_SALE
        ]);

        // 5. Crear Tipos de Ticket
        $typeGeneral = TicketType::create([
            'event_function_id' => $function->id,
            'sector_id' => $sectorCampo->id,
            'name' => 'Entrada General',
            'price' => 15000,
            'quantity' => 40000,
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
            'quantity' => 15000,
            'quantity_sold' => 0,
            'sales_start_date' => now()->subDays(10),
            'sales_end_date' => now()->addDay(),
            'is_bundle' => false
        ]);

        // 6. Generar Tickets de Prueba Manuales
        $this->command->info("Generando tickets manuales...");
        $this->createManualTicket($typeGeneral, 'TICKET-VALIDO-001', IssuedTicketStatus::AVAILABLE);
        $this->createManualTicket($typeGeneral, 'TICKET-USADO-001', IssuedTicketStatus::USED);
        $this->createManualTicket($typeVip, 'TICKET-VIP-001', IssuedTicketStatus::AVAILABLE);

        // 7. Generación Masiva
        $this->command->info("Iniciando generación masiva de 50,000 tickets...");
        
        $totalTicketsTarget = 50000;
        $createdCount = 0;
        
        // Pool de usuarios para compras (simulamos 100 compradores recurrentes)
        // Es importante crear la Persona asociada para cada Usuario
        $buyers = collect();
        for ($i = 0; $i < 100; $i++) {
            $person = Person::factory()->create();
            $buyers->push(User::factory()->create(['person_id' => $person->id]));
        }
        
        $bar = $this->command->getOutput()->createProgressBar($totalTicketsTarget);
        $bar->start();

        // Usamos transacciones por bloques para no saturar
        DB::beginTransaction();

        try {
            while ($createdCount < $totalTicketsTarget) {
                // 10% Invitaciones, 90% Compras
                $isInvitation = rand(1, 100) <= 10;

                if ($isInvitation) {
                    $this->createInvitation($function, $typeGeneral, $typeVip);
                    $createdCount++;
                    $bar->advance();
                } else {
                    // Una orden puede tener entre 1 y 6 tickets
                    $ticketQty = rand(1, 6);
                    
                    // Ajustar si nos pasamos del total
                    if ($createdCount + $ticketQty > $totalTicketsTarget) {
                        $ticketQty = $totalTicketsTarget - $createdCount;
                    }
                    
                    $this->createOrderWithTickets($buyers->random(), $function, $typeGeneral, $typeVip, $ticketQty);
                    $createdCount += $ticketQty;
                    $bar->advance($ticketQty);
                }

                // Commit parcial cada 1000 tickets para liberar memoria si fuera necesario
                if ($createdCount % 1000 == 0) {
                    DB::commit();
                    DB::beginTransaction();
                }
            }
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $bar->finish();
        $this->command->info("\nSeeder completado exitosamente. Total tickets: $createdCount");
    }

    private function createManualTicket($type, $code, $status)
    {
        $person = Person::factory()->create();
        $user = User::factory()->create(['person_id' => $person->id]);

        // Crear orden dummy para el ticket manual
        $order = Order::create([
            'client_id' => $user->id,
            'status' => OrderStatus::PAID,
            'order_date' => now(),
            'total_amount' => $type->price,
            'transaction_id' => Str::uuid(),
            'subtotal' => $type->price,
            'payment_method' => 'credit_card',
        ]);

        IssuedTicket::create([
            'ticket_type_id' => $type->id,
            'order_id' => $order->id,
            'client_id' => $user->id,
            'unique_code' => $code,
            'status' => $status,
            'issued_at' => now(),
            'validated_at' => $status === IssuedTicketStatus::USED ? now()->subHours(1) : null,
            'device_used' => $status === IssuedTicketStatus::USED ? 'Puerta 1' : null,
        ]);
    }

    private function createInvitation($function, $typeGeneral, $typeVip)
    {
        // Invitación: Sin orden, con Assistant
        $type = rand(0, 1) ? $typeGeneral : $typeVip;
        
        $person = Person::factory()->create();
        
        $assistant = Assistant::create([
            'event_function_id' => $function->id,
            'person_id' => $person->id,
            'email' => $person->email,
            'quantity' => 1,
            'sended_at' => now(),
        ]);

        IssuedTicket::create([
            'ticket_type_id' => $type->id,
            'order_id' => null, // Sin orden
            'assistant_id' => $assistant->id, // Con invitado
            'client_id' => null,
            'unique_code' => 'INV-' . Str::upper(Str::random(12)),
            'status' => IssuedTicketStatus::AVAILABLE,
            'issued_at' => now(),
        ]);
    }

    private function createOrderWithTickets($user, $function, $typeGeneral, $typeVip, $qty)
    {
        // Decidir tipo de tickets para esta orden (todos del mismo tipo por simplicidad)
        $type = rand(0, 10) > 2 ? $typeGeneral : $typeVip; // Mayoría general
        
        $totalAmount = $type->price * $qty;

        $order = Order::create([
            'client_id' => $user->id,
            'status' => OrderStatus::PAID,
            'order_date' => now()->subDays(rand(1, 30)),
            'total_amount' => $totalAmount,
            'subtotal' => $totalAmount,
            'tax' => 0,
            'discount' => 0,
            'service_fee' => 0,
            'payment_method' => 'credit_card',
            'transaction_id' => Str::uuid(),
        ]);

        $ticketsData = [];
        for ($i = 0; $i < $qty; $i++) {
            $ticketsData[] = [
                'ticket_type_id' => $type->id,
                'order_id' => $order->id,
                'client_id' => $user->id,
                'assistant_id' => null,
                'unique_code' => Str::uuid()->toString(), // UUID es seguro y rápido
                'status' => IssuedTicketStatus::AVAILABLE, // Todos disponibles
                'issued_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert masivo para velocidad
        IssuedTicket::insert($ticketsData);
    }
}