<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function destroy(Order $order)
    {
        DB::transaction(function () use ($order) {
            // The coupon's use was committed when payment landed. Deleting the
            // order must hand that use back, or a limited-use coupon stays
            // consumed by an order that no longer exists.
            if ($order->coupon_id && $order->coupon_applied) {
                $coupon = $order->coupon()->first();

                if ($coupon && $coupon->uses > 0) {
                    $coupon->decrement('uses');
                }
            }

            // The admin bell links straight to /admin/orders/{id}, so leaving
            // these behind would produce notifications that 404 when clicked.
            DB::table('notifications')->where('data->order_id', $order->id)->delete();

            // order_items go with it via the cascadeOnDelete foreign key.
            $order->delete();
        });

        return back()->with('success', 'Order deleted successfully.');
    }
}
