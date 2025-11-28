<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
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

    protected function prepareForValidation()
    {
        $this->merge([
            'facebook_url' => $this->facebook_url ? 'https://www.facebook.com/'.$this->facebook_url : null,
            'instagram_url' => $this->instagram_url ? 'https://www.instagram.com/'.$this->instagram_url : null,
            'twitter_url' => $this->twitter_url ? 'https://x.com/'.$this->twitter_url : null,
        ]);
    }
}
