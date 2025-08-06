<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\IssuedTicketStatus;

class IssuedTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'issued_tickets';

    protected $fillable = [
        'ticket_type_id',
        'order_id',
        'assistant_id',
        'client_id',
        'unique_code',
        'status',
        'issued_at',
        'validated_at',
        'device_used',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'validated_at' => 'datetime',
        'status' => IssuedTicketStatus::class,
    ];

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class, 'ticket_type_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function assistant(): BelongsTo
    {
        return $this->belongsTo(Assistant::class, 'assistant_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
