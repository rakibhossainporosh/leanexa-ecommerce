<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return inertia('admin/orders/index');
    }

    /**
     * Server-side DataTables feed (yajra/laravel-datatables): handles
     * search, ordering and pagination for the orders table.
     */
    public function data(Request $request)
    {
        $query = Order::query()->with('customer:id,name,email');

        return \Yajra\DataTables\Facades\DataTables::eloquent($query)
            ->filterColumn('customer.name', function ($q, $keyword) {
                $q->whereHas('customer', fn ($c) => $c->where('name', 'like', "%{$keyword}%"));
            })
            ->filterColumn('customer.email', function ($q, $keyword) {
                $q->whereHas('customer', fn ($c) => $c->where('email', 'like', "%{$keyword}%"));
            })
            ->orderColumn('customer.name', function ($q, $order) {
                $q->orderBy(
                    \App\Models\Customer::select('name')->whereColumn('customers.id', 'orders.customer_id'),
                    $order
                );
            })
            ->toJson();
    }

    public function show(Order $order)
    {
        $order->load(['customer', 'items.product.images', 'items.colorVariant', 'items.sizeVariant']);

        return inertia('admin/orders/show', [
            'order' => $order
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,completed,cancelled',
            'payment_status' => 'required|string|in:unpaid,paid,failed,cancelled',
        ]);

        $order->update($validated);

        return back()->with('success', 'Order status updated successfully');
    }

    public function invoice(Order $order)
    {
        $order->loadMissing(['customer', 'items.product', 'items.colorVariant', 'items.sizeVariant']);

        return Pdf::loadView('pdf.invoice', ['order' => $order])
            ->stream('invoice_' . $order->order_number . '.pdf');
    }
}
