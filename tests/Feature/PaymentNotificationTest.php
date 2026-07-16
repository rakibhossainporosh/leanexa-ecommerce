<?php

use App\Http\Controllers\PaymentController;
use App\Models\CustomInvoice;
use App\Models\CustomInvoicePayment;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

beforeEach(function () {
    // completeOrder touches request()->session(); give the bare request one.
    test()->startSession();
    request()->setLaravelSession(app('session.store'));

    // Two admin addresses, entered messily (newline + comma + an invalid one).
    Setting::set('general_settings', array_merge(Setting::generalDefaults(), [
        'admin_notification_emails' => "owner@store.com\naccounts@store.com, not-an-email",
    ]));
});

// Every recipient address across all messages the array transport captured.
function allRecipients(): array
{
    return Mail::getSymfonyTransport()->messages()
        ->flatMap(fn ($sent) => collect($sent->getOriginalMessage()->getTo())->map->getAddress())
        ->all();
}

function callComplete(string $method, ...$args)
{
    $c = app(PaymentController::class);
    $m = new ReflectionMethod($c, $method);
    $m->setAccessible(true);

    return $m->invoke($c, ...$args);
}

test('Setting parses admin emails and drops invalid ones', function () {
    expect(Setting::adminNotificationEmails())->toBe(['owner@store.com', 'accounts@store.com']);
});

test('a paid order notifies both admin addresses', function () {
    $customer = Customer::factory()->create(['email' => 'buyer@example.com']);
    $order = Order::create([
        'customer_id' => $customer->id, 'order_number' => 'ORD-NOTIFY1',
        'status' => 'pending', 'payment_status' => 'unpaid',
        'subtotal' => 1000, 'total_amount' => 1000, 'currency' => 'BDT', 'shipping_address' => 'Dhaka',
    ]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => Product::factory()->create()->id, 'product_name' => 'X', 'quantity' => 1, 'price' => 1000]);

    $validation = ['store_amount' => '1000.00', 'currency_amount' => '1000.00', 'currency_type' => 'BDT', 'status' => 'VALID'];
    callComplete('completeOrder', 'ORD-NOTIFY1', $validation);

    $recipients = allRecipients();
    expect($recipients)->toContain('owner@store.com');
    expect($recipients)->toContain('accounts@store.com');
    expect($recipients)->toContain('buyer@example.com'); // customer still gets theirs
});

function pendingInvPayment(float $amount, float $invoiceAmount): CustomInvoicePayment
{
    $invoice = CustomInvoice::create([
        'uuid' => (string) Str::uuid(), 'customer_name' => 'Buyer', 'customer_email' => 'cust@example.com',
        'customer_phone' => '+8801712345678', 'subtotal' => $invoiceAmount, 'amount' => $invoiceAmount,
        'amount_paid' => 0, 'status' => 'pending', 'currency_code' => 'BDT',
    ]);

    return CustomInvoicePayment::create([
        'custom_invoice_id' => $invoice->id, 'transaction_id' => 'INV-' . Str::random(8),
        'amount' => $amount, 'status' => 'pending',
    ]);
}

test('a PARTIAL invoice payment emails both the customer and the admins', function () {
    $payment = pendingInvPayment(300, 1000); // partial
    $validation = ['store_amount' => '300.00', 'currency_amount' => '300.00', 'currency_type' => 'BDT', 'status' => 'VALID'];

    callComplete('completeInvoice', $payment->transaction_id, $validation);

    expect($payment->invoice->fresh()->status)->toBe('partially_paid');
    $recipients = allRecipients();
    expect($recipients)->toContain('cust@example.com');  // the fix: customer emailed on partial
    expect($recipients)->toContain('owner@store.com');
    expect($recipients)->toContain('accounts@store.com');
});

test('a FULL invoice payment emails both the customer and the admins', function () {
    $payment = pendingInvPayment(1000, 1000); // full
    $validation = ['store_amount' => '1000.00', 'currency_amount' => '1000.00', 'currency_type' => 'BDT', 'status' => 'VALID'];

    callComplete('completeInvoice', $payment->transaction_id, $validation);

    expect($payment->invoice->fresh()->status)->toBe('paid');
    $recipients = allRecipients();
    expect($recipients)->toContain('cust@example.com');
    expect($recipients)->toContain('owner@store.com');
});

test('with no admin emails configured, nothing extra is sent and no error occurs', function () {
    Setting::set('general_settings', array_merge(Setting::generalDefaults(), ['admin_notification_emails' => '']));

    $payment = pendingInvPayment(500, 1000);
    $validation = ['store_amount' => '500.00', 'currency_amount' => '500.00', 'currency_type' => 'BDT', 'status' => 'VALID'];
    callComplete('completeInvoice', $payment->transaction_id, $validation);

    $recipients = allRecipients();
    expect($recipients)->toContain('cust@example.com');       // customer still emailed
    expect($recipients)->not->toContain('owner@store.com');   // no admin config -> no admin mail
});
