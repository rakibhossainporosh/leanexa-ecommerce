<?php

namespace Database\Seeders;

use App\Models\HomeSection;
use Illuminate\Database\Seeder;

class HomeSectionsSeeder extends Seeder
{
    /**
     * Seed the three default (auto) sections so the homepage keeps rendering
     * exactly as before this CMS was introduced. Idempotent.
     */
    public function run(): void
    {
        $defaults = [
            [
                'title' => 'Trending Products',
                'type' => 'trending',
                'display_style' => 'grid',
                'product_limit' => 10,
                'sort_order' => 0,
            ],
            [
                'title' => 'Deal of the Day',
                'subtitle' => "Grab these offers before they're gone.",
                'type' => 'deal',
                'display_style' => 'grid',
                'product_limit' => 5,
                'sort_order' => 1,
            ],
            [
                'title' => 'Featured Products',
                'subtitle' => 'Handpicked electronics loved by our customers.',
                'type' => 'featured',
                'display_style' => 'grid',
                'product_limit' => 10,
                'sort_order' => 2,
            ],
        ];

        foreach ($defaults as $section) {
            HomeSection::firstOrCreate(
                ['type' => $section['type'], 'title' => $section['title']],
                array_merge($section, [
                    'product_source' => 'auto',
                    'view_all_link' => null,
                    'is_active' => true,
                ])
            );
        }
    }
}
