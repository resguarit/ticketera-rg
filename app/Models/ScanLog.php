<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    protected $fillable = [
        'issued_ticket_id',
        'event_function_id',
        'device_uuid',
        'device_name',
        'result',
        'scanned_code',
        'scanned_at',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];
}
