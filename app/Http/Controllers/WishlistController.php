<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlistItems = Auth::user()
            ->wishlistedProducts()
            ->with(['images'])
            ->get();

        return Inertia::render('wishlist/index', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function toggle(Product $product)
    {
        $user = Auth::user();
        
        if ($user->wishlistedProducts()->where('product_id', $product->id)->exists()) {
            $user->wishlistedProducts()->detach($product->id);
            return back()->with('success', 'Product removed from wishlist.');
        } else {
            $user->wishlistedProducts()->attach($product->id);
            return back()->with('success', 'Product added to wishlist.');
        }
    }
}
