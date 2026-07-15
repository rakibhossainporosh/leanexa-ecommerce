<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $price = fake()->randomFloat(2, 10, 1000);
        $hasDiscount = fake()->boolean(30);

        return [
            'name' => ucwords($name),
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => fake()->paragraph(),
            'price' => $price,
            'discount_price' => $hasDiscount ? round($price * 0.8, 2) : null,
            'stock' => fake()->numberBetween(0, 100),
            'sku' => fake()->unique()->numerify('SKU-####'),
            'is_active' => fake()->boolean(90),
            'category_id' => \App\Models\Category::factory(),
        ];
    }
}
