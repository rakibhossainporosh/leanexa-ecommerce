<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'color_variant_id', 'size_variant_id', 'product_name', 'price', 'quantity'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
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
