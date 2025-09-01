<?php

namespace App\Models;

use App\Services\RevenueService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Ticket;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'events';

    protected $fillable = [
        'organizer_id',
        'category_id',
        'venue_id',
        'name',
        'description',
        'banner_url',
        'featured',
        'is_archived',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'is_archived' => 'boolean',
    ];

    protected $appends = ['image_url'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->banner_url
                ? Storage::url($this->banner_url)
                : null,
        );
    }

    protected function firstFunction(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->functions()->orderBy('start_time', 'asc')->first()
        );
    }

    protected function minPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                $allTickets = $this->functions->flatMap(fn($func) => $func->ticketTypes ?? collect());
                return $allTickets->where('quantity_sold', '<', 'quantity')->min('price') ?? 0;
            }
        );
    }

    /**
     * Relations
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function functions(): HasMany
    {
        return $this->hasMany(EventFunction::class);
    }

    public function discounts_codes(): HasMany
    {
        return $this->hasMany(DiscountCode::class);
    }

    public function ticketTypes(): HasManyThrough
    {
        return $this->hasManyThrough(TicketType::class, EventFunction::class);
    }

    /**
     * Class methods
     */
    public function getRevenue(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        return app(RevenueService::class)->forEvent($this, $startDate, $endDate);
    }
}
