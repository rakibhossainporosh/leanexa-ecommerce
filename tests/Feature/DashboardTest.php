<?php

use App\Models\Customer;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = Customer::factory()->create();
    $this->actingAs($user);

    // Customers have no dashboard; the route funnels them to order history.
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('orders'));
});