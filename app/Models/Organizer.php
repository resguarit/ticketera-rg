<?php

namespace App\Models;

use Dom\Attr;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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

    protected $appends = ['image_url'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->logo_url
                ? Storage::url($this->logo_url)
                : null,
        );
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
