<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'client_id',
        'order_date',
        'status',
        'payment_method',
        'transaction_id',
        'subtotal',
        'discount', // Porcentaje de descuento aplicado
        'tax', // Porcentaje de impuesto aplicado
        'service_fee',
        'total_amount',
        'discount_code_id', // Clave foránea para el código de descuento
        'order_details',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'status' => OrderStatus::class,
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'order_details' => 'json',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function items()
    {
        return $this->hasMany(IssuedTicket::class);
    }

    public function issuedTickets()
    {
        return $this->hasMany(IssuedTicket::class);
    }

    /**
     * Relación con el código de descuento aplicado a la orden.
     */
    public function discountCode(): BelongsTo
    {
        return $this->belongsTo(DiscountCode::class);
    }

    /**
     * Obtiene el Organizador a través de los items de la orden.
     * Asume que todos los tickets de una orden pertenecen al mismo evento/organizador.
     */
    public function organizer(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Carga la relación si aún no está cargada
                if (!$this->relationLoaded('items.ticketType.eventFunction.event.organizer')) {
                    $this->load('items.ticketType.eventFunction.event.organizer');
                }
                
                // Devuelve el organizador del primer item
                return $this->items->first()?->ticketType?->eventFunction?->event?->organizer;
            }
        );
    }


    // Accessors for calculated values

    public function getSubtotalAttribute($value)
    {
        if ($value === null && $this->relationLoaded('items')) {
            return $this->items->reduce(function ($carry, $item) {
                return $carry + ($item->ticketType->price ?? 0);
            }, 0);
        }
        return $value;
    }

    public function getServiceFeeAttribute($value)
    {
        if ($value === null) {
            // El tax (como tasa decimal) se almacena en la orden al momento de la compra.
            $taxRate = $this->attributes['tax'] ?? 0;
            $subtotalWithDiscount = $this->subtotal * (1 - ($this->discount ?? 0));
            return $subtotalWithDiscount * $taxRate;
        }
        return $value;
    }

    public function getTotalAmountAttribute($value)
    {
        if ($value === null) {
            // Usa el 'discount' de la orden si existe, si no, lo busca en el código de descuento.
            $discountRate = $this->attributes['discount'] ?? $this->discountCode?->value ?? 0;

            $subtotalWithDiscount = $this->subtotal * (1 - $discountRate);
            // Llama al accesor de service_fee para obtener el valor calculado
            return $subtotalWithDiscount + $this->getServiceFeeAttribute(null);
        }
        return $value;
    }

}