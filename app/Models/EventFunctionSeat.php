<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventFunctionSeat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'event_function_seats';

    protected $fillable = [
        'event_function_id',
        'seat_id',
        'issued_ticket_id',
        'status',
    ];

    public function eventFunction()
    {
        return $this->belongsTo(EventFunction::class, 'event_function_id');
    }

    public function seat()
    {
        return $this->belongsTo(Seat::class, 'seat_id');
    }

    public function issuedTicket()
    {
        return $this->belongsTo(IssuedTicket::class, 'issued_ticket_id');
    }
}
