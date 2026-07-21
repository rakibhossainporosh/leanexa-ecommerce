<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use App\Services\CategoryService;
use App\Services\TagService;
use App\Services\BrandService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
        protected CategoryService $categoryService,
        protected TagService $tagService,
        protected BrandService $brandService
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('admin/products/index');
    }

    public function create()
    {
        return Inertia::render('admin/products/create', $this->formOptions());
    }

    public function edit($id)
    {
        $product = \App\Models\Product::with(['category', 'brand', 'tags', 'images', 'variants', 'combinations.sizeVariant', 'combinations.colorVariant'])
            ->findOrFail($id);

        // Flatten combinations to {size, color, stock} keyed by name for the form.
        $product->setAttribute('combination_rows', $product->combinations->map(fn ($c) => [
            'size' => $c->sizeVariant?->name,
            'color' => $c->colorVariant?->name,
            'stock' => $c->stock,
        ])->filter(fn ($c) => $c['size'] && $c['color'])->values());

        return Inertia::render('admin/products/edit', array_merge(
            ['product' => $product],
            $this->formOptions()
        ));
    }

    /**
     * Category / tag / brand lists shared by the create and edit forms.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => $this->categoryService->getAllCategories(),
            'tags' => $this->tagService->getAllTags(),
            'brands' => $this->brandService->getAllBrands(),
        ];
    }

    /**
     * Server-side DataTables feed (yajra/laravel-datatables): handles
     * search, ordering and pagination for the products table.
     */
    public function data(Request $request)
    {
        $query = \App\Models\Product::query()
            ->with(['category:id,name', 'brand:id,name', 'images', 'variants']);

        return \Yajra\DataTables\Facades\DataTables::eloquent($query)
            ->filterColumn('category.name', function ($q, $keyword) {
                $q->whereHas('category', fn ($c) => $c->where('name', 'like', "%{$keyword}%"));
            })
            ->filterColumn('brand.name', function ($q, $keyword) {
                $q->whereHas('brand', fn ($b) => $b->where('name', 'like', "%{$keyword}%"));
            })
            ->orderColumn('category.name', function ($q, $order) {
                $q->orderBy(
                    \App\Models\Category::select('name')->whereColumn('categories.id', 'products.category_id'),
                    $order
                );
            })
            ->toJson();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'is_active' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            // Oversized files are compressed down to ~2 MB automatically.
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'image_url' => 'nullable|string|max:2048',
            'variants' => 'nullable|array',
            'variants.*.type' => 'nullable|string|in:color,size',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.size' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:255|distinct|unique:product_variants,sku',
            // A variant can carry several images: new uploads + kept/library URLs.
            'variants.*.new_images' => 'nullable|array',
            'variants.*.new_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.kept_images' => 'nullable|array',
            'variants.*.kept_images.*' => 'nullable|string|max:2048',
            // Legacy single-image fields (kept for backward compatibility).
            'variants.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.image_url' => 'nullable|string|max:2048',
            // Valid size x color combinations with per-pair stock.
            'combinations' => 'nullable|array',
            'combinations.*.size' => 'required|string',
            'combinations.*.color' => 'required|string',
            'combinations.*.stock' => 'nullable|integer|min:0',
        ]);

        $tags = $request->input('tags', []);
        $variants = $request->input('variants', []);
        $images = [];

        foreach ($variants as $index => &$variant) {
            $built = $this->buildVariantImages($request, $index, $variant);
            $variant['image_path'] = $built['image_path'];
            $variant['images'] = $built['images'];
        }
        unset($variant);

        if ($request->hasFile('image')) {
            $path = app(\App\Services\ImageService::class)->compressAndStore($request->file('image'), 'products');
            $images[] = '/storage/' . $path;
        } elseif ($request->filled('image_url')) {
            $images[] = $this->normalizeMediaPath($request->input('image_url'));
        }

        unset($validated['tags']);
        unset($validated['image']);
        unset($validated['image_url']);
        unset($validated['variants']);
        unset($validated['combinations']);

        $product = $this->productService->createProduct($validated, $tags, $images, [], $variants);
        $this->syncCombinations($product, $request->input('combinations', []));

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|unique:products,sku,'.$id,
            'is_active' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            // Oversized files are compressed down to ~2 MB automatically.
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'image_url' => 'nullable|string|max:2048',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.type' => 'nullable|string|in:color,size',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.size' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.sku' => [
                'nullable',
                'string',
                'max:255',
                'distinct',
                function ($attribute, $value, $fail) use ($request) {
                    $index = explode('.', $attribute)[1];
                    $variantId = $request->input("variants.{$index}.id");
                    $exists = \App\Models\ProductVariant::where('sku', $value)
                        ->when($variantId, function($q) use ($variantId) {
                            $q->where('id', '!=', $variantId);
                        })->exists();
                    if ($exists) {
                        $fail('The SKU has already been taken.');
                    }
                }
            ],
            // A variant can carry several images: new uploads + kept/library URLs.
            'variants.*.new_images' => 'nullable|array',
            'variants.*.new_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.kept_images' => 'nullable|array',
            'variants.*.kept_images.*' => 'nullable|string|max:2048',
            // Legacy single-image fields (kept for backward compatibility).
            'variants.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.image_url' => 'nullable|string|max:2048',
            // Valid size x color combinations with per-pair stock.
            'combinations' => 'nullable|array',
            'combinations.*.size' => 'required|string',
            'combinations.*.color' => 'required|string',
            'combinations.*.stock' => 'nullable|integer|min:0',
        ]);

        $tags = $request->input('tags', []);
        $variants = $request->input('variants', []);

        foreach ($variants as $index => &$variant) {
            // The form always submits the full desired image set (kept URLs +
            // new uploads), so we rebuild the list rather than guessing what
            // changed. Colour variants only.
            $built = $this->buildVariantImages($request, $index, $variant);
            $variant['image_path'] = $built['image_path'];
            $variant['images'] = $built['images'];
        }
        unset($variant);

        unset($validated['tags']);
        unset($validated['image']);
        unset($validated['image_url']);
        unset($validated['variants']);
        unset($validated['combinations']);

        $newImagePath = null;
        if ($request->hasFile('image')) {
            $newImagePath = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($request->file('image'), 'products');
        } elseif ($request->filled('image_url')) {
            $newImagePath = $this->normalizeMediaPath($request->input('image_url'));
        }

        $product = $this->productService->updateProduct($id, $validated, $tags, $variants);
        $this->syncCombinations($product, $request->input('combinations', []));

        if ($newImagePath) {
            $product = \App\Models\Product::find($id);
            // Replace existing images with the new selection.
            $product->images()->delete();
            $product->images()->create([
                'image_path' => $newImagePath,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Persist the product's valid size x color combinations. Combinations are
     * submitted by size/colour NAME (variant ids may not exist yet on create),
     * so we resolve them to the freshly-saved size and colour variant rows and
     * replace the product's combination set with the enabled pairs.
     *
     * @param  array<int, array{size?: string, color?: string, stock?: mixed}>  $combinations
     */
    private function syncCombinations(\App\Models\Product $product, array $combinations): void
    {
        $product->load('variants');
        $sizes = $product->variants->where('type', 'size')->keyBy(fn ($v) => trim(mb_strtolower($v->name)));
        $colors = $product->variants->where('type', '!=', 'size')->keyBy(fn ($v) => trim(mb_strtolower($v->name)));

        $keptIds = [];
        foreach ($combinations as $combo) {
            $sizeVariant = $sizes->get(trim(mb_strtolower($combo['size'] ?? '')));
            $colorVariant = $colors->get(trim(mb_strtolower($combo['color'] ?? '')));
            if (! $sizeVariant || ! $colorVariant) {
                continue;
            }

            $row = \App\Models\ProductVariantCombination::updateOrCreate(
                [
                    'size_variant_id' => $sizeVariant->id,
                    'color_variant_id' => $colorVariant->id,
                ],
                [
                    'product_id' => $product->id,
                    'stock' => (int) ($combo['stock'] ?? 0),
                ]
            );
            $keptIds[] = $row->id;
        }

        // Remove combinations the admin unchecked.
        $product->combinations()->whereNotIn('id', $keptIds)->delete();
    }

    /**
     * Build a variant's ordered image list from the submitted request.
     * Kept/library URLs come first (in the order the admin arranged them),
     * followed by any newly uploaded files. Size variants get no images.
     *
     * @return array{image_path: ?string, images: array<int, string>}
     */
    private function buildVariantImages(Request $request, int|string $index, array $variant): array
    {
        if (($variant['type'] ?? 'color') === 'size') {
            return ['image_path' => null, 'images' => []];
        }

        $images = [];

        // Existing images the form chose to keep (already stored or picked from
        // the media library), preserving their submitted order.
        foreach ((array) $request->input("variants.{$index}.kept_images", []) as $url) {
            if (is_string($url) && $url !== '') {
                $images[] = $this->normalizeMediaPath($url);
            }
        }

        // Newly uploaded files, appended after the kept ones.
        foreach ((array) $request->file("variants.{$index}.new_images", []) as $file) {
            if ($file) {
                $images[] = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($file, 'products');
            }
        }

        // Backward compatibility with the old single-image fields.
        if (empty($images)) {
            if ($request->hasFile("variants.{$index}.image")) {
                $images[] = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($request->file("variants.{$index}.image"), 'products');
            } elseif (! empty($variant['image_url'])) {
                $images[] = $this->normalizeMediaPath($variant['image_url']);
            }
        }

        return [
            'image_path' => $images[0] ?? null,
            'images' => $images,
        ];
    }

    /**
     * Normalize a media library URL to a storage-relative path (e.g. /storage/media/x.png).
     */
    private function normalizeMediaPath(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);

        return $path ?: $url;
    }

    public function destroy($id)
    {
        $this->productService->deleteProduct($id);
        
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
