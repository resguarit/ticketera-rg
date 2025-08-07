<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscountCode extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'discount_codes';

    protected $fillable = [
        'event_id',
        'name',
        'code',
        'value',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
