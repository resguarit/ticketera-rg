<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cuota extends Model
{
    protected $fillable = [
        'event_id',
        'bin',
        'cantidad_cuotas',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
