<?php

use App\Http\Controllers\PaymentController;
use App\Models\CustomInvoice;
use App\Models\CustomInvoicePayment;
use App\Models\Setting;
use App\Services\SslCommerzService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

function callCompleteInvoice(string $tranId, array $validation)
{
    $controller = app(PaymentController::class);
    $m = new ReflectionMethod($controller, 'completeInvoice');
    $m->setAccessible(true);

    return $m->invoke($controller, $tranId, $validation);
}

function pendingInvoicePayment(float $amount, float $invoiceAmount): CustomInvoicePayment
{
    $invoice = CustomInvoice::create([
        'uuid' => (string) Str::uuid(),
        'customer_name' => 'Buyer', 'customer_email' => 'b@example.com', 'customer_phone' => '+8801712345678',
        'subtotal' => $invoiceAmount, 'amount' => $invoiceAmount, 'amount_paid' => 0,
        'status' => 'pending', 'currency_code' => 'BDT',
    ]);

    return CustomInvoicePayment::create([
        'custom_invoice_id' => $invoice->id,
        'transaction_id' => 'INV-' . Str::random(8),
        'amount' => $amount,
        'status' => 'pending',
    ]);
}

test('a partial invoice payment marks the invoice partially paid', function () {
    Mail::fake();
    $payment = pendingInvoicePayment(300, 1000);
    $validation = ['store_amount' => '300.00', 'currency_amount' => '300.00', 'currency_type' => 'BDT', 'status' => 'VALID'];

    callCompleteInvoice($payment->transaction_id, $validation);

    $invoice = $payment->invoice->fresh();
    expect($invoice->status)->toBe('partially_paid');
    expect((float) $invoice->amount_paid)->toBe(300.0);
});

test('the second SSLCommerz callback does not show Invalid Invoice Transaction', function () {
    Mail::fake();
    $payment = pendingInvoicePayment(300, 1000);
    $validation = ['store_amount' => '300.00', 'currency_amount' => '300.00', 'currency_type' => 'BDT', 'status' => 'VALID'];

    // 1st callback settles it.
    callCompleteInvoice($payment->transaction_id, $validation);
    // 2nd callback (the race that caused the bug).
    $response = callCompleteInvoice($payment->transaction_id, $validation);

    // Must NOT bounce to home with the error — it should confirm success on the invoice.
    expect(session('success'))->toBe('Payment Successful!');
    expect(session('error'))->toBeNull();
    expect($response->getTargetUrl())->toContain($payment->invoice->uuid);

    // And it must not double-count the amount.
    expect((float) $payment->invoice->fresh()->amount_paid)->toBe(300.0);
});

test('a genuinely unknown transaction is still rejected', function () {
    $response = callCompleteInvoice('INV-doesnotexist', ['status' => 'VALID']);
    expect(session('error'))->toBe('Invalid Invoice Transaction');
    expect($response->getTargetUrl())->toBe(route('home'));
});
