<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\RevenueService;
use Carbon\Carbon;

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
        'max_purchase_quantity', // ← AGREGAR ESTE CAMPO
        'is_hidden',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'quantity_sold' => 'integer',
        'max_purchase_quantity' => 'integer', // ← AGREGAR ESTE CAST
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

    public function issuedTickets(): HasMany
    {
        return $this->hasMany(IssuedTicket::class);
    }

    public function getRevenue(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        return app(RevenueService::class)->forTicketType($this, $startDate, $endDate);
    }
}
