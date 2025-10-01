<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'location' => ['nullable','string','max:255'],
            'start_time' => ['required','date'],
            'end_time' => ['required','date','after:start_time'],
            'max_capacity' => ['nullable','integer','min:1'],
            'timezone' => ['nullable','string'],
        ];
    }
}
