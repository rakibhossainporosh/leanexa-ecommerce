<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantCombination;
use App\Services\CartService;

function matrixProduct(): array
{
    $product = Product::factory()->create(['stock' => 100]);
    $size42 = $product->variants()->create(['type' => 'size', 'name' => '42', 'stock' => 0]);
    $size44 = $product->variants()->create(['type' => 'size', 'name' => '44', 'stock' => 0]);
    $red = $product->variants()->create(['type' => 'color', 'name' => 'Red', 'stock' => 0]);
    $black = $product->variants()->create(['type' => 'color', 'name' => 'Black', 'stock' => 0]);

    // 42 comes in Red only; 44 comes in Black only.
    ProductVariantCombination::create([
        'product_id' => $product->id, 'size_variant_id' => $size42->id, 'color_variant_id' => $red->id, 'stock' => 3,
    ]);
    ProductVariantCombination::create([
        'product_id' => $product->id, 'size_variant_id' => $size44->id, 'color_variant_id' => $black->id, 'stock' => 5,
    ]);

    return compact('product', 'size42', 'size44', 'red', 'black');
}

test('a valid size+colour combination can be added to the cart', function () {
    ['product' => $product, 'size42' => $size42, 'red' => $red] = matrixProduct();

    app(CartService::class)->addToCart($product->id, 1, $red->id, $size42->id);

    expect(app(CartService::class)->getCart()->items()->count())->toBe(1);
});

test('an invalid size+colour combination is rejected', function () {
    ['product' => $product, 'size42' => $size42, 'black' => $black] = matrixProduct();

    // 42 / Black is not a listed combination.
    expect(fn () => app(CartService::class)->addToCart($product->id, 1, $black->id, $size42->id))
        ->toThrow(Exception::class);
});

test('the combination stock caps the quantity, not the individual variants', function () {
    ['product' => $product, 'size42' => $size42, 'red' => $red] = matrixProduct();

    // The pair has 3 in stock even though the size/colour rows show 0.
    expect(fn () => app(CartService::class)->addToCart($product->id, 4, $red->id, $size42->id))
        ->toThrow(Exception::class);

    app(CartService::class)->addToCart($product->id, 3, $red->id, $size42->id);
    expect(app(CartService::class)->getCart()->items()->first()->quantity)->toBe(3);
});
