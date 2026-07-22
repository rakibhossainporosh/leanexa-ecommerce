<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\CustomInvoice;
use Carbon\Carbon;

class SalesReportController extends Controller
{
    /**
     * Revenue = money actually received (amount_paid), so partially-paid invoices
     * count for the part that was paid. Legacy invoices predate the currency
     * columns and carry rate 1 (or null), so COALESCE/NULLIF keeps them at face
     * value instead of dividing by zero.
     */
    private const INVOICE_REVENUE_IN_DEFAULT_CURRENCY =
        'COALESCE(SUM(amount_paid / COALESCE(NULLIF(exchange_rate, 0), 1)), 0) AS total';

    public function index(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;

        // Shared date range applied to every query so the summary cards and the
        // recent-transactions list always reflect the same period.
        $range = ($startDate && $endDate)
            ? [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]
            : null;
        $withRange = function ($query) use ($range) {
            if ($range) {
                $query->whereBetween('created_at', $range);
            }
            return $query;
        };

        // Orders are always stored in the default currency.
        $totalOrderRevenue = (float) $withRange(Order::where('payment_status', 'paid'))->sum('total_amount');
        $totalOrdersCount = (int) $withRange(Order::where('payment_status', 'paid'))->count();

        // A custom invoice keeps its own currency and the rate it was issued at,
        // so divide amount_paid back to the default currency before adding.
        // Both fully- and partially-paid invoices contribute the money received.
        $totalInvoiceRevenue = (float) $withRange(CustomInvoice::whereIn('status', ['paid', 'partially_paid']))
            ->selectRaw(self::INVOICE_REVENUE_IN_DEFAULT_CURRENCY)
            ->value('total');

        // "Paid Invoices" card counts fully-paid invoices, matching its label.
        $totalInvoicesCount = (int) $withRange(CustomInvoice::where('status', 'paid'))->count();

        $totalRevenue = $totalOrderRevenue + $totalInvoiceRevenue;

        // Recent transactions — same date range as the summary above.
        $recentOrders = $withRange(Order::with('customer')->where('payment_status', 'paid'))
            ->latest()->take(5)->get()->map(function($order) {
                return [
                    'id' => $order->id,
                    'identifier' => $order->order_number,
                    'type' => 'Order',
                    'customer' => $order->customer?->name ?? 'Guest',
                    'amount' => $order->total_amount,
                    'date' => $order->created_at->toISOString(),
                ];
            });

        $recentInvoices = $withRange(CustomInvoice::whereIn('status', ['paid', 'partially_paid']))
            ->latest()->take(5)->get()->map(function($invoice) {
                return [
                    'id' => $invoice->id,
                    'identifier' => '#' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'Custom Invoice',
                    'customer' => $invoice->customer_name,
                    // Money received, normalised to the default currency so this
                    // list never mixes a raw USD figure beside BDT order amounts.
                    'amount' => round((float) $invoice->amount_paid / (((float) $invoice->exchange_rate) ?: 1), 2),
                    'date' => $invoice->created_at->toISOString(),
                ];
            });

        // Combine and sort by date descending, take top 10
        $recentTransactions = collect($recentOrders)->concat($recentInvoices)->sortByDesc('date')->take(10)->values();

        return Inertia::render('admin/sales-report/index', [
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrdersCount,
                'total_invoices' => $totalInvoicesCount,
            ],
            'recent_transactions' => $recentTransactions,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
