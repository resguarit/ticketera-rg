<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'image_path',
        'mobile_image_path',
        'title',
        'is_archived',
        'display_order',
        'duration_seconds',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'display_order' => 'integer',
        'duration_seconds' => 'integer',
    ];

    protected $appends = ['image_url', 'mobile_image_url'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_path
                ? Storage::url($this->image_path)
                : null,
        );
    }

    protected function mobileImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->mobile_image_path
                ? Storage::url($this->mobile_image_path)
                : null,
        );
    }

    /**
     * Scope para obtener banners ordenados
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Scope para obtener solo banners activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }
}
