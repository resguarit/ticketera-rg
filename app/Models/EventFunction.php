<?php

namespace App\Models;

use App\Enums\EventFunctionStatus;
use App\Services\RevenueService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['status'];

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

    /**
     * Get the status of the event function.
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: function (): EventFunctionStatus {
                if (!$this->is_active) {
                    return EventFunctionStatus::INACTIVE;
                }

                if ($this->start_time < now()) {
                    return EventFunctionStatus::FINISHED;
                }

                $this->loadMissing('ticketTypes');

                if ($this->ticketTypes->isEmpty()) {
                    return EventFunctionStatus::UPCOMING;
                }

                $allTicketsOnSale = $this->ticketTypes->every(function ($ticketType) {
                    return $ticketType->sales_start_date <= now() && ($ticketType->sales_end_date === null || $ticketType->sales_end_date >= now());
                });

                $anyTicketOnSale = $this->ticketTypes->some(function ($ticketType) {
                    return $ticketType->sales_start_date <= now() && ($ticketType->sales_end_date === null || $ticketType->sales_end_date >= now());
                });

                $allTicketsSoldOut = $this->ticketTypes->every(function ($ticketType) {
                    return $ticketType->quantity_sold >= $ticketType->quantity;
                });

                if ($allTicketsSoldOut) {
                    return EventFunctionStatus::SOLD_OUT;
                }

                if ($anyTicketOnSale) {
                    return EventFunctionStatus::ON_SALE;
                }

                return EventFunctionStatus::UPCOMING;
            }
        );
    }
}
