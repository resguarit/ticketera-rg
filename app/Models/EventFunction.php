<?php

namespace App\Models;

use App\Enums\EventFunctionStatus;
use App\Services\RevenueService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventFunction extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'event_functions';

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'start_time',
        'end_time',
        'is_active',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
        'status' => EventFunctionStatus::class,
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(TicketType::class);
    }

    public function issuedTickets(): HasManyThrough
    {
        return $this->hasManyThrough(IssuedTicket::class, TicketType::class);
    }

    public function getRevenue(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        return app(RevenueService::class)->forFunction($this, $startDate, $endDate);
    }

    /**
     * Actualiza automáticamente el estado de la función basándose en:
     * - Fechas de la función
     * - Disponibilidad de tickets
     * - Fechas de venta de tickets
     */
    public function updateStatus(): void
    {
        $now = Carbon::now();
        $currentStatus = $this->status;
        
        // No actualizar si está cancelado o reprogramado (estados manuales)
        if (in_array($currentStatus, [EventFunctionStatus::CANCELLED, EventFunctionStatus::REPROGRAMMED])) {
            return;
        }

        // 1. Si la función ya finalizó (end_time pasó o start_time pasó si no hay end_time)
        if ($this->end_time && $this->end_time->isPast()) {
            $this->updateStatusIfChanged(EventFunctionStatus::FINISHED);
            return;
        }

        if (!$this->end_time && $this->start_time->isPast()) {
            $this->updateStatusIfChanged(EventFunctionStatus::FINISHED);
            return;
        }

        // 2. Obtener tickets visibles (no ocultos)
        $visibleTickets = $this->ticketTypes()->where('is_hidden', false)->get();
        
        if ($visibleTickets->isEmpty()) {
            $this->updateStatusIfChanged(EventFunctionStatus::UPCOMING);
            return;
        }

        // 3. Verificar si hay tickets en periodo de venta
        $ticketsOnSale = $visibleTickets->filter(function ($ticket) use ($now) {
            $salesStarted = !$ticket->sales_start_date || Carbon::parse($ticket->sales_start_date)->isPast();
            $salesNotEnded = !$ticket->sales_end_date || Carbon::parse($ticket->sales_end_date)->isFuture();
            
            return $salesStarted && $salesNotEnded;
        });

        if ($ticketsOnSale->isEmpty()) {
            $this->updateStatusIfChanged(EventFunctionStatus::UPCOMING);
            return;
        }

        // 4. Verificar disponibilidad de tickets en venta
        $availableTickets = $ticketsOnSale->filter(function ($ticket) {
            return ($ticket->quantity - $ticket->quantity_sold) > 0;
        });

        if ($availableTickets->isEmpty()) {
            // Todos los tickets en venta están agotados
            $this->updateStatusIfChanged(EventFunctionStatus::SOLD_OUT);
            return;
        }

        // 5. Hay tickets disponibles en venta
        $this->updateStatusIfChanged(EventFunctionStatus::ON_SALE);
    }

    /**
     * Actualiza el estado solo si cambió
     */
    private function updateStatusIfChanged(EventFunctionStatus $newStatus): void
    {
        if ($this->status !== $newStatus) {
            $this->status = $newStatus;
            $this->saveQuietly(); // Guardar sin disparar eventos
        }
    }

    /**
     * Scope para cargar funciones con estado actualizado
     */
    public function scopeWithUpdatedStatus($query)
    {
        return $query->with('ticketTypes');
    }
}
