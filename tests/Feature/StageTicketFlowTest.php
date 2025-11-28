<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use App\Models\Sector;
use App\Models\Cuota;
use App\Services\Interface\PaymentGatewayInterface;
use App\DTO\PaymentResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Mockery;

class StageTicketFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear métodos de pago necesarios
        $this->seedPaymentMethods();
    }

    protected function seedPaymentMethods(): void
    {
        DB::table('payment_method')->insert([
            [
                'name' => 'visa_credito',
                'payway_id' => 12,
            ],
        ]);
    }

    public function test_it_activates_next_stage_when_current_sells_out()
    {
        // Crear datos base
        $event = Event::factory()->create();
        $function = EventFunction::factory()->create(['event_id' => $event->id]);
        $sector = Sector::factory()->create();

        // 1. Crear Tanda 1 (Preventa) - Queda 1 ticket disponible
        $tanda1 = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'name' => 'Preventa General',  // ← Nombre libre
            'stage_group' => 'general-vip', // ← Grupo explícito
            'stage_order' => 1,             // ← Orden numérico
            'quantity' => 10,
            'quantity_sold' => 9,
            'price' => 100,
            'is_hidden' => false,
        ]);

        // 2. Crear Tanda 2 (Venta Final) - Oculta
        $tanda2 = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'name' => 'Venta Final Premium', // ← Nombre diferente, sin patrón
            'stage_group' => 'general-vip',  // ← Mismo grupo
            'stage_order' => 2,              // ← Orden siguiente
            'quantity' => 10,
            'quantity_sold' => 0,
            'price' => 200,
            'is_hidden' => true,
        ]);

        // Verificar que las columnas están correctamente asignadas
        $this->assertEquals('general-vip', $tanda1->stage_group);
        $this->assertEquals(1, $tanda1->stage_order);
        $this->assertEquals('general-vip', $tanda2->stage_group);
        $this->assertEquals(2, $tanda2->stage_order);
        
        // Verificar que isStaged() funciona
        $this->assertTrue($tanda1->isStaged());
        $this->assertTrue($tanda2->isStaged());

        // Crear cuota para el evento
        Cuota::factory()->create([
            'event_id' => $event->id,
            'bin' => '450799',
            'cantidad_cuotas' => 1,
            'habilitada' => true,
        ]);

        // Mock del pago exitoso
        $mockGateway = Mockery::mock(PaymentGatewayInterface::class);
        $mockGateway->shouldReceive('charge')
            ->andReturn(new PaymentResult(
                true,
                'trans-' . Str::random(10),
                'approved',
                null
            ));
        $this->app->instance(PaymentGatewayInterface::class, $mockGateway);

        // Paso 1: Confirm para crear sesión y bloquear tickets
        $confirmData = base64_encode(json_encode([
            'function_id' => $function->id,
            'tickets' => [
                $tanda1->id => 1
            ]
        ]));

        $this->get(route('checkout.confirm', [
            'event' => $event->id,
            'data' => $confirmData
        ]));

        // Verificar que se creó la sesión
        $this->assertTrue(session()->has('checkout_session_id'));
        $this->assertTrue(session()->has('locked_tickets'));

        // Paso 2: Comprar el último ticket de Tanda 1
        $response = $this->post(route('checkout.process'), [
            'event_id' => $event->id,
            'function_id' => $function->id,
            'token' => 'tok_test',
            'bin' => '450799',
            'payment_info' => [
                'method' => 'visa_credito',
                'installments' => 1
            ],
            'selected_tickets' => [
                ['id' => $tanda1->id, 'quantity' => 1]
            ],
            'billing_info' => [
                'firstName' => 'Test',
                'lastName' => 'User',
                'email' => 'test@example.com',
                'phone' => '123456789',
                'documentType' => 'DNI',
                'documentNumber' => '12345678'
            ],
            'agreements' => [
                'terms' => true,
                'privacy' => true
            ]
        ]);

        // Verificar redirección exitosa
        $response->assertRedirect();

        // 3. Verificar resultados
        $tanda1->refresh();
        $tanda2->refresh();

        // Tanda 1 debe estar completamente vendida (10/10)
        $this->assertEquals(10, $tanda1->quantity_sold);
        
        // Tanda 1 debe estar oculta ahora
        $this->assertTrue($tanda1->is_hidden, 'Tanda 1 debería estar oculta después de agotarse');

        // Tanda 2 debe estar visible ahora
        $this->assertFalse($tanda2->is_hidden, 'Tanda 2 debería estar visible después de que Tanda 1 se agote');
    }

    public function test_it_does_not_activate_next_stage_if_current_not_sold_out()
    {
        // Crear datos base
        $event = Event::factory()->create();
        $function = EventFunction::factory()->create(['event_id' => $event->id]);
        $sector = Sector::factory()->create();

        // Crear Tanda 1 con disponibilidad
        $tanda1 = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'name' => 'VIP Preventa',
            'stage_group' => 'vip-premium', // ← Agregar grupo
            'stage_order' => 1,             // ← Agregar orden
            'quantity' => 10,
            'quantity_sold' => 5, // Quedan 5 disponibles
            'price' => 100,
            'is_hidden' => false,
        ]);

        // Crear Tanda 2 oculta
        $tanda2 = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'name' => 'VIP Final',
            'stage_group' => 'vip-premium', // ← Mismo grupo
            'stage_order' => 2,             // ← Siguiente orden
            'quantity' => 10,
            'quantity_sold' => 0,
            'price' => 200,
            'is_hidden' => true,
        ]);

        // Crear cuota
        Cuota::factory()->create([
            'event_id' => $event->id,
            'bin' => '450799',
            'cantidad_cuotas' => 1,
            'habilitada' => true,
        ]);

        // Mock del pago
        $mockGateway = Mockery::mock(PaymentGatewayInterface::class);
        $mockGateway->shouldReceive('charge')
            ->andReturn(new PaymentResult(true, 'trans-123', 'approved', null));
        $this->app->instance(PaymentGatewayInterface::class, $mockGateway);

        // Confirm
        $confirmData = base64_encode(json_encode([
            'function_id' => $function->id,
            'tickets' => [$tanda1->id => 1]
        ]));

        $this->get(route('checkout.confirm', [
            'event' => $event->id,
            'data' => $confirmData
        ]));

        // Comprar 1 ticket (quedarían 4 disponibles)
        $this->post(route('checkout.process'), [
            'event_id' => $event->id,
            'function_id' => $function->id,
            'token' => 'tok_test',
            'bin' => '450799',
            'payment_info' => ['method' => 'visa_credito', 'installments' => 1],
            'selected_tickets' => [['id' => $tanda1->id, 'quantity' => 1]],
            'billing_info' => [
                'firstName' => 'Test',
                'lastName' => 'User',
                'email' => 'test2@example.com',
                'phone' => '123',
                'documentType' => 'DNI',
                'documentNumber' => '123'
            ],
            'agreements' => ['terms' => true, 'privacy' => true]
        ]);

        // Verificar
        $tanda1->refresh();
        $tanda2->refresh();

        // Tanda 1 debe seguir visible
        $this->assertFalse($tanda1->is_hidden, 'Tanda 1 debe seguir visible porque no se agotó');
        $this->assertEquals(6, $tanda1->quantity_sold); // 5 + 1 = 6

        // Tanda 2 debe seguir oculta
        $this->assertTrue($tanda2->is_hidden, 'Tanda 2 debe seguir oculta porque Tanda 1 no se agotó');
    }
}