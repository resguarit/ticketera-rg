<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketBatch extends Model
{
    protected $fillable = [
        'event_function_id',
        'ticket_type_id',
        'promoter_id',
        'quantity',
        'type',
        'description'
    ];

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
        return $this->hasMany(IssuedTicket::class);
    }
}
