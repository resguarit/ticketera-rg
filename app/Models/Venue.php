<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'venues';

    protected $fillable = [
        'name',
        'address',
        'coordinates',
        'banner_url',
        'referring',
    ];

    public function eventos(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function sectors(): HasMany
    {
        return $this->hasMany(Sector::class);
    }
}
