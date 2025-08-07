<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ticket_types';

    protected $fillable = [
        'event_function_id',
        'sector_id',
        'name',
        'description',
        'price',
        'sales_start_date',
        'sales_end_date',
        'quantity',
        'quantity_sold',
        'is_hidden',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'quantity_sold' => 'integer',
        'is_hidden' => 'boolean',
        'sales_start_date' => 'datetime',
        'sales_end_date' => 'datetime',
    ];

    public function eventFunction()
    {
        return $this->belongsTo(EventFunction::class);
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }
}
