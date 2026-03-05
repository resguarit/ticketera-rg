<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\IssuedTicketStatus;

class TicketBatch extends Model
{
    // Tipos de lote
    const TYPE_REQUIRE_ACTIVATION = 'require_activation';
    const TYPE_PRE_ACTIVATED      = 'pre_activated';

    protected $fillable = [
        'event_function_id',
        'ticket_type_id',
        'promoter_id',
        'quantity',
        'type',
        'description',
        'is_reconciled',
    ];

    protected $casts = [
        'is_reconciled' => 'boolean',
        'quantity'      => 'integer',
    ];

    // ─── Relaciones ────────────────────────────────────────────────────────────

    public function eventFunction(): BelongsTo
    {
        return $this->belongsTo(EventFunction::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function promoter(): BelongsTo
    {
        return $this->belongsTo(Promoter::class);
    }

    public function issuedTickets(): HasMany
    {
        return $this->hasMany(IssuedTicket::class, 'batch_id');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    public function isPreActivated(): bool
    {
        return $this->type === self::TYPE_PRE_ACTIVATED;
    }

    public function isRequireActivation(): bool
    {
        return $this->type === self::TYPE_REQUIRE_ACTIVATION;
    }

    /** Tickets disponibles (no cancelados, no usados) que aún no tienen orden */
    public function availableTicketsCount(): int
    {
        return $this->issuedTickets()
            ->where('status', IssuedTicketStatus::AVAILABLE)
            ->whereNull('order_id')
            ->count();
    }

    /** Tickets que ya fueron vendidos (tienen order_id) */
    public function soldTicketsCount(): int
    {
        return $this->issuedTickets()
            ->whereNotNull('order_id')
            ->where('status', '!=', IssuedTicketStatus::CANCELLED)
            ->count();
    }
}
