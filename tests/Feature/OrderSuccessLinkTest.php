<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

use function Pest\Laravel\get;

function paidOrder(): Order
{
    $order = Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'order_number' => 'ORD-' . strtoupper(Str::random(12)),
        'status' => 'processing', 'payment_status' => 'paid',
        'subtotal' => 1000, 'total_amount' => 1000, 'currency' => 'BDT', 'shipping_address' => 'Dhaka',
    ]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => Product::factory()->create()->id, 'product_name' => 'X', 'quantity' => 1, 'price' => 1000]);

    return $order;
}

test('a guest can open the order from the email link without a session or login', function () {
    $order = paidOrder();

    // The plain confirmation link from the email — no signature, no session.
    get(route('checkout.success', $order->order_number))->assertOk();
});

test('an unknown order number is a 404, not a leak', function () {
    get(route('checkout.success', 'ORD-DOESNOTEXIST0'))->assertNotFound();
});

test('guests can reach the track-order page', function () {
    get(route('track.order'))->assertOk();
});

test('a guest can look up an order by its number on track-order', function () {
    $order = paidOrder();

    get(route('track.order', ['order_number' => $order->order_number]))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('order.order_number', $order->order_number));
});
