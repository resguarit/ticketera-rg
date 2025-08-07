<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organizer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organizers';

    protected $fillable = [
        'name',
        'referring',
        'email',
        'phone',
        'logo_url',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'tax',
        'decidir_public_key_prod',
        'decidir_secret_key_prod',
        'decidir_public_key_test',
        'decidir_secret_key_test',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
