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
     * Legacy invoices predate the currency columns and carry rate 1 (or null),
     * so COALESCE/NULLIF keeps them at face value instead of dividing by zero.
     */
    private const INVOICE_REVENUE_IN_DEFAULT_CURRENCY =
        'COALESCE(SUM(amount / COALESCE(NULLIF(exchange_rate, 0), 1)), 0) AS total';

    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $ordersQuery = Order::query()->where('payment_status', 'paid');
        $invoicesQuery = CustomInvoice::query()->where('status', 'paid');

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            
            $ordersQuery->whereBetween('created_at', [$start, $end]);
            $invoicesQuery->whereBetween('created_at', [$start, $end]);
        }

        $totalOrderRevenue = (float) $ordersQuery->sum('total_amount');

        // Orders are always stored in the default currency, but a custom invoice
        // keeps its own currency and the rate it was issued at. Summing amount
        // raw would add "1" for a $1 invoice instead of its ~123 BDT, so divide
        // each one back to the default currency before adding the two together.
        $totalInvoiceRevenue = (float) $invoicesQuery->clone()
            ->selectRaw(self::INVOICE_REVENUE_IN_DEFAULT_CURRENCY)
            ->value('total');

        $totalRevenue = $totalOrderRevenue + $totalInvoiceRevenue;

        $totalOrdersCount = $ordersQuery->count();
        $totalInvoicesCount = $invoicesQuery->count();

        // Get recent transactions (combine latest 5 from both)
        $recentOrders = Order::with('customer')->where('payment_status', 'paid')->latest()->take(5)->get()->map(function($order) {
            return [
                'id' => $order->id,
                'identifier' => $order->order_number,
                'type' => 'Order',
                'customer' => $order->customer?->name ?? 'Guest',
                'amount' => $order->total_amount,
                'date' => $order->created_at->toISOString(),
            ];
        });

        $recentInvoices = CustomInvoice::where('status', 'paid')->latest()->take(5)->get()->map(function($invoice) {
            return [
                'id' => $invoice->id,
                'identifier' => '#' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT),
                'type' => 'Custom Invoice',
                'customer' => $invoice->customer_name,
                // Normalised like the totals above, so this list never mixes a
                // raw USD figure in beside BDT order amounts.
                'amount' => round((float) $invoice->amount / (((float) $invoice->exchange_rate) ?: 1), 2),
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
