<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Session;

class CartService
{
    public function getCart()
    {
        $sessionId = Session::getId();
        $customerId = auth()->id();

        $query = Cart::with(['items.product.images', 'items.colorVariant', 'items.sizeVariant']);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        } else {
            $query->where('session_id', $sessionId)->whereNull('customer_id');
        }

        return $query->firstOrCreate(
            $customerId ? ['customer_id' => $customerId] : ['session_id' => $sessionId],
            $customerId ? ['session_id' => $sessionId] : []
        );
    }

    /**
     * Item count for the current visitor without creating a cart row —
     * this runs on every request via shared Inertia props.
     */
    public function getCartCount(): int
    {
        $customerId = auth()->id();

        $query = Cart::query();
        if ($customerId) {
            $query->where('customer_id', $customerId);
        } else {
            $query->where('session_id', Session::getId())->whereNull('customer_id');
        }

        $cart = $query->first();

        return $cart ? (int) $cart->items()->sum('quantity') : 0;
    }

    public function addToCart(int $productId, int $quantity = 1, ?int $colorVariantId = null, ?int $sizeVariantId = null)
    {
        $cart = $this->getCart();
        $product = Product::findOrFail($productId);
        
        $price = $product->effectivePrice();
        $stock = $product->stock;
        
        $colorVariant = null;
        if ($colorVariantId) {
            $colorVariant = $product->variants()->find($colorVariantId);
            if (! $colorVariant) throw new \Exception('The selected color option is not available.');
            $stock = min($stock, $colorVariant->stock);
        }

        $sizeVariant = null;
        if ($sizeVariantId) {
            $sizeVariant = $product->variants()->find($sizeVariantId);
            if (! $sizeVariant) throw new \Exception('The selected size option is not available.');
            if ($sizeVariant->price !== null) {
                $price = (float) $sizeVariant->price;
            }
            $stock = min($stock, $sizeVariant->stock);
        }

        $cartItem = $cart->items()->where('product_id', $productId)
            ->where('color_variant_id', $colorVariantId)
            ->where('size_variant_id', $sizeVariantId)
            ->first();

        $newQuantity = $cartItem ? $cartItem->quantity + $quantity : $quantity;

        if ($newQuantity > $stock) {
            throw new \Exception("Cannot add more to cart. Only {$stock} items left in stock.");
        }

        if ($cartItem) {
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'color_variant_id' => $colorVariantId,
                'size_variant_id' => $sizeVariantId,
                'quantity' => $quantity,
                'price' => $price,
            ]);
        }

        return $cart->load(['items.product.images', 'items.colorVariant', 'items.sizeVariant']);
    }

    public function updateQuantity(int $itemId, int $quantity)
    {
        $cart = $this->getCart();
        $cartItem = $cart->items()->with(['product', 'colorVariant', 'sizeVariant'])->findOrFail($itemId);
        
        if ($quantity <= 0) {
            $cartItem->delete();
        } else {
            $stock = $cartItem->product->stock;
            if ($cartItem->colorVariant) $stock = min($stock, $cartItem->colorVariant->stock);
            if ($cartItem->sizeVariant) $stock = min($stock, $cartItem->sizeVariant->stock);
            
            if ($quantity > $stock) {
                throw new \Exception("Cannot update quantity. Only {$stock} items left in stock.");
            }
            $cartItem->quantity = $quantity;
            $cartItem->save();
        }

        return $cart->load(['items.product.images', 'items.colorVariant', 'items.sizeVariant']);
    }

    public function removeItem(int $itemId)
    {
        $cart = $this->getCart();
        $cart->items()->where('id', $itemId)->delete();
        
        return $cart->load(['items.product.images', 'items.colorVariant', 'items.sizeVariant']);
    }

    public function clearCart()
    {
        $cart = $this->getCart();
        $cart->items()->delete();
    }
}
