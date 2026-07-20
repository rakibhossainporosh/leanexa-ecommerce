<?php

use App\Http\Controllers\PaymentController;
use App\Mail\OrderInvoiceMail;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Mail;

function callCompleteOrder(string $tranId, array $validation): void
{
    $controller = app(PaymentController::class);
    $method = new ReflectionMethod($controller, 'completeOrder');
    $method->setAccessible(true);
    $method->invoke($controller, $tranId, $validation);
}

test('SSLCommerz calling back twice sends only one invoice email', function () {
    Mail::fake();
    // completeOrder() touches request()->session(); give the bare request one.
    $this->startSession();
    request()->setLaravelSession(app('session.store'));

    $customer = Customer::factory()->create();
    $product  = Product::factory()->create(['price' => 1000, 'discount_price' => null]);

    $order = Order::create([
        'customer_id'    => $customer->id,
        'order_number'   => 'ORD-TESTDOUBLE01',
        'status'         => 'pending',
        'payment_status' => 'unpaid',
        'subtotal'       => 1000,
        'total_amount'   => 1000,
        'currency'       => 'BDT',
        'shipping_address' => 'Dhaka, Bangladesh',
    ]);
    OrderItem::create([
        'order_id' => $order->id, 'product_id' => $product->id,
        'product_name' => $product->name, 'quantity' => 1, 'price' => 1000,
    ]);

    $validation = [
        'store_amount'  => '1000.00',
        'currency_amount' => '1000.00',
        'currency_type' => 'BDT',
        'status'        => 'VALID',
    ];

    // 1st callback: the customer's browser returns to success_url.
    callCompleteOrder('ORD-TESTDOUBLE01', $validation);
    // 2nd callback: SSLCommerz hits ipn_url server-to-server.
    callCompleteOrder('ORD-TESTDOUBLE01', $validation);

    expect($order->fresh()->payment_status)->toBe('paid');

    // OrderInvoiceMail is ShouldQueue, so MailFake records it as queued.
    // The whole point: exactly one email, not two.
    Mail::assertQueued(OrderInvoiceMail::class, 1);
});

/**
 * On a USD-default store the order total is stored in USD, but the gateway is
 * charged in the customer's selected currency. Both a BDT and a USD payment
 * must validate against that USD-stored total.
 */
function seedUsdDefaultStore(): void
{
    Currency::query()->delete();
    Currency::create(['code' => 'USD', 'symbol' => '$', 'exchange_rate' => 1, 'is_default' => true, 'is_active' => true]);
    Currency::create(['code' => 'BDT', 'symbol' => '৳', 'exchange_rate' => 125, 'is_default' => false, 'is_active' => true]);
}

function makePendingUsdOrder(string $tranId): Order
{
    $customer = Customer::factory()->create();
    $product  = Product::factory()->create(['price' => 110, 'discount_price' => null]);

    $order = Order::create([
        'customer_id'    => $customer->id,
        'order_number'   => $tranId,
        'status'         => 'pending',
        'payment_status' => 'unpaid',
        'subtotal'       => 110,
        'total_amount'   => 110, // stored in the default currency (USD)
        'currency'       => 'BDT',
        'shipping_address' => 'Dhaka, Bangladesh',
    ]);
    OrderItem::create([
        'order_id' => $order->id, 'product_id' => $product->id,
        'product_name' => $product->name, 'quantity' => 1, 'price' => 110,
    ]);

    return $order;
}

test('a BDT payment validates against a USD-stored order total', function () {
    Mail::fake();
    $this->startSession();
    request()->setLaravelSession(app('session.store'));
    seedUsdDefaultStore();

    $order = makePendingUsdOrder('ORD-BDTPAY000001');

    // Customer paid in BDT: gateway processed 110 * 125 = 13,750 BDT.
    callCompleteOrder('ORD-BDTPAY000001', [
        'store_amount'    => '13750.00',
        'currency_amount' => '13750.00',
        'currency_type'   => 'BDT',
        'status'          => 'VALID',
    ]);

    expect($order->fresh()->payment_status)->toBe('paid');
});

test('a USD payment validates against a USD-stored order total', function () {
    Mail::fake();
    $this->startSession();
    request()->setLaravelSession(app('session.store'));
    seedUsdDefaultStore();

    $order = makePendingUsdOrder('ORD-USDPAY000001');

    // Customer paid in USD: gateway processed 110 USD (settled to BDT by SSLCommerz).
    callCompleteOrder('ORD-USDPAY000001', [
        'store_amount'    => '13612.50',
        'currency_amount' => '110.00',
        'currency_type'   => 'USD',
        'status'          => 'VALID',
    ]);

    expect($order->fresh()->payment_status)->toBe('paid');
});
