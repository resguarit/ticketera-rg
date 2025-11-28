<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'person' => ['required', 'array'],
            'person.name' => ['required', 'string', 'max:255'],
            'person.last_name' => ['required', 'string', 'max:255'],
            'person.phone' => ['nullable', 'string', 'max:20'],
            'person.dni' => ['required', 'string', 'max:255', 'unique:person,dni,'.$this->user()->person->id],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
