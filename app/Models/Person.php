<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'person';

    protected $fillable = [
        'name',
        'last_name',
        'dni',
        'phone',
        'address',
    ];

    protected $casts = [
        'address' => 'string',
    ];

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }
}
