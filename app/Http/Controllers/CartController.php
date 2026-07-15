<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CartService;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService
    ) {}

    public function index()
    {
        $cart = $this->cartService->getCart();
        $appliedCoupon = session('applied_coupon');
        return Inertia::render('cart/index', [
            'cart' => $cart->load(['items.product.images', 'items.colorVariant', 'items.sizeVariant']),
            'appliedCoupon' => $appliedCoupon
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'color_variant_id' => 'nullable|exists:product_variants,id',
            'size_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'integer|min:1'
        ]);

        try {
            $this->cartService->addToCart($validated['product_id'], $validated['quantity'] ?? 1, $validated['color_variant_id'] ?? null, $validated['size_variant_id'] ?? null);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Added to cart');
    }

    public function updateQuantity(Request $request, $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0'
        ]);

        try {
            $this->cartService->updateQuantity($itemId, $validated['quantity']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back();
    }

    public function remove($itemId)
    {
        $this->cartService->removeItem($itemId);

        return redirect()->back()->with('success', 'Item removed');
    }

    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $coupon = \App\Models\Coupon::where('code', strtoupper(trim($request->code)))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return redirect()->back()->with('error', 'Invalid or inactive coupon code.');
        }

        if ($coupon->valid_from && now()->lt($coupon->valid_from)) {
            return redirect()->back()->with('error', 'This coupon is not valid yet.');
        }

        if ($coupon->valid_until && now()->gt($coupon->valid_until)) {
            return redirect()->back()->with('error', 'This coupon has expired.');
        }

        if ($coupon->max_uses && $coupon->uses >= $coupon->max_uses) {
            return redirect()->back()->with('error', 'This coupon has reached its usage limit.');
        }

        $cart = $this->cartService->getCart();
        $totalAmount = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        if ($coupon->min_cart_amount && $totalAmount < $coupon->min_cart_amount) {
            return redirect()->back()->with('error', 'Minimum cart amount of $' . $coupon->min_cart_amount . ' is required to use this coupon.');
        }

        session(['applied_coupon' => $coupon]);

        return redirect()->back()->with('success', 'Coupon applied successfully!');
    }

    public function removeCoupon()
    {
        session()->forget('applied_coupon');
        return redirect()->back()->with('success', 'Coupon removed.');
    }

    public function syncGuest(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:255',
        ]);

        $cart = $this->cartService->getCart();
        $cart->update($validated);

        return response()->json(['success' => true]);
    }
}
