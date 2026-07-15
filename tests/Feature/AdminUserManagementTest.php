<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('Admin', 'admin');
    Role::findOrCreate('Customer', 'admin');
});

function admin(): User
{
    $u = User::factory()->create(['email_verified_at' => now()]);
    $u->assignRole('Admin');

    return $u;
}

test('storefront registration creates a customer account', function () {
    post('/register', [
        'name' => 'New Shopper',
        'email' => 'shopper@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    // Registration creates a Customer (separate table) — never an admin User.
    expect(\App\Models\Customer::where('email', 'shopper@example.com')->first())->not->toBeNull();
    expect(User::where('email', 'shopper@example.com')->first())->toBeNull();
});

test('admin can create a new admin user', function () {
    actingAs(admin(), 'admin');

    post('/admin/users', [
        'name' => 'Second Admin',
        'email' => 'admin2@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'Admin',
    ])->assertRedirect();

    $created = User::where('email', 'admin2@example.com')->first();
    expect($created->hasRole('Admin'))->toBeTrue();
});

test('admin can update a user role and delete a user', function () {
    $me = admin();
    actingAs($me, 'admin');

    $customer = User::factory()->create();
    $customer->assignRole('Customer');

    // Promote to Admin
    $this->put("/admin/users/{$customer->id}", [
        'name' => $customer->name,
        'email' => $customer->email,
        'role' => 'Admin',
    ])->assertRedirect();
    expect($customer->fresh()->hasRole('Admin'))->toBeTrue();

    // Delete
    $this->delete("/admin/users/{$customer->id}")->assertRedirect();
    expect(User::find($customer->id))->toBeNull();
});

test('the last admin cannot be deleted or demoted', function () {
    $onlyAdmin = admin();
    actingAs($onlyAdmin, 'admin');

    $this->delete("/admin/users/{$onlyAdmin->id}")->assertRedirect();
    expect(User::find($onlyAdmin->id))->not->toBeNull(); // self-delete blocked

    $this->put("/admin/users/{$onlyAdmin->id}", [
        'name' => $onlyAdmin->name,
        'email' => $onlyAdmin->email,
        'role' => 'Customer',
    ])->assertRedirect();
    expect($onlyAdmin->fresh()->hasRole('Admin'))->toBeTrue(); // last-admin demotion blocked
});

test('a non-admin cannot access user management', function () {
    $customer = User::factory()->create(['email_verified_at' => now()]);
    $customer->assignRole('Customer');
    actingAs($customer);

    $this->get('/admin/users')->assertRedirect('/admin/login');
});
