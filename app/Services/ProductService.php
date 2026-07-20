<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function getPaginatedProducts(int $perPage = 15)
    {
        return $this->productRepository->getPaginatedWithRelations($perPage, ['category', 'brand', 'tags', 'images', 'variants']);
    }

    /**
     * Generate a slug that's unique among products (excluding $ignoreId).
     */
    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (\App\Models\Product::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base . '-' . $suffix++;
        }

        return $slug;
    }

    public function createProduct(array $data, array $tags = [], array $images = [], array $videos = [], array $variants = [])
    {
        return DB::transaction(function () use ($data, $tags, $images, $videos, $variants) {
            $data['slug'] = $this->uniqueSlug($data['name']);
            if (empty($data['sku'])) {
                $data['sku'] = strtoupper(Str::random(8));
            }

            $product = $this->productRepository->create($data);

            if (!empty($tags)) {
                $product->tags()->sync($tags);
            }

            foreach ($images as $index => $imagePath) {
                $product->images()->create([
                    'image_path' => $imagePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }

            foreach ($videos as $index => $video) {
                $product->videos()->create([
                    'video_url' => $video['url'],
                    'provider' => $video['provider'] ?? 'youtube',
                    'sort_order' => $index,
                ]);
            }

            foreach ($variants as $variant) {
                if (!empty($variant['name'])) {
                    $product->variants()->create([
                        'type' => $variant['type'] ?? 'color',
                        'name' => $variant['name'],
                        'price' => isset($variant['price']) && $variant['price'] !== '' ? $variant['price'] : null,
                        'stock' => $variant['stock'] ?? 0,
                        'sku' => $variant['sku'] ?? null,
                        'image_path' => $variant['image_path'] ?? null,
                        'images' => $variant['images'] ?? [],
                    ]);
                }
            }

            return $product;
        });
    }

    public function updateProduct(int $id, array $data, array $tags = [], array $variants = [])
    {
        return DB::transaction(function () use ($id, $data, $tags, $variants) {
            if (isset($data['name'])) {
                $data['slug'] = $this->uniqueSlug($data['name'], $id);
            }

            $this->productRepository->update($id, $data);
            $product = $this->productRepository->find($id);

            if (!empty($tags)) {
                $product->tags()->sync($tags);
            }

            // Update variants by id when provided, create new ones otherwise,
            // and delete any variant missing from the submitted list.
            $existingVariantIds = [];
            foreach ($variants as $variant) {
                if (!empty($variant['name'])) {
                    if (isset($variant['id']) && $variant['id']) {
                        // Scoped to this product so a foreign variant id is ignored.
                        $v = $product->variants()->find($variant['id']);
                        if ($v) {
                            $v->update([
                                'type' => $variant['type'] ?? 'color',
                                'name' => $variant['name'],
                                'price' => isset($variant['price']) && $variant['price'] !== '' ? $variant['price'] : null,
                                'stock' => $variant['stock'] ?? 0,
                                'sku' => $variant['sku'] ?? null,
                                'image_path' => array_key_exists('image_path', $variant) ? $variant['image_path'] : $v->image_path,
                                'images' => array_key_exists('images', $variant) ? $variant['images'] : $v->images,
                            ]);
                            $existingVariantIds[] = $v->id;
                        }
                    } else {
                        $newVariant = $product->variants()->create([
                            'type' => $variant['type'] ?? 'color',
                            'name' => $variant['name'],
                            'price' => isset($variant['price']) && $variant['price'] !== '' ? $variant['price'] : null,
                            'stock' => $variant['stock'] ?? 0,
                            'sku' => $variant['sku'] ?? null,
                            'image_path' => $variant['image_path'] ?? null,
                            'images' => $variant['images'] ?? [],
                        ]);
                        $existingVariantIds[] = $newVariant->id;
                    }
                }
            }
            
            // Delete variants not in the new list
            $product->variants()->whereNotIn('id', $existingVariantIds)->delete();

            return $product;
        });
    }

    public function deleteProduct(int $id)
    {
        return $this->productRepository->delete($id);
    }
}
