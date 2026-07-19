<?php

use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Services\SslCommerzService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Setting::set('payment_settings', ['store_id' => 's', 'store_password' => 'p', 'is_sandbox' => true]);
    Currency::create(['code' => 'BDT', 'symbol' => 'Tk', 'exchange_rate' => 1.0000, 'is_default' => true,  'is_active' => true]);
    Currency::create(['code' => 'USD', 'symbol' => '$',  'exchange_rate' => 0.008,  'is_default' => false, 'is_active' => true]);
    Http::fake(['*sslcommerz.com*' => Http::response(['status' => 'SUCCESS', 'GatewayPageURL' => 'https://gw.test/pay'], 200)]);
});

function bdtOrder(): Order
{
    $order = Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'order_number' => 'ORD-' . strtoupper(Str::random(10)),
        'status' => 'pending', 'payment_status' => 'unpaid',
        'subtotal' => 1250, 'total_amount' => 1250, 'currency' => 'BDT', 'shipping_address' => 'Dhaka',
    ]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => Product::factory()->create()->id, 'product_name' => 'X', 'quantity' => 1, 'price' => 1250]);

    return $order;
}

// Captures what was posted to the gateway.
function gatewayPost(): array
{
    $sent = [];
    Http::assertSent(function ($request) use (&$sent) {
        if (str_contains($request->url(), 'sslcommerz.com')) {
            $sent = $request->data();
        }
        return true;
    });

    return $sent;
}

test('the gateway is charged the full BDT total even when browsing in USD', function () {
    $order = bdtOrder();
    session(['currency' => 'USD']); // customer is browsing in USD

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0); // NOT 10
    expect($post['currency'])->toBe('BDT');
});

test('the gateway is charged the full BDT total when browsing in BDT', function () {
    $order = bdtOrder();
    session(['currency' => 'BDT']);

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0);
    expect($post['currency'])->toBe('BDT');
});
