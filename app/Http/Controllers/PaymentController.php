<?php

namespace App\Http\Controllers;

use App\Mail\OrderInvoiceMail;
use App\Models\CustomInvoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\SslCommerzService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    public function __construct(
        protected SslCommerzService $sslCommerzService
    ) {}

    public function success(Request $request)
    {
        try {
            $tranId = $request->input('tran_id');

            // Source of truth: validate the transaction directly with SSLCommerz.
            $validation = $this->sslCommerzService->validateTransaction($request->input('val_id'));

            if (! $validation) {
                return redirect()->route('home')->with('error', 'Payment could not be verified.');
            }

            if (str_starts_with((string) $tranId, 'INV-')) {
                return $this->completeInvoice($tranId, $validation);
            }

            return $this->completeOrder($tranId, $validation);
        } catch (\Throwable $e) {
            Log::error('Payment Success Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->route('home')->with('error', 'Server Error during payment: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        }
    }

    private function completeOrder(?string $tranId, array $validation)
    {
        // Lock the order row so the browser callback and the IPN can never both
        // mark it paid — and so only one of them owns sending the invoice.
        $outcome = DB::transaction(function () use ($tranId, $validation) {
            $order = Order::with('items')->where('order_number', $tranId)->lockForUpdate()->first();

            if (! $order || $order->status !== 'pending') {
                // Unknown, or the other callback already completed it.
                return ['order' => $order, 'just_paid' => false];
            }

            if (! $this->orderAmountMatches($validation, $order)) {
                Log::warning('Payment amount/currency mismatch', [
                    'order' => $order->order_number,
                    'expected' => $order->total_amount,
                    'validation' => $validation,
                ]);
                throw new \RuntimeException('amount_mismatch');
            }

            $order->update([
                'status' => 'processing',
                'payment_status' => 'paid',
            ]);

            // Commit coupon usage exactly once, now that payment is confirmed.
            if ($order->coupon_id && ! $order->coupon_applied) {
                $order->coupon()->first()?->increment('uses');
                $order->update(['coupon_applied' => true]);
            }

            return ['order' => $order, 'just_paid' => true];
        });

        $order = $outcome['order'];

        if ($order && $order->payment_status === 'paid') {
            // SSLCommerz calls both success_url (browser) and ipn_url (server),
            // so this method runs twice per order. Only the call that actually
            // flipped it to paid sends the invoice; otherwise the customer gets
            // two identical emails with the same PDF.
            if ($outcome['just_paid']) {
                $this->sendOrderInvoice($order);
                $this->notifyAdmins(
                    'Order',
                    $order->order_number,
                    (float) $order->total_amount,
                    $order->currency ?: 'BDT',
                    $order->customer?->name ?? 'Guest',
                );
            }

            // Restore viewable session since cross-site POST drops the original session cookie
            $viewable = request()->session()->get('viewable_orders', []);
            if (!in_array($order->order_number, $viewable)) {
                $viewable[] = $order->order_number;
                request()->session()->put('viewable_orders', $viewable);
            }

            return redirect()->route('checkout.success', $order->order_number)->with('success', 'Payment Successful!');
        }

        return redirect()->route('home')->with('error', 'Invalid transaction.');
    }

    private function completeInvoice(?string $tranId, array $validation)
    {
        // Lock the payment row so the browser callback and the IPN can never
        // both mark it paid and double-increment amount_paid.
        $outcome = DB::transaction(function () use ($tranId, $validation) {
            $payment = \App\Models\CustomInvoicePayment::where('transaction_id', $tranId)->lockForUpdate()->first();

            if (! $payment) {
                return ['payment' => null, 'result' => 'not_found'];
            }

            // SSLCommerz calls both the browser success_url and the server IPN,
            // so this runs twice. If the other callback already settled it, treat
            // this as done — not an error the paying customer should ever see.
            if ($payment->status !== 'pending') {
                return ['payment' => $payment, 'result' => 'already_done'];
            }

            if (! $this->amountMatches($validation, $payment->amount, $payment->invoice->currency_code)) {
                Log::warning('Invoice payment amount mismatch', ['transaction_id' => $tranId, 'validation' => $validation]);

                return ['payment' => $payment, 'result' => 'mismatch'];
            }

            $payment->update(['status' => 'paid']);
            $invoice = $payment->invoice;
            $invoice->increment('amount_paid', $payment->amount);

            $status = $invoice->amount_paid >= $invoice->amount ? 'paid' : 'partially_paid';
            $invoice->update(['status' => $status]);

            return ['payment' => $payment, 'result' => 'paid'];
        });

        $payment = $outcome['payment'];

        if ($outcome['result'] === 'not_found' || ! $payment) {
            return redirect()->route('home')->with('error', 'Invalid Invoice Transaction');
        }

        if ($outcome['result'] === 'mismatch') {
            return redirect()->route('invoice.show', $payment->invoice->uuid)->with('error', 'Payment verification failed.');
        }

        // Only the callback that actually settled the payment sends mail; the
        // second (already_done) one just confirms success to the customer.
        if ($outcome['result'] === 'paid') {
            $invoice = $payment->invoice()->first();

            // The customer is emailed on every settlement — partial or full.
            $this->sendInvoiceReceipt($invoice, $payment);

            $this->notifyAdmins(
                'Custom Invoice',
                // Match the invoice number customers see (#ABCD1234), not the row id.
                '#' . strtoupper(explode('-', $invoice->uuid)[0]),
                (float) $payment->amount,
                $invoice->currency_code ?: 'BDT',
                $invoice->customer_name,
                $invoice->status === 'paid' ? 'Paid in full' : 'Partial payment',
            );
        }

        return redirect()->route('invoice.show', $payment->invoice->uuid)->with('success', 'Payment Successful!');
    }

    /**
     * SSLCommerz returns the settled amount in the store currency. Guard against
     * tampering by requiring the amount and currency to match what we stored.
     */
    /**
     * Verify an order payment. An order's total_amount is stored in the store's
     * DEFAULT currency, while the gateway was charged in the currency the
     * customer selected (session currency). SSLCommerz reports currency_amount
     * in that same processed currency, so we convert the order total into that
     * currency using the store's own rates and compare — this is correct whether
     * the customer paid in BDT or USD, and whatever the store's default is.
     */
    private function orderAmountMatches(array $validation, \App\Models\Order $order): bool
    {
        $parseAmount = function ($val) {
            if (is_string($val)) {
                $val = str_replace(',', '', $val);
            }
            return (float) $val;
        };

        $currencyAmount = $parseAmount($validation['currency_amount'] ?? $validation['amount'] ?? -1);
        $gatewayCurrency = $validation['currency_type'] ?? $validation['currency'] ?? 'BDT';

        $currencies = \App\Models\Currency::where('is_active', true)->get();
        $defaultRate = (float) ($currencies->firstWhere('is_default', true)->exchange_rate ?? 1);
        $gatewayRate = (float) ($currencies->firstWhere('code', $gatewayCurrency)->exchange_rate ?? $defaultRate);

        // total_amount (default currency) -> the gateway's processed currency.
        $expected = $defaultRate > 0
            ? ((float) $order->total_amount / $defaultRate) * $gatewayRate
            : (float) $order->total_amount;

        // Allow a small tolerance for gateway-side rounding.
        return abs($currencyAmount - $expected) <= max(2.0, $expected * 0.02);
    }

    private function amountMatches(array $validation, $expectedAmount, ?string $expectedCurrency): bool
    {
        $parseAmount = function($val) {
            if (is_string($val)) {
                $val = str_replace(',', '', $val);
            }
            return (float) $val;
        };

        $storeAmount = $parseAmount($validation['store_amount'] ?? -1);
        $currencyAmount = $parseAmount($validation['currency_amount'] ?? $validation['amount'] ?? -1);
        $currency = $validation['currency_type'] ?? $validation['currency'] ?? 'BDT';
        $expectedCurrency = $expectedCurrency ?: 'BDT';

        // 1. Direct match on the gateway's processed currency if it matches what we expected
        if ($currency === $expectedCurrency && abs($currencyAmount - (float) $expectedAmount) < 2.0) {
            return true;
        }

        // 2. If expected is BDT, check storeAmount (always BDT) directly
        if ($expectedCurrency === 'BDT' && abs($storeAmount - (float) $expectedAmount) < 2.0) {
            return true;
        }

        // 3. We need to do a conversion check
        $currencies = \App\Models\Currency::where('is_active', true)->get();
        $defaultCurrency = $currencies->where('is_default', true)->first();
        $defaultRate = $defaultCurrency ? (float) $defaultCurrency->exchange_rate : 1;

        // Convert expectedAmount to BDT
        $expectedAmountInBdt = (float) $expectedAmount;
        if ($expectedCurrency !== 'BDT') {
            $expCurr = $currencies->where('code', $expectedCurrency)->first();
            if ($expCurr && $expCurr->exchange_rate > 0) {
                // To get BDT from foreign, divide by its rate (since rate is foreign per BDT)
                $expectedAmountInBdt = ((float) $expectedAmount / $expCurr->exchange_rate) * $defaultRate;
            }
        }

        // Check against storeAmount (BDT)
        if (abs($storeAmount - $expectedAmountInBdt) < 2.0) {
            return true;
        }

        // Convert BDT to the gateway's processed currency
        if ($currency !== 'BDT') {
            $activeCurrency = $currencies->where('code', $currency)->first();
            if ($activeCurrency) {
                $activeRate = (float) $activeCurrency->exchange_rate;
                $expectedForeignAmount = round(($expectedAmountInBdt / $defaultRate) * $activeRate, 2);

                if (abs($currencyAmount - $expectedForeignAmount) < 0.5) {
                    return true;
                }
            }
        }

        return false;
    }

    public function fail(Request $request)
    {
        return $this->handleFailedCallback($request, 'failed', 'Payment Failed');
    }

    public function cancel(Request $request)
    {
        return $this->handleFailedCallback($request, 'cancelled', 'Payment Cancelled');
    }

    /**
     * Only a payload carrying SSLCommerz's signed hash may cancel an order and
     * release its stock — a forged POST with a known order number must not.
     */
    private function handleFailedCallback(Request $request, string $reason, string $message)
    {
        if (! $this->sslCommerzService->verifyHash($request->all())) {
            Log::warning('Unverified SSLCommerz fail/cancel callback ignored', ['tran_id' => $request->input('tran_id')]);

            return redirect()->route('cart.index')->with('error', $message);
        }

        return $this->releaseTransaction($request->input('tran_id'), $reason, $message);
    }

    private function releaseTransaction(?string $tranId, string $reason, string $message)
    {
        if (str_starts_with((string) $tranId, 'INV-')) {
            $payment = \App\Models\CustomInvoicePayment::where('transaction_id', $tranId)->first();
            if ($payment && $payment->status === 'pending') {
                $payment->update(['status' => $reason]);

                return redirect()->route('invoice.show', $payment->invoice->uuid)->with('error', $message);
            }

            return redirect()->route('home')->with('error', $message);
        }

        DB::transaction(function () use ($tranId, $reason) {
            $order = Order::with('items')->where('order_number', $tranId)->lockForUpdate()->first();

            // Only release stock for orders still holding a reservation.
            if ($order && $order->status === 'pending') {
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)->increment('stock', $item->quantity);
                    } else {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }

                $order->update([
                    'status' => 'cancelled',
                    'payment_status' => $reason === 'failed' ? 'failed' : 'cancelled',
                ]);
            }
        });

        return redirect()->route('cart.index')->with('error', $message);
    }

    public function ipn(Request $request)
    {
        // Server-to-server callback: verify the signed hash before trusting it.
        if (! $this->sslCommerzService->verifyHash($request->all())) {
            Log::warning('SSLCommerz IPN failed hash verification', ['tran_id' => $request->input('tran_id')]);

            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $tranId = $request->input('tran_id');
        $validation = $this->sslCommerzService->validateTransaction($request->input('val_id'));

        if (! $validation) {
            return response()->json(['message' => 'Validation failed'], 400);
        }

        if (str_starts_with((string) $tranId, 'INV-')) {
            $this->completeInvoice($tranId, $validation);
        } else {
            $this->completeOrder($tranId, $validation);
        }

        return response()->json(['message' => 'IPN Processed']);
    }

    private function sendOrderInvoice(Order $order): void
    {
        try {
            $order->loadMissing('customer');
            $pdfPath = $this->renderPdf('pdf.invoice', ['order' => $order], 'invoice_' . $order->order_number . '.pdf');

            if ($order->customer) {
                Mail::to($order->customer->email)->send(new OrderInvoiceMail($order, $pdfPath));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send order invoice: ' . $e->getMessage());
        }
    }

    private function sendInvoiceReceipt(CustomInvoice $invoice, ?\App\Models\CustomInvoicePayment $payment = null): void
    {
        try {
            $pdfPath = $this->renderPdf('pdf.custom_invoice', ['invoice' => $invoice], 'custom_invoice_' . $invoice->uuid . '.pdf');

            $paidNow = $payment ? (float) $payment->amount : (float) $invoice->amount;
            $isFullyPaid = $invoice->status === 'paid';
            $subject = $isFullyPaid ? 'Payment Received — Invoice Paid in Full' : 'Partial Payment Received';

            Mail::send('emails.custom_invoice', [
                'invoice' => $invoice,
                'paidNow' => $paidNow,
                'isFullyPaid' => $isFullyPaid,
            ], function ($m) use ($invoice, $pdfPath, $subject) {
                $m->to($invoice->customer_email)->subject($subject);
                $m->attach($pdfPath);
            });
        } catch (\Throwable $e) {
            Log::error('Failed to send invoice receipt: ' . $e->getMessage());
        }
    }

    /**
     * Copy every configured admin address on any completed payment, whether it
     * came from a storefront order or a custom invoice, partial or full.
     */
    private function notifyAdmins(string $type, string $reference, float $amount, string $currency, string $customerName, string $note = ''): void
    {
        $recipients = \App\Models\Setting::adminNotificationEmails();

        if (empty($recipients)) {
            return;
        }

        try {
            Mail::send('emails.admin_payment_notification', [
                'type' => $type,
                'reference' => $reference,
                'amount' => $amount,
                'currency' => $currency,
                'customerName' => $customerName,
                'note' => $note,
            ], function ($m) use ($recipients, $type) {
                $m->to($recipients)->subject('New Payment Received — ' . $type);
            });
        } catch (\Throwable $e) {
            Log::error('Failed to send admin payment notification: ' . $e->getMessage());
        }
    }

    private function renderPdf(string $view, array $data, string $fileName): string
    {
        $dir = storage_path('app/public/invoices');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $path = $dir . '/' . $fileName;
        Pdf::loadView($view, $data)->save($path);

        return $path;
    }
}
