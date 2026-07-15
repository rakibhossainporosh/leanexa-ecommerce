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
        $categories = $this->categoryService->getAllCategories();
        $tags = $this->tagService->getAllTags();
        $brands = $this->brandService->getAllBrands();

        return Inertia::render('admin/products/index', [
            'categories' => $categories,
            'tags' => $tags,
            'brands' => $brands
        ]);
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
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.sku' => 'nullable|string|max:255|distinct|unique:product_variants,sku',
            'variants.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.image_url' => 'nullable|string|max:2048',
        ]);

        $tags = $request->input('tags', []);
        $variants = $request->input('variants', []);
        $images = [];

        foreach ($variants as $index => &$variant) {
            if ($request->hasFile("variants.{$index}.image")) {
                $variant['image_path'] = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($request->file("variants.{$index}.image"), 'products');
            } elseif (!empty($variant['image_url'])) {
                $variant['image_path'] = $this->normalizeMediaPath($variant['image_url']);
            } else {
                $variant['image_path'] = null;
            }
        }

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

        $this->productService->createProduct($validated, $tags, $images, [], $variants);

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
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
            'variants.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'variants.*.image_url' => 'nullable|string|max:2048',
        ]);

        $tags = $request->input('tags', []);
        $variants = $request->input('variants', []);

        foreach ($variants as $index => &$variant) {
            if ($request->hasFile("variants.{$index}.image")) {
                $variant['image_path'] = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($request->file("variants.{$index}.image"), 'products');
            } elseif (!empty($variant['image_url'])) {
                $variant['image_path'] = $this->normalizeMediaPath($variant['image_url']);
            }
            // we don't nullify if not present in update, to keep existing image if unchanged?
            // Actually, if frontend clears it, it might pass empty string. Let's nullify if explicitly empty image_url and no file.
            // But if it's not present at all, maybe don't touch.
            // Let's assume if it is present and empty, it means clear.
            elseif (array_key_exists('image_url', $variant) && empty($variant['image_url'])) {
                $variant['image_path'] = null;
            }
        }

        unset($validated['tags']);
        unset($validated['image']);
        unset($validated['image_url']);
        unset($validated['variants']);

        $newImagePath = null;
        if ($request->hasFile('image')) {
            $newImagePath = '/storage/' . app(\App\Services\ImageService::class)->compressAndStore($request->file('image'), 'products');
        } elseif ($request->filled('image_url')) {
            $newImagePath = $this->normalizeMediaPath($request->input('image_url'));
        }

        $this->productService->updateProduct($id, $validated, $tags, $variants);

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

        return redirect()->back()->with('success', 'Product updated successfully.');
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
