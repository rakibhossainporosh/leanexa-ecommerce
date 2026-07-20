<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CheckoutService
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * @return array{order: Order, user_created: bool}
     */
    public function processCheckout(array $data): array
    {
        $result = DB::transaction(function () use ($data) {
            $cart = $this->cartService->getCart();

            if ($cart->items->isEmpty()) {
                throw new \Exception('Cart is empty.');
            }

            // Resolve the customer. Guests get a shell account, but we never
            // authenticate an *existing* account off an unverified email.
            $userCreated = false;
            $customer = auth()->user();
            if (! $customer) {
                $customer = Customer::where('email', $data['email'])->first();
                if (! $customer) {
                    $generatedPassword = Str::random(12); // Slightly shorter, more manageable password
                    $customer = Customer::create([
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'password' => Hash::make($generatedPassword),
                    ]);
                    $userCreated = true;

                    try {
                        \Illuminate\Support\Facades\Mail::to($customer->email)->send(new \App\Mail\NewAccountMail($customer, $generatedPassword));
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Failed to send new account email: ' . $e->getMessage());
                    }
                }
            }

            // Recompute the subtotal server-side from live product prices so a
            // stale or tampered cart price can never set the amount charged.
            $subtotal = 0.0;
            foreach ($cart->items as $item) {
                $subtotal += $this->currentUnitPrice($item) * $item->quantity;
            }
            $subtotal = round($subtotal, 2);

            // Coupon: re-validate everything at order time, not just is_active.
            [$coupon, $discountAmount] = $this->resolveCoupon($subtotal);

            $settings = Setting::general();
            $shippingAmount = $this->shippingAmount($data, $settings);
            $taxableBase = max(0, $subtotal - $discountAmount);
            $taxRate = (float) ($settings['tax_rate'] ?? 0);
            $taxAmount = round($taxableBase * ($taxRate / 100), 2);

            $totalAmount = round($taxableBase + $shippingAmount + $taxAmount, 2);

            $order = Order::create([
                'customer_id' => $customer->id,
                'order_number' => (strtoupper($settings['order_prefix'] ?? 'ORD') ?: 'ORD') . '-' . strtoupper(Str::random(12)),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_amount' => $shippingAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'coupon_id' => $coupon?->id,
                'coupon_applied' => false,
                'currency' => 'BDT',
                'shipping_address' => ($data['shipping_address'] ?? '') . match ($data['country']) {
                    'US' => ', USA',
                    'OTHER' => ', International',
                    default => ', Bangladesh',
                },
                'billing_address' => $data['billing_address'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                $variantNames = [];
                if ($item->colorVariant) $variantNames[] = $item->colorVariant->name;
                if ($item->sizeVariant) $variantNames[] = $item->sizeVariant->name;
                $variantSuffix = empty($variantNames) ? '' : ' (' . implode(', ', $variantNames) . ')';

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'color_variant_id' => $item->color_variant_id,
                    'size_variant_id' => $item->size_variant_id,
                    'product_name' => $item->product->name . $variantSuffix,
                    'price' => $this->currentUnitPrice($item),
                    'quantity' => $item->quantity,
                ]);

                $this->reserveStock($item->color_variant_id, $item->size_variant_id, $item->product_id, $item->quantity, $item->product->name);
            }

            $this->cartService->clearCart();
            session()->forget('applied_coupon');

            return ['order' => $order, 'user_created' => $userCreated];
        });

        // Alert every admin about the new order; a notification failure
        // must never block an already-placed order.
        try {
            \Illuminate\Support\Facades\Notification::send(
                \App\Models\User::all(),
                new \App\Notifications\NewOrderPlaced($result['order']->loadMissing('customer'))
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send new order notification: ' . $e->getMessage());
        }

        return $result;
    }

    private function currentUnitPrice($item): float
    {
        if ($item->size_variant_id && $item->sizeVariant && $item->sizeVariant->price !== null) {
            return (float) $item->sizeVariant->price;
        }

        return $item->product->effectivePrice();
    }

    /**
     * @return array{0: ?Coupon, 1: float}
     */
    private function resolveCoupon(float $subtotal): array
    {
        $applied = session('applied_coupon');
        if (! $applied) {
            return [null, 0.0];
        }

        $couponId = is_object($applied) ? ($applied->id ?? null) : ($applied['id'] ?? null);
        $coupon = $couponId ? Coupon::find($couponId) : null;

        if (! $coupon || ! $coupon->is_active) {
            return [null, 0.0];
        }
        if ($coupon->valid_from && now()->lt($coupon->valid_from)) {
            return [null, 0.0];
        }
        if ($coupon->valid_until && now()->gt($coupon->valid_until)) {
            return [null, 0.0];
        }
        if ($coupon->max_uses && $coupon->uses >= $coupon->max_uses) {
            return [null, 0.0];
        }
        if ($coupon->min_cart_amount && $subtotal < $coupon->min_cart_amount) {
            return [null, 0.0];
        }

        if ($coupon->type === 'percentage') {
            $discount = $subtotal * ((float) $coupon->value / 100);
        } else {
            $discount = (float) $coupon->value;
        }

        return [$coupon, round(min($discount, $subtotal), 2)];
    }

    private function shippingAmount(array $data, array $settings): float
    {
        // USA and every other non-Bangladesh country ship at the international rate.
        if (in_array(($data['country'] ?? ''), ['US', 'OTHER'], true)) {
            return (float) ($settings['delivery_usa'] ?? 0);
        }

        $inside = (float) ($settings['delivery_inside_dhaka'] ?? 0);
        $outside = (float) ($settings['delivery_outside_dhaka'] ?? 0);

        $area = $data['delivery_area'] ?? null;
        if ($area === 'inside_dhaka') {
            return $inside;
        }
        if ($area === 'outside_dhaka') {
            return $outside;
        }

        // Default to the higher (outside) rate when the area is unspecified.
        return max($inside, $outside);
    }

    /**
     * Atomically decrement stock; a conditional update prevents overselling
     * under concurrent checkouts without needing an explicit row lock.
     */
    private function reserveStock(?int $colorVariantId, ?int $sizeVariantId, int $productId, int $quantity, string $name): void
    {
        if ($colorVariantId) {
            $affectedColor = ProductVariant::where('id', $colorVariantId)
                ->where('stock', '>=', $quantity)
                ->decrement('stock', $quantity);
            if (! $affectedColor) {
                throw new \Exception("Not enough stock for {$name} (Color).");
            }
        }
        
        if ($sizeVariantId) {
            $affectedSize = ProductVariant::where('id', $sizeVariantId)
                ->where('stock', '>=', $quantity)
                ->decrement('stock', $quantity);
            if (! $affectedSize) {
                throw new \Exception("Not enough stock for {$name} (Size).");
            }
        }

        if (! $colorVariantId && ! $sizeVariantId) {
            $affected = Product::where('id', $productId)
                ->where('stock', '>=', $quantity)
                ->decrement('stock', $quantity);
            if (! $affected) {
                throw new \Exception("Not enough stock for {$name}.");
            }
        }
    }
}
