<?php

use App\Models\CustomInvoice;
use App\Models\CustomInvoicePayment;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

use function Pest\Laravel\post;

beforeEach(function () {
    Setting::set('payment_settings', ['store_id' => 's', 'store_password' => 'p', 'is_sandbox' => true]);
    Http::fake(['*sslcommerz.com*' => Http::response(['status' => 'SUCCESS', 'GatewayPageURL' => 'https://gw.test/pay'], 200)]);
});

function invoiceMode(array $attrs = []): CustomInvoice
{
    return CustomInvoice::create(array_merge([
        'uuid' => (string) Str::uuid(),
        'customer_name' => 'Buyer', 'customer_email' => 'b@example.com', 'customer_phone' => '+8801712345678',
        'subtotal' => 1000, 'amount' => 1000, 'amount_paid' => 0, 'status' => 'pending',
    ], $attrs));
}

function paidAmount(CustomInvoice $invoice): ?float
{
    $p = CustomInvoicePayment::where('custom_invoice_id', $invoice->id)->first();

    return $p ? (float) $p->amount : null;
}

// MODE 1: Full Amount — customer must pay the full due, even if they send less.
test('full amount mode charges the full due regardless of the posted amount', function () {
    $invoice = invoiceMode(['allow_partial' => false, 'payable_amount' => null]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 100]); // tampered lower amount

    expect(paidAmount($invoice))->toBe(1000.0); // locked to full, ignores the 100
});

// MODE 2: Partial, no fixed figure — customer chooses any part of the due.
test('open partial mode lets the customer pay their chosen amount', function () {
    $invoice = invoiceMode(['allow_partial' => true, 'payable_amount' => null]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 300]);

    expect(paidAmount($invoice))->toBe(300.0);
});

test('open partial mode still rejects paying more than the due', function () {
    $invoice = invoiceMode(['allow_partial' => true, 'payable_amount' => null]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 5000])
        ->assertSessionHas('error', 'Invalid payment amount.');

    expect(paidAmount($invoice))->toBeNull();
});

// MODE 3: Partial with a fixed figure — customer must pay exactly that.
test('fixed partial mode charges the fixed figure regardless of the posted amount', function () {
    $invoice = invoiceMode(['allow_partial' => true, 'payable_amount' => 400]);

    post("/invoice/{$invoice->uuid}/pay", ['payment_amount' => 50]); // tampered lower amount

    expect(paidAmount($invoice))->toBe(400.0); // locked to the fixed 400
});

test('existing invoices default to full-amount mode after the migration', function () {
    // allow_partial defaults to false, so old invoices behave as "pay full".
    $invoice = invoiceMode();
    expect($invoice->fresh()->allow_partial)->toBeFalse();
});
