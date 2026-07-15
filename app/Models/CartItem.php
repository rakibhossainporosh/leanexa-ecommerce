<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['cart_id', 'product_id', 'color_variant_id', 'size_variant_id', 'quantity', 'price'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function colorVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'color_variant_id');
    }

    public function sizeVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'size_variant_id');
    }
}
