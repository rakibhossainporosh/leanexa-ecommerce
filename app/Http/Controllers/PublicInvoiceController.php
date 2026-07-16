<?php

namespace App\Http\Controllers;

use App\Models\CustomInvoice;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\Currency;

class PublicInvoiceController extends Controller
{
    public function show($uuid)
    {
        $invoice = CustomInvoice::with('items')->where('uuid', $uuid)->firstOrFail();

        $invoice->append('due_amount', 'effective_payable_amount');

        $currencySymbol = '৳';
        if ($invoice->currency_code) {
            $currency = Currency::where('code', $invoice->currency_code)->first();
            if ($currency) {
                $currencySymbol = $currency->symbol;
            }
        }

        return Inertia::render('invoice/show', [
            'invoice' => $invoice,
            'currencySymbol' => $currencySymbol,
        ]);
    }

    public function pay(Request $request, $uuid, SslCommerzService $sslCommerzService)
    {
        $invoice = CustomInvoice::where('uuid', $uuid)->firstOrFail();

        if ($invoice->status === 'paid') {
            return redirect()->back()->with('error', 'This invoice is already paid.');
        }

        $request->validate([
            'payment_amount' => 'nullable|numeric|min:0.01',
        ]);

        $effective = (float) $invoice->effective_payable_amount;

        // The customer may only choose their own amount when the admin allowed a
        // partial payment and did not pin a fixed figure. In every other case the
        // amount is locked server-side, so a tampered request can't underpay.
        $customerMayChoose = $invoice->allow_partial && ! ($invoice->payable_amount > 0);

        if ($customerMayChoose) {
            $paymentAmount = (float) $request->input('payment_amount', $effective);
            if ($paymentAmount <= 0 || $paymentAmount > $effective + 1) { // +1 for floating point rounding
                return redirect()->back()->with('error', 'Invalid payment amount.');
            }
        } else {
            $paymentAmount = $effective;
        }

        // Create a transaction record for this specific payment attempt
        $payment = \App\Models\CustomInvoicePayment::create([
            'custom_invoice_id' => $invoice->id,
            'transaction_id' => 'INV-' . uniqid(),
            'amount' => $paymentAmount,
            'status' => 'pending'
        ]);

        $customerData = [
            'name' => $invoice->customer_name,
            'email' => $invoice->customer_email,
            'phone' => $invoice->customer_phone ?: '01700000000',
        ];

        try {
            $paymentUrl = $sslCommerzService->initiateInvoicePayment($payment, $invoice, $customerData);
            return Inertia::location($paymentUrl);
        } catch (\Exception $e) {
            Log::error('Invoice Payment Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Could not initiate payment. Please try again.');
        }
    }
}
