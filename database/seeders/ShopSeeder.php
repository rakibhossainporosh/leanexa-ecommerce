<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Currency;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Seed shop-level data: currencies and homepage slider banners.
     */
    public function run(): void
    {
        Currency::firstOrCreate(
            ['code' => 'BDT'],
            ['symbol' => '৳', 'exchange_rate' => 1, 'is_default' => true, 'is_active' => true]
        );
        Currency::firstOrCreate(
            ['code' => 'USD'],
            ['symbol' => '$', 'exchange_rate' => 0.0082, 'is_default' => false, 'is_active' => true]
        );

        $banners = [
            [
                'title' => 'Step Into Style',
                'subtitle' => 'New season sneakers from Nike, Adidas & Puma — up to 30% off.',
                'image' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1600&auto=format&fit=crop',
                'button_text' => 'Shop Sneakers',
                'link' => '/products',
                'sort_order' => 0,
            ],
            [
                'title' => 'Run Faster, Go Further',
                'subtitle' => 'Premium running shoes engineered for speed and comfort.',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop',
                'button_text' => 'Shop Running',
                'link' => '/products',
                'sort_order' => 1,
            ],
            [
                'title' => 'Classics Never Fade',
                'subtitle' => 'Iconic silhouettes — Chuck Taylor, Samba, Air Force 1 and more.',
                'image' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1600&auto=format&fit=crop',
                'button_text' => 'Explore Classics',
                'link' => '/products',
                'sort_order' => 2,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::firstOrCreate(
                ['title' => $banner['title']],
                array_merge($banner, ['is_active' => true])
            );
        }
    }
}
