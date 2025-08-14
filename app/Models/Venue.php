<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Venue extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'venues';

    protected $fillable = [
        'name',
        'address', // Mantiene calle, altura, entre calles
        'ciudad_id', // Nueva relación
        'coordinates',
        'banner_url',
        'referring',
    ];

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class);
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function sectors(): HasMany
    {
        return $this->hasMany(Sector::class);
    }

    // Método helper para obtener la dirección completa
    public function getFullAddressAttribute(): string
    {
        $parts = [];
        
        if ($this->address) {
            $parts[] = $this->address;
        }
        
        if ($this->ciudad) {
            $parts[] = $this->ciudad->name;
            if ($this->ciudad->provincia) {
                $parts[] = $this->ciudad->provincia->name;
                $parts[] = $this->ciudad->provincia->country;
            }
        }
        
        return implode(', ', $parts);
    }
}
