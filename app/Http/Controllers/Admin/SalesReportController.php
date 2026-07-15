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

        $totalOrderRevenue = $ordersQuery->sum('total_amount');
        $totalInvoiceRevenue = $invoicesQuery->sum('amount');
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
                'amount' => $invoice->amount,
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
