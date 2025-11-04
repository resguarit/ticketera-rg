<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cuota extends Model
{
    protected $fillable = [
        'event_id',
        'bin',
        'cantidad_cuotas',
        'habilitada',
        'banco',
    ];

    protected $casts = [
        'habilitada' => 'boolean',
        'cantidad_cuotas' => 'integer',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
