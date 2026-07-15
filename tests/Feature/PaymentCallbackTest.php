<?php

use App\Http\Controllers\PaymentController;
use App\Mail\OrderInvoiceMail;
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
