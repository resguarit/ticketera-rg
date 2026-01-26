<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WelcomePopup extends Model
{
    use HasFactory;

    protected $fillable = [
        'image_url',
        'mobile_image_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['full_image_url', 'full_mobile_image_url'];

    public function getFullImageUrlAttribute(): ?string
    {
        return $this->image_url ? Storage::url($this->image_url) : null;
    }

    public function getFullMobileImageUrlAttribute(): ?string
    {
        return $this->mobile_image_url ? Storage::url($this->mobile_image_url) : null;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}