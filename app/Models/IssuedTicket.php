<?php

namespace App\Models;

use App\Enums\EmissionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\IssuedTicketStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
        'emission_type',
        'batch_id',
        'issued_at',
        'email_sent_at',
        'validated_at',
        'device_used',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'validated_at' => 'datetime',
        'status' => IssuedTicketStatus::class,
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(TicketBatch::class, 'batch_id');
    }

    public function isInvitation(): bool
    {
        return $this->emission_type === EmissionType::INVITATION->value;
    }

    protected function ownerName(): Attribute
    {
        return Attribute::make(
            get: function () {
                // 1. Si el ticket tiene un asistente se usa ese nombre
                if ($this->assistant_id && $this->assistant) {
                    return $this->assistant->person->name . ' ' . $this->assistant->person->last_name;
                }

                // 2. si tiene una orden y un cliente online
                if ($this->order_id && $this->order && $this->order->client_id) {
                    return $this->order->client->person->name . ' ' . $this->order->client->person->last_name;
                }

                // 3. si es un ticket de boleteria / fisico anonimo
                if (in_array($this->emission_type, [EmissionType::PRE_PRINTED->value, EmissionType::BOX_OFFICE->value])) {
                    return 'Consumidor Final (Venta Física)';
                }

                // 4. fallback generico
                return 'Entrada General';
            }
        );
    }

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

    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class);
    }
}
