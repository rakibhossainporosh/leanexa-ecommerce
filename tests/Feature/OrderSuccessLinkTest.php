<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\URL;

use function Pest\Laravel\get;

function paidOrder(): Order
{
    $order = Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'order_number' => 'ORD-' . strtoupper(Str::random(10)),
        'status' => 'processing', 'payment_status' => 'paid',
        'subtotal' => 1000, 'total_amount' => 1000, 'currency' => 'BDT', 'shipping_address' => 'Dhaka',
    ]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => Product::factory()->create()->id, 'product_name' => 'X', 'quantity' => 1, 'price' => 1000]);

    return $order;
}

test('the signed email link opens the order without a session or login', function () {
    $order = paidOrder();

    // Exactly what the email now generates.
    $signed = URL::signedRoute('checkout.success', ['order_number' => $order->order_number]);

    get($signed)->assertOk();
});

test('an unsigned link from a stranger is still rejected', function () {
    $order = paidOrder();

    // No signature, no session, not logged in.
    get(route('checkout.success', $order->order_number))->assertForbidden();
});

test('a tampered signature is rejected', function () {
    $order = paidOrder();

    $signed = URL::signedRoute('checkout.success', ['order_number' => $order->order_number]);
    // Corrupt the signature query param.
    $tampered = preg_replace('/signature=[a-f0-9]+/', 'signature=deadbeef', $signed);

    get($tampered)->assertForbidden();
});
