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
        'bundle_reference',  // ← NUEVO
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

    // ← NUEVO: Método para verificar si pertenece a un bundle
    public function isFromBundle(): bool
    {
        return !is_null($this->bundle_reference);
    }

    // ← NUEVO: Obtener todos los tickets del mismo bundle
    public function bundleTickets()
    {
        if (!$this->isFromBundle()) {
            return collect([$this]);
        }

        return static::where('bundle_reference', $this->bundle_reference)->get();
    }
}
