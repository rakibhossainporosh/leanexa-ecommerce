<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HomeSection extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'type',
        'product_source',
        'display_style',
        'product_limit',
        'view_all_link',
        'is_active',
        'sort_order',
        'category_ids',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'product_limit' => 'integer',
        'sort_order' => 'integer',
        'category_ids' => 'array',
    ];

    /**
     * Manually assigned products, ordered by their pivot sort order.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'home_section_products')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderBy('home_section_products.sort_order');
    }
}
