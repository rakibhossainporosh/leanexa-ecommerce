<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Seed a shoe store catalog: brands, categories, and products with
     * size variants and gallery images.
     */
    public function run(): void
    {
        $brands = collect(['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse', 'Bata'])
            ->mapWithKeys(fn (string $name) => [$name => Brand::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'is_active' => true,
            ])]);

        $categories = collect([
            'Running Shoes' => 'Lightweight shoes built for daily runs and racing.',
            'Sneakers' => 'Everyday casual sneakers for street and lifestyle.',
            'Formal Shoes' => 'Leather oxfords and loafers for office and events.',
            'Sports Shoes' => 'Training, gym, and court footwear.',
            'Boots' => 'Durable boots for work and outdoors.',
            'Sandals' => 'Comfortable sandals and slides for summer.',
        ])->mapWithKeys(fn (string $desc, string $name) => [$name => Category::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $desc,
        ])]);

        $unsplash = fn (string $id) => "https://images.unsplash.com/{$id}?q=80&w=800&auto=format&fit=crop";

        $products = [
            [
                'name' => 'Nike Air Zoom Pegasus 41',
                'brand' => 'Nike', 'category' => 'Running Shoes',
                'price' => 12500, 'discount' => 10900,
                'description' => 'Responsive Zoom Air cushioning and a breathable mesh upper make the Pegasus 41 the perfect daily running partner.',
                'images' => ['photo-1542291026-7eec264c27ff', 'photo-1549298916-b41d501d3772'],
                'variants' => ['size', [39, 40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'Nike Air Force 1 Low White',
                'brand' => 'Nike', 'category' => 'Sneakers',
                'price' => 11000, 'discount' => null,
                'description' => 'The timeless all-white AF1 with crisp leather, bold court style, and Nike Air cushioning.',
                'images' => ['photo-1514989940723-e8e51635b782', 'photo-1595950653106-6c9ebd614d3a'],
                'variants' => ['size', [39, 40, 41, 42, 43]],
            ],
            [
                'name' => 'Nike Revolution 7 Blue',
                'brand' => 'Nike', 'category' => 'Running Shoes',
                'price' => 6800, 'discount' => 5500,
                'description' => 'Soft foam midsole and flexible outsole deliver smooth comfort for runners on a budget.',
                'images' => ['photo-1606107557195-0e29a4b5b4aa', 'photo-1460353581641-37baddab0fa2'],
                'variants' => ['size', [40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'Adidas Ultraboost Light',
                'brand' => 'Adidas', 'category' => 'Running Shoes',
                'price' => 16500, 'discount' => 14200,
                'description' => 'The lightest Ultraboost ever, with BOOST cushioning that returns energy on every stride.',
                'images' => ['photo-1587563871167-1ee9c731aefb', 'photo-1608231387042-66d1773070a5'],
                'variants' => ['size', [39, 40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'Adidas Samba OG Classic',
                'brand' => 'Adidas', 'category' => 'Sneakers',
                'price' => 9800, 'discount' => null,
                'description' => 'The iconic low-profile Samba with soft leather upper and suede T-toe overlay.',
                'images' => ['photo-1595341888016-a392ef81b7de', 'photo-1512374382149-233c42b6a83b'],
                'variants' => ['size', [38, 39, 40, 41, 42, 43]],
            ],
            [
                'name' => 'Puma Velocity Nitro 3',
                'brand' => 'Puma', 'category' => 'Sports Shoes',
                'price' => 10500, 'discount' => 8900,
                'description' => 'NITRO foam cushioning with PUMAGRIP outsole for gym sessions and tempo runs alike.',
                'images' => ['photo-1608379743498-63cc1e346af6', 'photo-1539185441755-769473a23570'],
                'variants' => ['size', [40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'Puma Suede Classic XXI',
                'brand' => 'Puma', 'category' => 'Sneakers',
                'price' => 7500, 'discount' => 6200,
                'description' => 'The street legend since 1968 — rich suede upper with the classic Formstrip.',
                'images' => ['photo-1560769629-975ec94e6a86', 'photo-1533867617858-e7b97e060509'],
                'variants' => ['size', [39, 40, 41, 42]],
            ],
            [
                'name' => 'New Balance 574 Core Grey',
                'brand' => 'New Balance', 'category' => 'Sneakers',
                'price' => 9200, 'discount' => null,
                'description' => 'The most iconic NB silhouette with ENCAP midsole cushioning and suede/mesh upper.',
                'images' => ['photo-1539298370430-ea79e2098cdb', 'photo-1525966222134-fcfa99b8ae77'],
                'variants' => ['size', [40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'New Balance Fresh Foam X 1080v13',
                'brand' => 'New Balance', 'category' => 'Running Shoes',
                'price' => 15800, 'discount' => 13500,
                'description' => 'Plush Fresh Foam X cushioning built for long miles and maximum comfort.',
                'images' => ['photo-1491553895911-0055eca6402d', 'photo-1465453869711-7e174808ace9'],
                'variants' => ['size', [41, 42, 43, 44]],
            ],
            [
                'name' => 'Converse Chuck Taylor All Star High',
                'brand' => 'Converse', 'category' => 'Sneakers',
                'price' => 6500, 'discount' => 5800,
                'description' => 'The unmistakable canvas high-top that has defined generations of self-expression.',
                'images' => ['photo-1607522370275-f14206abe5d3', 'photo-1494496195158-c3becb4f2475'],
                'variants' => ['size', [38, 39, 40, 41, 42, 43]],
            ],
            [
                'name' => 'Bata Oxford Leather Formal',
                'brand' => 'Bata', 'category' => 'Formal Shoes',
                'price' => 5500, 'discount' => null,
                'description' => 'Genuine leather oxford with cushioned insole — polished comfort for the office.',
                'images' => ['photo-1614252369475-531eba835eb1', 'photo-1478186014425-6b96a2bee7bb'],
                'variants' => ['size', [40, 41, 42, 43, 44]],
            ],
            [
                'name' => 'Bata Comfit Slide Sandals',
                'brand' => 'Bata', 'category' => 'Sandals',
                'price' => 2200, 'discount' => 1800,
                'description' => 'Soft cushioned slides for all-day home and outdoor comfort.',
                'images' => ['photo-1603487742131-4160ec999306', 'photo-1562273138-f46be4ebdf33'],
                'variants' => ['size', [39, 40, 41, 42, 43]],
            ],
            [
                'name' => 'Timberland-Style Leather Boots',
                'brand' => 'Bata', 'category' => 'Boots',
                'price' => 8900, 'discount' => 7400,
                'description' => 'Rugged waterproof leather boots with lug outsole for outdoor adventures.',
                'images' => ['photo-1520639888713-7851133b1ed0', 'photo-1605348532760-6753d2c43329'],
                'variants' => ['size', [40, 41, 42, 43, 44]],
            ],
        ];

        foreach ($products as $i => $data) {
            $product = Product::create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'description' => $data['description'],
                'price' => $data['price'],
                'discount_price' => $data['discount'],
                'stock' => 0, // stock lives on the size variants
                'sku' => 'SHOE-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'is_active' => true,
                'category_id' => $categories[$data['category']]->id,
                'brand_id' => $brands[$data['brand']]->id,
            ]);

            foreach ($data['images'] as $j => $photoId) {
                $product->images()->create([
                    'image_path' => $unsplash($photoId),
                    'is_primary' => $j === 0,
                    'sort_order' => $j,
                ]);
            }

            [, $sizes] = $data['variants'];
            foreach ($sizes as $size) {
                $product->variants()->create([
                    'name' => 'Size ' . $size,
                    'price' => null, // inherits product price
                    'stock' => random_int(5, 30),
                    'sku' => $product->sku . '-' . $size,
                ]);
            }

            // Keep the base stock column in sync with total variant stock.
            $product->update(['stock' => $product->variants()->sum('stock')]);
        }
    }
}
