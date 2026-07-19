<?php

use App\Models\Currency;
use App\Models\CustomInvoice;
use App\Models\CustomInvoicePayment;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Services\SslCommerzService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

test('an order is always charged the full BDT total, even when browsing in USD', function () {
    $order = bdtOrder();
    session(['currency' => 'USD']); // customer browsing in USD

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0); // NOT 10
    expect($post['currency'])->toBe('BDT');
});

test('an order is charged the full BDT total when browsing in BDT', function () {
    $order = bdtOrder();
    session(['currency' => 'BDT']);

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0);
    expect($post['currency'])->toBe('BDT');
});

test('a USD invoice is charged its BDT equivalent, not its USD face value', function () {
    // $10 invoice issued at rate 0.008 -> 1250 BDT.
    $invoice = CustomInvoice::create([
        'uuid' => (string) Str::uuid(), 'customer_name' => 'B', 'customer_email' => 'b@b.com',
        'customer_phone' => '01700000000', 'subtotal' => 10, 'amount' => 10, 'amount_paid' => 0,
        'status' => 'pending', 'currency_code' => 'USD', 'exchange_rate' => 0.008,
    ]);
    $payment = CustomInvoicePayment::create([
        'custom_invoice_id' => $invoice->id, 'transaction_id' => 'INV-' . Str::random(8),
        'amount' => 10, 'status' => 'pending',
    ]);

    app(SslCommerzService::class)->initiateInvoicePayment($payment, $invoice, ['name' => 'B', 'email' => 'b@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0); // NOT 10
    expect($post['currency'])->toBe('BDT');
});

test('a BDT invoice is charged its face value unchanged', function () {
    $invoice = CustomInvoice::create([
        'uuid' => (string) Str::uuid(), 'customer_name' => 'C', 'customer_email' => 'c@c.com',
        'customer_phone' => '01700000000', 'subtotal' => 500, 'amount' => 500, 'amount_paid' => 0,
        'status' => 'pending', 'currency_code' => 'BDT', 'exchange_rate' => 1,
    ]);
    $payment = CustomInvoicePayment::create([
        'custom_invoice_id' => $invoice->id, 'transaction_id' => 'INV-' . Str::random(8),
        'amount' => 500, 'status' => 'pending',
    ]);

    app(SslCommerzService::class)->initiateInvoicePayment($payment, $invoice, ['name' => 'C', 'email' => 'c@c.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(500.0);
    expect($post['currency'])->toBe('BDT');
});
