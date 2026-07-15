<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class TrackOrderController extends Controller
{
    public function index(Request $request)
    {
        $order = null;
        $error = null;

        if ($request->has('order_number')) {
            $orderNumber = trim($request->input('order_number'));
            
            // Remove the '#' if the user typed it
            if (str_starts_with($orderNumber, '#')) {
                $orderNumber = substr($orderNumber, 1);
            }

            $order = Order::with('items.product')->where('order_number', $orderNumber)->first();

            if (!$order) {
                $error = 'We could not find an order with that order number. Please try again.';
            } else {
                $order = [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at,
                    'total_amount' => $order->total_amount,
                ];
            }
        }

        return Inertia::render('track-order', [
            'order' => $order,
            'error' => $error,
            'searched' => $request->has('order_number')
        ]);
    }
}
