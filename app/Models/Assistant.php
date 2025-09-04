<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assistant extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'assistants';

    protected $fillable = [
        'event_function_id',
        'person_id',
        'email',
        'quantity',
        'sended_at',
    ];

    protected $casts = [
        'sended_at' => 'datetime',
    ];

    public function eventFunction(): BelongsTo
    {
        return $this->belongsTo(EventFunction::class, 'event_function_id');
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id');
    }

    public function issuedTickets(): HasMany
    {
        return $this->hasMany(IssuedTicket::class, 'assistant_id');
    }
}
