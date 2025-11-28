<?php

namespace Tests\Unit;

use App\Models\TicketType;
use App\Services\TicketLockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketLockServiceTest extends TestCase
{
    use RefreshDatabase; // Borra la BD después de cada test

    protected TicketLockService $lockService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->lockService = app(TicketLockService::class);
    }

    /** @test */
    public function it_can_lock_available_tickets()
    {
        // 1. Crear un ticket
        $ticket = TicketType::factory()->create(['quantity' => 10, 'quantity_sold' => 0]);
        $sessionId = 'session-uuid-123';

        // 2. Intentar bloquear 2 tickets
        $request = [['id' => $ticket->id, 'quantity' => 2]];
        $result = $this->lockService->lockTickets($request, $sessionId);

        // 3. Verificar éxito
        $this->assertTrue($result['success']);

        // 4. Verificar disponibilidad real (10 - 2 bloqueados = 8 disponibles)
        $availability = $this->lockService->getAvailability($ticket->id);
        $this->assertEquals(8, $availability['available']);
        $this->assertEquals(2, $availability['locked']);
    }

    /** @test */
    public function it_prevents_locking_more_than_available()
    {
        // 1. Solo quedan 2 tickets
        $ticket = TicketType::factory()->create(['quantity' => 10, 'quantity_sold' => 8]);
        $sessionId = 'session-uuid-123';

        // 2. Intentar bloquear 3
        $request = [['id' => $ticket->id, 'quantity' => 3]];
        $result = $this->lockService->lockTickets($request, $sessionId);

        // 3. Debe fallar
        $this->assertFalse($result['success']);
        $this->assertNotEmpty($result['failures']);
    }

    /** @test */
    public function it_releases_locks_by_session()
    {
        $ticket = TicketType::factory()->create(['quantity' => 10]);
        $sessionId = 'session-abc';

        // Bloquear
        $this->lockService->lockTickets([['id' => $ticket->id, 'quantity' => 5]], $sessionId);

        // Verificar que están bloqueados
        $this->assertEquals(5, $this->lockService->getLockedQuantity($ticket->id));

        // Liberar
        $this->lockService->releaseTickets($sessionId);

        // Verificar que están libres
        $this->assertEquals(0, $this->lockService->getLockedQuantity($ticket->id));
    }
}
