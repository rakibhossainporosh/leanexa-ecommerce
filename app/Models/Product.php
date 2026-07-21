<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
    ];

    protected $fillable = [
        'name', 'slug', 'description', 'short_description', 'price', 'discount_price', 'stock', 'sku', 'is_active', 'category_id', 'brand_id'
    ];

    /**
     * The price a customer actually pays: the sale price when set and lower
     * than the regular price, otherwise the regular price.
     */
    public function effectivePrice(): float
    {
        $discount = $this->discount_price !== null ? (float) $this->discount_price : null;
        $price = (float) $this->price;

        if ($discount !== null && $discount > 0 && $discount < $price) {
            return $discount;
        }

        return $price;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function videos()
    {
        return $this->hasMany(ProductVideo::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function combinations()
    {
        return $this->hasMany(ProductVariantCombination::class);
    }

    public function wishlistedBy()
    {
        return $this->belongsToMany(Customer::class, 'wishlists', 'product_id', 'customer_id')->withTimestamps();
    }

    public function homeSections()
    {
        return $this->belongsToMany(HomeSection::class, 'home_section_products')->withPivot('sort_order');
    }
}
