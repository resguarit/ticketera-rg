<?php
// filepath: app/Models/Provincia.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Provincia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'provincias';

    protected $fillable = [
        'name',
        'code',
        'country',
    ];

    public function ciudades(): HasMany
    {
        return $this->hasMany(Ciudad::class);
    }

    public function venues(): HasManyThrough
    {
        return $this->hasManyThrough(Venue::class, Ciudad::class);
    }
}