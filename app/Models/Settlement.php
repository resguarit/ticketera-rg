<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Settlement extends Model
{
    protected $table = 'settlements';

    protected $guarded = [];

    protected $fillable = [
        'event_function_id',
        'transfer_date',
        'quantity',
        'amount_unit_gross',
        'amount_total_gross',
        'amount_unit_net',
        'amount_total_net',
        'discounts',
        'discount_observation',
        'total_transfer',
        'attachment_path',
    ];

    protected $casts = [
        'transfer_date' => 'datetime',
        'amount_unit_gross' => 'decimal:2',
        'amount_total_gross' => 'decimal:2',
        'amount_unit_net' => 'decimal:2',
        'amount_total_net' => 'decimal:2',
        'discounts' => 'decimal:2',
        'total_transfer' => 'decimal:2',
    ];

    public function eventFunction(): BelongsTo
    {
        return $this->belongsTo(EventFunction::class);
    }
}
