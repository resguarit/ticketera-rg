<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventFunction;
use App\Models\TicketType;
use App\Models\Sector;
use App\Models\Cuota;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery;
use App\Services\Interface\PaymentGatewayInterface;
use App\DTO\PaymentResult;
use Illuminate\Support\Str;

class TicketPurchaseFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear datos maestros necesarios para todos los tests
        $this->seedPaymentMethods();
        
        // Mock del gateway de pago para todos los tests
        $this->mockPaymentGateway();
    }

    /**
     * Crear métodos de pago en la base de datos de testing
     */
    protected function seedPaymentMethods(): void
    {
        DB::table('payment_method')->insert([
            [
                'name' => 'visa_credito',
                'payway_id' => 12,
            ],
            [
                'name' => 'visa_debito',
                'payway_id' => 31,
            ],
            [
                'name' => 'mastercard_credito',
                'payway_id' => 104,
            ],
        ]);
    }

    protected function mockPaymentGateway($success = true, $message = null)
    {
        $mockGateway = Mockery::mock(PaymentGatewayInterface::class);
        
        if ($success) {
            $mockGateway->shouldReceive('charge')
                ->andReturn(new PaymentResult(
                    true,
                    'trans-' . Str::random(10),
                    'approved',
                    null
                ));
        } else {
            $mockGateway->shouldReceive('charge')
                ->andReturn(PaymentResult::failure($message ?? 'Fondos insuficientes'));
        }
        
        $this->app->instance(PaymentGatewayInterface::class, $mockGateway);
    }

    public function test_it_creates_an_order_successfully_when_payment_is_approved()
    {
        // TEMPORAL: Ver excepciones directamente
        $this->withoutExceptionHandling();
        
        // Mock de pago exitoso
        $this->mockPaymentGateway(true);

        // 1. PREPARACIÓN - Crear datos
        $event = Event::factory()->create();
        $function = EventFunction::factory()->create(['event_id' => $event->id]);
        $sector = Sector::factory()->create();
        
        $ticketType = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'price' => 100,
            'quantity' => 50,
            'quantity_sold' => 0,
        ]);

        // Crear una cuota de prueba asociada al evento
        Cuota::factory()->create([
            'event_id' => $event->id,
            'bin' => '450799',
            'cantidad_cuotas' => 1,
            'habilitada' => true,
        ]);

        // 2. SIMULAR FLUJO COMPLETO

        // Paso 1: Llamar a confirm para generar session_id y bloquear tickets
        $confirmData = base64_encode(json_encode([
            'function_id' => $function->id,
            'tickets' => [
                $ticketType->id => 2
            ]
        ]));

        $confirmResponse = $this->get(route('checkout.confirm', [
            'event' => $event->id,
            'data' => $confirmData
        ]));

        $confirmResponse->assertStatus(200);

        // Verificar que se creó el session_id
        $this->assertTrue(session()->has('checkout_session_id'), 'Session ID not created');
        $this->assertTrue(session()->has('locked_tickets'), 'Tickets not locked');

        // Paso 2: Enviar formulario de pago
        $payload = [
            'event_id' => $event->id,
            'function_id' => $function->id,
            'token' => 'tok_test_visa_123',
            'bin' => '450799',
            'payment_info' => [
                'method' => 'visa_credito',
                'installments' => 1
            ],
            'selected_tickets' => [
                ['id' => $ticketType->id, 'quantity' => 2]
            ],
            'billing_info' => [
                'firstName' => 'Juan',
                'lastName' => 'Perez',
                'email' => 'juan@test.com',
                'phone' => '12345678',
                'documentType' => 'DNI',
                'documentNumber' => '30123456'
            ],
            'agreements' => [
                'terms' => true,
                'privacy' => true
            ]
        ];

        $response = $this->post(route('checkout.process'), $payload);

        // 3. AFIRMACIONES (Assert)
        
        // Verificar redirección a success
        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verificar que se creó el usuario
        $user = User::where('email', 'juan@test.com')->first();
        $this->assertNotNull($user, 'El usuario debería haberse creado');

        // Verificar que existe la orden
        $this->assertDatabaseHas('orders', [
            'status' => 'paid',
            'client_id' => $user->id
        ]);

        // Verificar tickets emitidos
        $this->assertDatabaseCount('issued_tickets', 2);

        // Verificar que se incrementó la venta
        $ticketType->refresh();
        $this->assertEquals(2, $ticketType->quantity_sold);

        // Verificar que se liberaron los locks
        $this->assertFalse(session()->has('checkout_session_id'));
        $this->assertFalse(session()->has('locked_tickets'));
    }

    public function test_it_cancels_order_if_payment_fails()
    {
        // Mock de pago fallido
        $this->mockPaymentGateway(false, 'Fondos insuficientes');

        // 1. PREPARACIÓN
        $event = Event::factory()->create();
        $function = EventFunction::factory()->create(['event_id' => $event->id]);
        $sector = Sector::factory()->create();
        
        $ticketType = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'price' => 100,
            'quantity' => 50,
            'quantity_sold' => 0,
        ]);

        Cuota::factory()->create([
            'event_id' => $event->id,
            'bin' => '450799',
            'cantidad_cuotas' => 1,
            'habilitada' => true,
        ]);

        // Paso 1: Confirm
        $confirmData = base64_encode(json_encode([
            'function_id' => $function->id,
            'tickets' => [
                $ticketType->id => 1
            ]
        ]));

        $this->get(route('checkout.confirm', [
            'event' => $event->id,
            'data' => $confirmData
        ]));

        // Paso 2: Process Payment (debería fallar)
        $payload = [
            'event_id' => $event->id,
            'function_id' => $function->id,
            'token' => 'tok_fail',
            'bin' => '450799',
            'payment_info' => [
                'method' => 'visa_credito',
                'installments' => 1
            ],
            'selected_tickets' => [
                ['id' => $ticketType->id, 'quantity' => 1]
            ],
            'billing_info' => [
                'firstName' => 'Fail',
                'lastName' => 'User',
                'email' => 'fail@test.com',
                'phone' => '111',
                'documentType' => 'DNI',
                'documentNumber' => '111'
            ],
            'agreements' => [
                'terms' => true,
                'privacy' => true
            ]
        ];

        $response = $this->post(route('checkout.process'), $payload);

        // 3. AFIRMACIONES

        // Verificar redirección a error
        $response->assertRedirect();
        
        // Verificar que la orden fue cancelada
        $this->assertDatabaseHas('orders', [
            'status' => 'cancelled'
        ]);

        // Verificar que los tickets no se contaron como vendidos
        $ticketType->refresh();
        $this->assertEquals(0, $ticketType->quantity_sold);
    }

    public function test_it_prevents_purchase_when_locks_expire()
    {
        $event = Event::factory()->create();
        $function = EventFunction::factory()->create(['event_id' => $event->id]);
        $sector = Sector::factory()->create();
        
        $ticketType = TicketType::factory()->create([
            'event_function_id' => $function->id,
            'sector_id' => $sector->id,
            'quantity' => 10,
        ]);

        // Simular sesión expirada (sin session_id ni locked_tickets)
        $payload = [
            'event_id' => $event->id,
            'function_id' => $function->id,
            'token' => 'tok_test',
            'bin' => '450799',
            'payment_info' => [
                'method' => 'visa_credito',
                'installments' => 1
            ],
            'selected_tickets' => [
                ['id' => $ticketType->id, 'quantity' => 1]
            ],
            'billing_info' => [
                'firstName' => 'Test',
                'lastName' => 'User',
                'email' => 'test@test.com',
                'phone' => '123',
                'documentType' => 'DNI',
                'documentNumber' => '123'
            ],
            'agreements' => [
                'terms' => true,
                'privacy' => true
            ]
        ];

        $response = $this->post(route('checkout.process'), $payload);

        // Debe redirigir a error por sesión expirada
        $response->assertRedirect();
        
        // Verificar que no se vendieron tickets
        $ticketType->refresh();
        $this->assertEquals(0, $ticketType->quantity_sold);
    }
}