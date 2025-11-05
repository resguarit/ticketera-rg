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
}
