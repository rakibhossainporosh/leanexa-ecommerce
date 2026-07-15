<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProductService;
use App\Services\HomeLayoutService;
use App\Models\Product;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Setting;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
        protected HomeLayoutService $homeLayoutService
    ) {}
    public function suggestions(Request $request)
    {
        $search = $request->input('q');

        if (!$search || strlen($search) < 2) {
            return response()->json([]);
        }

        $products = Product::where('is_active', true)
            ->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })
            ->select('id', 'name', 'slug', 'price', 'discount_price')
            ->with(['images' => function($q) {
                $q->select('product_id', 'image_path')->orderBy('sort_order');
            }])
            ->limit(5)
            ->get();

        return response()->json($products);
    }

    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Product::with(['category', 'brand', 'tags', 'images', 'variants'])->where('is_active', true);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category slug (including its child categories).
        $category = null;
        if ($request->filled('category')) {
            $category = \App\Models\Category::where('slug', $request->input('category'))->first();
            if ($category) {
                $categoryIds = [$category->id, ...$category->children()->pluck('id')->all()];
                $query->whereIn('category_id', $categoryIds);
            }
        }

        $products = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => array_merge(
                $request->only('search', 'category'),
                ['categoryName' => $category?->name],
            ),
            // Dynamic, admin-controlled homepage sections (replaces the old
            // hardcoded trending/deal/featured blocks). Products + prices are
            // resolved entirely server-side.
            'homeSections' => $this->homeLayoutService->resolve(),
            'banners' => Banner::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get(),
            'brands' => Brand::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'logo_url']),
            'landing' => Setting::landing(),
        ]);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'brand', 'tags', 'images', 'videos', 'variants'])
            ->where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('products/show', [
            'product' => $product
        ]);
    }

    public function section($id)
    {
        $section = \App\Models\HomeSection::findOrFail($id);
        
        $query = Product::query()->where('is_active', true)->with(['category:id,name', 'brand:id,name', 'tags:id,name', 'images']);
        
        if ($section->product_source === 'manual') {
            $query->whereHas('homeSections', function ($q) use ($id) {
                $q->where('home_section_id', $id);
            });
        } else {
            if ($section->type === 'deal') {
                $query->whereNotNull('discount_price')->whereRaw('discount_price > 0 AND discount_price < price');
            } elseif ($section->type === 'trending') {
                // Keep default query which is ordered below
            } elseif ($section->type === 'featured') {
                $query->inRandomOrder();
            } else {
                abort(404);
            }
        }

        $products = $query->latest()->paginate(16);

        return Inertia::render('products/section', [
            'section' => $section,
            'products' => $products
        ]);
    }

    public function brands()
    {
        $brands = Brand::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'logo_url', 'description']);

        return Inertia::render('brands/index', [
            'brands' => $brands
        ]);
    }
}
