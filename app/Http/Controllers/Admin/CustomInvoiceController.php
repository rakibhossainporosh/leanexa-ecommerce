<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomInvoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Currency;

class CustomInvoiceController extends Controller
{
    public function index()
    {
        $invoices = CustomInvoice::with('items')->latest()->paginate(15);
        $currencies = Currency::where('is_active', true)->get();

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Product autocomplete for building invoice line items.
     */
    public function searchProducts(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        $products = Product::query()
            ->when($query !== '', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'price', 'discount_price']);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $this->validateInvoice($request);

        DB::transaction(function () use ($validated) {
            [$invoiceData, $lineItems] = $this->buildInvoiceData($validated);

            $invoice = CustomInvoice::create($invoiceData + ['status' => 'pending']);
            $invoice->items()->createMany($lineItems);
        });

        return redirect()->back()->with('success', 'Custom Invoice generated successfully.');
    }

    public function update(Request $request, $id)
    {
        $invoice = CustomInvoice::findOrFail($id);

        if ($invoice->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending invoices can be edited.');
        }

        $validated = $this->validateInvoice($request);

        DB::transaction(function () use ($validated, $invoice) {
            [$invoiceData, $lineItems] = $this->buildInvoiceData($validated);

            $invoice->update($invoiceData);
            $invoice->items()->delete();
            $invoice->items()->createMany($lineItems);
        });

        return redirect()->back()->with('success', 'Custom Invoice updated successfully.');
    }

    private function validateInvoice(Request $request): array
    {
        return $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => [
                'required',
                'string',
                'max:30',
                // Digits only, optionally led by "+" and grouped with spaces, dashes or brackets.
                'regex:/^\+?[0-9][0-9\s\-()]*$/',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $digits = preg_replace('/\D/', '', (string) $value);
                    if (strlen($digits) < 7 || strlen($digits) > 15) {
                        $fail('The phone number must contain between 7 and 15 digits.');
                    }
                },
            ],
            'customer_address' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:2000',
            'payable_amount' => 'nullable|numeric|min:0',
            'allow_partial' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'currency_code' => 'nullable|string|max:10',
            'exchange_rate' => 'nullable|numeric|min:0',
        ], [
            'customer_phone.required' => 'A phone number is required to generate the invoice payment link.',
            'customer_phone.regex' => 'The phone number may only contain digits, and the symbols + - ( ).',
        ]);
    }

    /**
     * Compute invoice totals + line items from validated input.
     *
     * @return array{0: array, 1: array}
     */
    private function buildInvoiceData(array $validated): array
    {
        $subtotal = 0;
        $totalDiscount = 0;
        $lineItems = [];

        foreach ($validated['items'] as $item) {
            $lineGross = round($item['price'] * $item['quantity'], 2);
            $lineDiscount = round((float) ($item['discount'] ?? 0), 2);
            // Never let a discount exceed the line's gross value.
            $lineDiscount = min($lineDiscount, $lineGross);
            $lineTotal = round($lineGross - $lineDiscount, 2);

            $subtotal += $lineGross;
            $totalDiscount += $lineDiscount;

            $lineItems[] = [
                'product_id' => $item['product_id'] ?? null,
                'name' => $item['name'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'discount' => $lineDiscount,
                'total' => $lineTotal,
            ];
        }

        $amount = round($subtotal - $totalDiscount, 2);

        $descriptionSummary = collect($lineItems)
            ->map(fn ($i) => $i['quantity'] . 'x ' . $i['name'])
            ->join(', ');

        $invoiceData = [
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'note' => $validated['note'] ?? null,
            'description' => Str::limit($descriptionSummary, 250),
            'subtotal' => $subtotal,
            'discount' => $totalDiscount,
            'amount' => $amount,
            'payable_amount' => isset($validated['payable_amount']) && $validated['payable_amount'] !== '' ? round((float) $validated['payable_amount'], 2) : null,
            'allow_partial' => (bool) ($validated['allow_partial'] ?? false),
            'currency_code' => $validated['currency_code'] ?? null,
            'exchange_rate' => isset($validated['exchange_rate']) ? (float) $validated['exchange_rate'] : 1,
        ];

        return [$invoiceData, $lineItems];
    }

    public function destroy($id)
    {
        $invoice = CustomInvoice::findOrFail($id);
        $invoice->delete();

        return redirect()->back()->with('success', 'Custom Invoice deleted successfully.');
    }

    public function pdf(CustomInvoice $invoice)
    {
        return Pdf::loadView('pdf.custom_invoice', ['invoice' => $invoice])
            ->stream('custom_invoice_' . $invoice->uuid . '.pdf');
    }
}
