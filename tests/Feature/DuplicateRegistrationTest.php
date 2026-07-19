<?php

use App\Models\Customer;

use function Pest\Laravel\post;

test('registering with an existing customer email is a validation error, not a 500', function () {
    Customer::factory()->create(['email' => 'taken@example.com']);

    $response = post('/register', [
        'name' => 'Second Person',
        'email' => 'taken@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    // Should bounce back with an email validation error — never a 500.
    $response->assertSessionHasErrors('email');
    expect(Customer::where('email', 'taken@example.com')->count())->toBe(1); // no duplicate row
});

test('registering with a fresh email still works', function () {
    post('/register', [
        'name' => 'New Person',
        'email' => 'fresh@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    expect(Customer::where('email', 'fresh@example.com')->exists())->toBeTrue();
});

test('a customer email matching an existing ADMIN email is still allowed to register', function () {
    // Admin users and customers are separate tables; the same email in `users`
    // must not block a customer from registering.
    App\Models\User::factory()->create(['email' => 'shared@example.com']);

    post('/register', [
        'name' => 'Shopper',
        'email' => 'shared@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    expect(Customer::where('email', 'shared@example.com')->exists())->toBeTrue();
});
