<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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
    ];

    protected $casts = [
        'featured' => 'boolean',
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
}
