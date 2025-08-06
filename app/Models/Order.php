<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\OrderStatus;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'client_id',
        'order_date',
        'total_amount',
        'status',
        'payment_method',
        'transaction_id',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'status' => OrderStatus::class,
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function items()
    {
        return $this->hasMany(IssuedTicket::class);
    }
}
