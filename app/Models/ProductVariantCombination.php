<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariantCombination extends Model
{
    protected $fillable = [
        'product_id',
        'size_variant_id',
        'color_variant_id',
        'stock',
    ];

    protected $casts = [
        'stock' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function sizeVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'size_variant_id');
    }

    public function colorVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'color_variant_id');
    }
}
