<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\Venue;
use App\Models\Sector;
use App\Models\TicketType;
use App\Models\IssuedTicket;
use App\Models\TicketBatch;
use App\Models\Person;
use App\Models\User;
use App\Models\Organizer;
use App\Models\Category;
use App\Models\Order;
use App\Models\Assistant;
use App\Enums\EmissionType;
use App\Enums\EventFunctionStatus;
use App\Enums\IssuedTicketStatus;
use App\Enums\OrderStatus;
use App\Enums\SalesChannel;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * TestScenarioSeeder
 *
 * Crea los 4 escenarios de prueba para validar la arquitectura de tickets:
 *
 * 1. La Venta Online Clásica        → emission_type = 'online'     (el control)
 * 2. La Invitación Pura             → emission_type = 'invitation'  (sin orden)
 * 3. El Cartón Pre-impreso Inactivo → emission_type = 'pre_printed' (con batch, status inactive)
 * 4. La Venta en Puerta Anónima     → emission_type = 'box_office'  (sin cliente)
 *
 * Uso: php artisan db:seed --class=TestScenarioSeeder
 */
class TestScenarioSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // ─────────────────────────────────────────────────────────────
            // ESTRUCTURA BASE: un evento con una función activa
            // ─────────────────────────────────────────────────────────────
            $organizer = Organizer::first()
                ?? Organizer::create([
                    'name'     => 'Productora Test Scenarios',
                    'referring' => 'prod-test-scenarios',
                    'email'    => 'test-scenarios@prod.com',
                    'tax'      => '15',
                ]);

            $category = Category::first()
                ?? Category::create([
                    'name'  => 'Conciertos',
                    'icon'  => 'conciertos',
                    'color' => '#ef4444',
                ]);

            $venue = Venue::create([
                'name'      => 'Estadio Test Scenarios',
                'address'   => 'Av. Escenarios 4242',
                'ciudad_id' => 1,
            ]);

            $sector = Sector::create([
                'venue_id' => $venue->id,
                'name'     => 'Campo General',
                'capacity' => 5000,
            ]);

            $event = Event::create([
                'organizer_id' => $organizer->id,
                'venue_id'     => $venue->id,
                'category_id'  => $category->id,
                'name'         => 'Evento Test – 4 Escenarios',
                'description'  => 'Evento creado por TestScenarioSeeder para validar la arquitectura de tickets.',
                'is_archived'  => false,
                'featured'     => false,
                'tax'          => 15.00,
            ]);

            $function = EventFunction::create([
                'event_id'   => $event->id,
                'name'       => 'Función Principal',
                'start_time' => Carbon::now()->addDays(7),
                'end_time'   => Carbon::now()->addDays(7)->addHours(4),
                'is_active'  => true,
                'status'     => EventFunctionStatus::ON_SALE,
            ]);

            $ticketType = TicketType::create([
                'event_function_id' => $function->id,
                'sector_id'         => $sector->id,
                'name'              => 'Entrada General',
                'price'             => 12000,
                'quantity'          => 5000,
                'quantity_sold'     => 0,
                'sales_start_date'  => now()->subDays(5),
                'sales_end_date'    => now()->addDays(7),
                'is_bundle'         => false,
            ]);

            // ─────────────────────────────────────────────────────────────
            // ESCENARIO 1: La Venta Online Clásica (El Control)
            // ─────────────────────────────────────────────────────────────
            // Un usuario real compra online via MercadoPago.
            // Objetivo: verificar que el flujo original sigue funcionando.
            // ─────────────────────────────────────────────────────────────
            $this->command->info('[1/4] Creando: Venta Online Clásica...');

            $clientPerson = Person::create([
                'name'      => 'María',
                'last_name' => 'González',
            ]);
            $clientUser = User::create([
                'email'               => 'cliente.online.test@example.com',
                'password'            => bcrypt('password'),
                'role'                => UserRole::CLIENT,
                'person_id'           => $clientPerson->id,
                'password_changed_at' => now(),
            ]);

            $orderOnline = Order::create([
                'client_id'      => $clientUser->id,
                'status'         => OrderStatus::PAID,
                'sales_channel'  => SalesChannel::ONLINE,
                'payment_method' => 1,
                'transaction_id' => 'MP-' . Str::upper(Str::random(16)),
                'order_date'     => now()->subDays(2),
                'subtotal'       => 12000,
                'discount'       => 0,
                'tax'            => 0.15,
                'service_fee'    => 1800,
                'total_amount'   => 13800,
            ]);

            IssuedTicket::create([
                'ticket_type_id' => $ticketType->id,
                'order_id'       => $orderOnline->id,
                'assistant_id'   => null,
                'client_id'      => $clientUser->id,
                'unique_code'    => 'TST-ONLINE-001-' . Str::upper(Str::random(8)),
                'emission_type'  => EmissionType::ONLINE->value,
                'status'         => IssuedTicketStatus::AVAILABLE,
                'issued_at'      => now()->subDays(2),
            ]);

            $this->command->info('    ✓ Ticket online creado. owner_name debería ser: ' . $clientPerson->name . ' ' . $clientPerson->last_name);

            // ─────────────────────────────────────────────────────────────
            // ESCENARIO 2: La Invitación Pura (Cortesía)
            // ─────────────────────────────────────────────────────────────
            // Sin orden. Con Assistant (el invitado).
            // Objetivo: el sistema usa assistant->person->name, sin buscar Order.
            // ─────────────────────────────────────────────────────────────
            $this->command->info('[2/4] Creando: Invitación Pura (Cortesía)...');

            $guestPerson = Person::create([
                'name'      => 'Carlos',
                'last_name' => 'Invitado VIP',
            ]);

            $assistant = Assistant::create([
                'event_function_id' => $function->id,
                'person_id'         => $guestPerson->id,
                'email'             => 'invitado.vip@example.com',
                'quantity'          => 1,
                'sended_at'         => now()->subDays(1),
            ]);

            IssuedTicket::create([
                'ticket_type_id' => $ticketType->id,
                'order_id'       => null, // ← Sin orden
                'assistant_id'   => $assistant->id,
                'client_id'      => null,
                'unique_code'    => 'TST-INVIT-002-' . Str::upper(Str::random(8)),
                'emission_type'  => EmissionType::INVITATION->value,
                'status'         => IssuedTicketStatus::AVAILABLE,
                'issued_at'      => now()->subDays(1),
            ]);

            $this->command->info('    ✓ Invitación creada. owner_name debería ser: ' . $guestPerson->name . ' ' . $guestPerson->last_name);

            // ─────────────────────────────────────────────────────────────
            // ESCENARIO 3: El Cartón Pre-impreso Inactivo
            // ─────────────────────────────────────────────────────────────
            // Con TicketBatch, sin orden, sin cliente, sin asistente.
            // Status = inactive → el scanner rechaza en puerta.
            // El panel del organizador lo muestra como "No vendido".
            // ─────────────────────────────────────────────────────────────
            $this->command->info('[3/4] Creando: Cartón Pre-impreso Inactivo...');

            $batch = TicketBatch::create([
                'event_function_id' => $function->id,
                'ticket_type_id'    => $ticketType->id,
                'promoter_id'       => null,
                'quantity'          => 1,
                'type'              => 'require_activation', // Lote que requiere activarse manualmente
                'description'       => 'Lote de cartones pre-impresos para prueba',
            ]);

            IssuedTicket::create([
                'ticket_type_id' => $ticketType->id,
                'order_id'       => null,   // ← Sin orden
                'assistant_id'   => null,   // ← Sin asistente
                'client_id'      => null,   // ← Sin cliente
                'batch_id'       => $batch->id,
                'unique_code'    => 'TST-PREPR-003-' . Str::upper(Str::random(8)),
                'emission_type'  => EmissionType::PRE_PRINTED->value,
                'status'         => IssuedTicketStatus::INACTIVE, // ← Clave: inactivo
                'issued_at'      => now()->subDays(3),
            ]);

            $this->command->info('    ✓ Cartón pre-impreso creado. Scanner debe rechazar: status = inactive. Panel: "No vendido".');

            // ─────────────────────────────────────────────────────────────
            // ESCENARIO 4: La Venta en Puerta a Consumidor Final
            // ─────────────────────────────────────────────────────────────
            // Orden anónima (client_id = null) pagada en efectivo en box_office.
            // IssuedTicket sin cliente ni asistente → owner_name retorna "Consumidor Final".
            // Objetivo: PDF no explota, Excel muestra "Consumidor Final", Revenue suma la venta.
            // ─────────────────────────────────────────────────────────────
            $this->command->info('[4/4] Creando: Venta en Puerta Anónima (Box Office)...');

            $orderBoxOffice = Order::create([
                'client_id'      => null,             // ← Clave: sin cliente registrado
                'status'         => OrderStatus::PAID,
                'sales_channel'  => SalesChannel::BOX_OFFICE,
                'payment_method' => 200,
                'transaction_id' => 'BOX-' . Str::upper(Str::random(16)),
                'order_date'     => now()->subHours(3),
                'subtotal'       => 12000,
                'discount'       => 0,
                'tax'            => 0,
                'service_fee'    => 0,
                'total_amount'   => 12000,
            ]);

            IssuedTicket::create([
                'ticket_type_id' => $ticketType->id,
                'order_id'       => $orderBoxOffice->id,
                'assistant_id'   => null, // ← Sin asistente
                'client_id'      => null, // ← Sin cliente
                'unique_code'    => 'TST-BOXOF-004-' . Str::upper(Str::random(8)),
                'emission_type'  => EmissionType::BOX_OFFICE->value,
                'status'         => IssuedTicketStatus::AVAILABLE,
                'issued_at'      => now()->subHours(3),
            ]);

            $this->command->info('    ✓ Ticket box_office creado. owner_name debería ser: "Consumidor Final (Venta Física)".');

            DB::commit();

            $this->command->newLine();
            $this->command->info('╔══════════════════════════════════════════════════════════╗');
            $this->command->info('║         TestScenarioSeeder completado exitosamente       ║');
            $this->command->info('╠══════════════════════════════════════════════════════════╣');
            $this->command->info('║  Evento: "Evento Test – 4 Escenarios"                    ║');
            $this->command->info('║  1. Online (MP)      → owner_name = nombre del cliente   ║');
            $this->command->info('║  2. Invitación       → owner_name = nombre del invitado  ║');
            $this->command->info('║  3. Pre-impreso      → status = inactive (scanner ✗)     ║');
            $this->command->info('║  4. Box Office cash  → owner_name = Consumidor Final     ║');
            $this->command->info('╚══════════════════════════════════════════════════════════╝');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error en TestScenarioSeeder: ' . $e->getMessage());
            throw $e;
        }
    }
}
