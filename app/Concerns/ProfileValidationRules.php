<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null, string $model = User::class): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId, $model),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null, string $model = User::class): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            // Uniqueness must be checked against the table the account actually
            // lives in — customers register into `customers`, admins into `users`.
            $userId === null
                ? Rule::unique($model)
                : Rule::unique($model)->ignore($userId),
        ];
    }
}
