<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promoter extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'organizer_id',
        'name',
        'email',
        'phone',
        'notes'
    ];

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function discountCodes(): HasMany
    {
        return $this->hasMany(DiscountCode::class);
    }

    public function sales()
    {
        return $this->hasManyThrough(Order::class, DiscountCode::class, 'promoter_id', 'discount_code_id');
    }
}
