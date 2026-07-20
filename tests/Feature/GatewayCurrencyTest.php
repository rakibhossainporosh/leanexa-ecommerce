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

// ---- Orders: charged in whatever currency the customer is browsing in ----

test('an order paid while browsing in USD is sent to the gateway in USD', function () {
    $order = bdtOrder();
    session(['currency' => 'USD']);

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    // 1250 BDT * 0.008 = 10 USD — SSLCommerz settles USD to BDT at its own rate.
    expect((float) $post['total_amount'])->toBe(10.0);
    expect($post['currency'])->toBe('USD');
});

test('an order paid while browsing in BDT is sent to the gateway in BDT', function () {
    $order = bdtOrder();
    session(['currency' => 'BDT']);

    app(SslCommerzService::class)->initiatePayment($order, ['name' => 'A', 'email' => 'a@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(1250.0);
    expect($post['currency'])->toBe('BDT');
});

// ---- Invoices: charged in the currency the invoice was issued in ----

function invoiceAndPayment(string $code, float $amount): CustomInvoicePayment
{
    $invoice = CustomInvoice::create([
        'uuid' => (string) Str::uuid(), 'customer_name' => 'B', 'customer_email' => 'b@b.com',
        'customer_phone' => '01700000000', 'subtotal' => $amount, 'amount' => $amount, 'amount_paid' => 0,
        'status' => 'pending', 'currency_code' => $code, 'exchange_rate' => $code === 'USD' ? 0.008 : 1,
    ]);

    return CustomInvoicePayment::create([
        'custom_invoice_id' => $invoice->id, 'transaction_id' => 'INV-' . Str::random(8),
        'amount' => $amount, 'status' => 'pending',
    ]);
}

test('a USD invoice is sent to the gateway in USD', function () {
    $payment = invoiceAndPayment('USD', 10);

    app(SslCommerzService::class)->initiateInvoicePayment($payment, $payment->invoice, ['name' => 'B', 'email' => 'b@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(10.0);
    expect($post['currency'])->toBe('USD');
});

test('a BDT invoice is sent to the gateway in BDT', function () {
    $payment = invoiceAndPayment('BDT', 500);

    app(SslCommerzService::class)->initiateInvoicePayment($payment, $payment->invoice, ['name' => 'B', 'email' => 'b@b.com', 'phone' => '01700000000']);

    $post = gatewayPost();
    expect((float) $post['total_amount'])->toBe(500.0);
    expect($post['currency'])->toBe('BDT');
});
