<?php

use App\Models\CustomInvoice;
use App\Models\CustomInvoicePayment;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

use function Pest\Laravel\post;

beforeEach(function () {
    Setting::set('payment_settings', [
        'store_id' => 'test_store',
        'store_password' => 'test_pass',
        'is_sandbox' => true,
    ]);
    // Any successful gateway init returns a redirect URL.
    Http::fake([
        '*sslcommerz.com*' => Http::response(['status' => 'SUCCESS', 'GatewayPageURL' => 'https://gateway.test/pay'], 200),
    ]);
});

function makeInvoice(array $attrs = []): CustomInvoice
{
    return CustomInvoice::create(array_merge([
        'uuid' => (string) Str::uuid(),
        'customer_name' => 'Buyer',
        'customer_email' => 'buyer@example.com',
        'customer_phone' => '+8801712345678',
        'subtotal' => 195.14,
        'amount' => 195.14,
        'amount_paid' => 0,
        'status' => 'pending',
    ], $attrs));
}

test('with no Payable Now set, the full due is payable', function () {
    $invoice = makeInvoice(['payable_amount' => null]);

    // Customer may choose their own amount up to the full due.
    expect($invoice->effective_payable_amount)->toBe(195.14);
});

test('with no Payable Now set, a customer can pay a custom partial amount', function () {
    $invoice = makeInvoice(['payable_amount' => null]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 100]);

    // The partial amount the customer typed is what gets charged.
    $payment = CustomInvoicePayment::where('custom_invoice_id', $invoice->id)->first();
    expect($payment)->not->toBeNull();
    expect((float) $payment->amount)->toBe(100.0);
});

test('a customer cannot pay more than the due amount', function () {
    $invoice = makeInvoice(['payable_amount' => null]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 300])
        ->assertSessionHas('error', 'Invalid payment amount.');

    expect(CustomInvoicePayment::where('custom_invoice_id', $invoice->id)->count())->toBe(0);
});

test('with Payable Now set, the effective amount is that fixed figure', function () {
    $invoice = makeInvoice(['payable_amount' => 50]);

    expect($invoice->effective_payable_amount)->toBe(50.0);
});

test('with Payable Now set, paying above the fixed figure is rejected', function () {
    $invoice = makeInvoice(['payable_amount' => 50]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 100])
        ->assertSessionHas('error', 'Invalid payment amount.');

    expect(CustomInvoicePayment::where('custom_invoice_id', $invoice->id)->count())->toBe(0);
});
