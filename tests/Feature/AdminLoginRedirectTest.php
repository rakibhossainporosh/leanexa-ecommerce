<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('Admin', 'admin');
});

// Admins live in the users table and authenticate on the `admin` guard.
function makeAdmin(): User
{
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('Admin');

    return $user;
}

// Storefront customers live in the customers table on the `web` guard.
function makeCustomer(): Customer
{
    return Customer::factory()->create();
}

// 1. Guest -> /admin/login shows the admin login page (no redirect).
test('guest sees the admin login page', function () {
    get('/admin/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/admin-login'));
});

// 2. Customer -> /admin/login must NOT redirect to /account; it shows the page.
test('logged-in customer sees the admin login page and is not sent to account', function () {
    actingAs(makeCustomer());

    $response = get('/admin/login');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('auth/admin-login'));
    expect($response->headers->get('Location'))->not->toBe(url('/account'));
});

// 3. Admin -> /admin/login redirects to /admin/dashboard.
test('logged-in admin is redirected from admin login to admin dashboard', function () {
    actingAs(makeAdmin(), 'admin');

    get('/admin/login')->assertRedirect('/admin/dashboard');
});

// 4. Guest -> /account redirects to the customer login.
test('guest hitting account is redirected to customer login', function () {
    get('/account')->assertRedirect('/login');
});

// 5. Customer -> /account is allowed.
test('customer can view their account', function () {
    actingAs(makeCustomer());

    get('/account')->assertOk();
});

// 6. Customer -> /admin/dashboard is denied (redirected to admin login).
test('customer cannot reach the admin dashboard', function () {
    actingAs(makeCustomer());

    get('/admin/dashboard')->assertRedirect('/admin/login');
});

// 7. Admin -> /admin/dashboard is allowed.
test('admin can view the admin dashboard', function () {
    actingAs(makeAdmin(), 'admin');

    get('/admin/dashboard')->assertOk();
});

// Guard: guest hitting a protected admin route lands on the ADMIN login, not /login.
test('guest hitting an admin route is redirected to admin login', function () {
    get('/admin/products')->assertRedirect('/admin/login');
});
