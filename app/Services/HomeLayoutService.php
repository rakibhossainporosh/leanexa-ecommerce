<?php

namespace App\Services;

use App\Models\HomeSection;
use App\Models\Product;
use Illuminate\Support\Collection;

class HomeLayoutService
{
    /**
     * Relations + columns exposed to the storefront. Kept lean on purpose:
     * the client never decides which products or prices appear.
     */
    private const RELATIONS = ['category:id,name', 'brand:id,name', 'tags:id,name', 'images', 'variants'];

    /**
     * Resolve the active homepage layout: ordered sections, each with its
     * server-selected products. Manual mappings are eager-loaded in one query
     * to avoid an N+1 across sections.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function resolve(): Collection
    {
        $sections = HomeSection::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $sections->load([
            'products' => fn ($q) => $q->where('is_active', true)->with(self::RELATIONS),
        ]);

        return $sections->map(fn (HomeSection $section) => [
            'id' => $section->id,
            'title' => $section->title,
            'subtitle' => $section->subtitle,
            'display_style' => $section->display_style,
            'view_all_link' => $section->view_all_link ?: route('products.section', $section->id),
            'products' => $this->productsFor($section)->values(),
        ]);
    }

    /**
     * @return Collection<int, Product>
     */
    private function productsFor(HomeSection $section): Collection
    {
        if ($section->product_source === 'manual') {
            return $section->products->take($section->product_limit);
        }

        if ($section->product_source === 'category') {
            if (empty($section->category_ids)) {
                return collect();
            }

            return Product::query()
                ->where('is_active', true)
                ->whereIn('category_id', $section->category_ids)
                ->with(self::RELATIONS)
                ->latest()
                ->take($section->product_limit)
                ->get();
        }

        $query = Product::query()
            ->where('is_active', true)
            ->with(self::RELATIONS);

        if ($section->type === 'deal') {
            $query->whereNotNull('discount_price')->whereRaw('discount_price > 0 AND discount_price < price');
        } elseif ($section->type === 'trending') {
            $query->latest();
        } elseif ($section->type === 'featured') {
            $query->inRandomOrder();
        } else {
            return collect();
        }

        return $query->take($section->product_limit)->get();
    }
}
