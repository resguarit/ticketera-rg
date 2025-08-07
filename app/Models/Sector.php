<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sectors';

    protected $fillable = [
        'venue_id',
        'name',
        'description',
        'capacity',
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function seats() : HasMany
    {
        return $this->hasMany(Seat::class);
    }
}
