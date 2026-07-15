<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Customer account overview.
     */
    public function index()
    {
        $customer = auth()->user();

        return Inertia::render('account/index', [
            'stats' => [
                'orders' => Order::where('customer_id', $customer->id)->count(),
                'wishlist' => $customer->wishlistedProducts()->count(),
            ],
            'recentOrders' => Order::where('customer_id', $customer->id)->latest()->take(3)->get(),
        ]);
    }

    /**
     * Customer order history.
     */
    public function orders()
    {
        $customer = auth()->user();

        return Inertia::render('account/orders', [
            'orders' => Order::where('customer_id', $customer->id)->latest()->get(),
        ]);
    }

    /**
     * Custom Customer Logout.
     */
    public function logout(\Illuminate\Http\Request $request)
    {
        \Illuminate\Support\Facades\Auth::guard('web')->logout();

        if (!\Illuminate\Support\Facades\Auth::guard('admin')->check()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect('/');
    }
}
