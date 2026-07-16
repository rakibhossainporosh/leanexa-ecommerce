<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected CheckoutService $checkoutService,
        protected SslCommerzService $sslCommerzService
    ) {}

    public function index()
    {
        $cart = $this->cartService->getCart();

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $appliedCoupon = session('applied_coupon');
        $settings = Setting::general();

        return Inertia::render('checkout/index', [
            'cart' => $cart->load('items.product.images'),
            'appliedCoupon' => $appliedCoupon,
            'shipping' => [
                'inside_dhaka' => (float) ($settings['delivery_inside_dhaka'] ?? 0),
                'outside_dhaka' => (float) ($settings['delivery_outside_dhaka'] ?? 0),
                'usa' => (float) ($settings['delivery_usa'] ?? 0),
            ],
            'taxRate' => (float) ($settings['tax_rate'] ?? 0),
        ]);
    }

    public function process(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'shipping_address' => 'required|string|max:1000',
            'billing_address' => 'nullable|string|max:1000',
            'country' => 'required|in:BD,US',
            'delivery_area' => 'nullable|in:inside_dhaka,outside_dhaka',
            'notes' => 'nullable|string|max:2000',
        ]);

        // Order creation and payment initiation fail differently: a failed
        // checkout has no order to show, a failed gateway call still does.
        try {
            ['order' => $order, 'user_created' => $userCreated] = $this->checkoutService->processCheckout($validated);
        } catch (\Throwable $e) {
            return redirect()->route('cart.index')->with('error', $e->getMessage());
        }

        // Log in newly created shell accounts only. An order placed against
        // a pre-existing email must not grant a session for that account.
        if ($userCreated && ! Auth::check()) {
            Auth::login($order->customer);
        }

        // Allow the order's confirmation page to be viewed after redirect
        // back from the gateway, even for guests who stay unauthenticated.
        $viewable = $request->session()->get('viewable_orders', []);
        $viewable[] = $order->order_number;
        $request->session()->put('viewable_orders', $viewable);

        try {
            $gatewayUrl = $this->sslCommerzService->initiatePayment($order, $validated);

            return Inertia::location($gatewayUrl);
        } catch (\Throwable $e) {
            return redirect()->route('checkout.success', $order->order_number)->with('warning', 'Order placed, but payment could not be initiated. You can retry the payment from the order page.');
        }
    }

    public function retryPayment(Request $request, $orderNumber)
    {
        // The order number is a 12-char random token (ORD-XXXXXXXXXXXX), so
        // possessing it — from the confirmation email — is the authorisation.
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        if ($order->payment_status === 'paid') {
            return redirect()->back()->with('info', 'This order is already paid.');
        }

        // A cancelled/failed order has already released its stock reservation;
        // paying it now would take money for items that may no longer exist.
        if ($order->status !== 'pending') {
            return redirect()->back()->with('error', 'This order can no longer be paid. Please place a new order.');
        }

        try {
            $customerData = [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'phone' => $order->shipping_address, // Simplification
            ];

            $gatewayUrl = $this->sslCommerzService->initiatePayment($order, $customerData);
            return Inertia::location($gatewayUrl);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Payment gateway error: ' . $e->getMessage());
        }
    }

    public function success(Request $request, $orderNumber)
    {
        // Viewable by anyone holding the order number — the 12-char random token
        // is the credential, so guests and email recipients (no login, no
        // checkout session) can open their own order confirmation.
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        return Inertia::render('checkout/success', [
            'order' => $order,
        ]);
    }
}
