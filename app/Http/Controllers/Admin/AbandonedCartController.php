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
        $cart->delete();
        return redirect()->back()->with('success', 'Cart removed successfully.');
    }

    public function sendEmail(Request $request, Cart $cart)
    {
        $settings = Setting::general();
        $email = $cart->customer ? $cart->customer->email : $cart->guest_email;

        if (!$email) {
            return redirect()->back()->with('error', 'No email address associated with this cart.');
        }

        $discountType = $settings['abandoned_cart_discount_type'] ?? 'none';
        $discountValue = (float) ($settings['abandoned_cart_discount_value'] ?? 0);
        
        $discountMessage = null;
        if ($discountType === 'percentage' && $discountValue > 0) {
            $discountMessage = "Use this code at checkout to get {$discountValue}% off your order!";
        } elseif ($discountType === 'fixed' && $discountValue > 0) {
            $discountMessage = "Use this code at checkout to get ৳{$discountValue} off your order!";
        }

        try {
            \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\AbandonedCartReminder($cart, $settings, $discountMessage));
            $cart->update(['abandoned_email_sent_at' => now()]);
            return redirect()->back()->with('success', 'Reminder email sent successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }
}
