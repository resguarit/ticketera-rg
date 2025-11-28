<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'referring' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'facebook_url' => 'nullable|url:http,https|max:255',
            'instagram_url' => 'nullable|url:http,https|max:255',
            'twitter_url' => 'nullable|url:http,https|max:255',
            'tax' => 'nullable|string|max:20',
        ];
    }

    protected function prepareForValidation(): void
    {
        // If the value already includes the full URL keep it, otherwise prepend base path.
        $this->merge([
            'facebook_url' => $this->normalizeSocial($this->facebook_url, 'https://www.facebook.com/'),
            'instagram_url' => $this->normalizeSocial($this->instagram_url, 'https://www.instagram.com/'),
            'twitter_url' => $this->normalizeSocial($this->twitter_url, 'https://x.com/'),
        ]);
    }

    private function normalizeSocial($value, string $prefix): ?string
    {
        if (!$value) {
            return null;
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value; // already a full URL
        }
        return $prefix . ltrim($value, '/');
    }
}
