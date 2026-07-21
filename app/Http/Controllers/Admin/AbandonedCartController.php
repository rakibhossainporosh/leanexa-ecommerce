<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AbandonedCartController extends Controller
{
    public function index()
    {
        $settings = Setting::general();
        $timeoutHours = (int) ($settings['abandoned_cart_timeout_hours'] ?? 24);

        // Fetch carts that have items, updated before the timeout, and have either a customer or guest email
        $carts = Cart::with(['items.product', 'customer'])
            ->whereHas('items')
            ->where('updated_at', '<', now()->subHours($timeoutHours))
            ->where(function ($query) {
                $query->whereNotNull('customer_id')
                      ->orWhereNotNull('guest_email');
            })
            ->latest('updated_at')
            ->paginate(15);

        return Inertia::render('admin/abandoned-carts/index', [
            'carts' => $carts,
            'settings' => $settings,
        ]);
    }

    public function destroy(Cart $cart)
    {
        // Remove the cart's items first so the delete never trips a foreign-key
        // constraint on cart_items.
        $cart->items()->delete();
        $cart->delete();

        return redirect()->back()->with('success', 'Cart removed successfully.');
    }
}
