<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeSection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class HomeSectionController extends Controller
{
    public function index()
    {
        $sections = HomeSection::query()
            ->withCount('products')
            ->with(['products' => fn ($q) => $q->select('products.id', 'products.name', 'products.slug')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $categories = \App\Models\Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/home-sections/index', [
            'sections' => $sections,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateSection($request);

        // A custom section has no product flag to resolve from, so it must be manual.
        if ($data['type'] === 'custom' && $data['product_source'] === 'auto') {
            $data['product_source'] = 'manual';
        }

        HomeSection::create($data);

        return back()->with('success', 'Section created successfully.');
    }

    public function update(Request $request, HomeSection $homeSection)
    {
        $data = $this->validateSection($request);

        if ($data['type'] === 'custom' && $data['product_source'] === 'auto') {
            $data['product_source'] = 'manual';
        }

        $homeSection->update($data);

        return back()->with('success', 'Section updated successfully.');
    }

    public function destroy(HomeSection $homeSection)
    {
        $homeSection->delete(); // mapping rows cascade

        return back()->with('success', 'Section deleted successfully.');
    }

    /**
     * Persist the top-to-bottom order of sections after a drag-drop.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'sections' => ['present', 'array'],
            'sections.*.id' => ['required', 'integer', 'exists:home_sections,id'],
            'sections.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['sections'] as $row) {
                HomeSection::whereKey($row['id'])->update(['sort_order' => $row['sort_order']]);
            }
        });

        return back();
    }

    /**
     * Attach one product to a manual section (idempotent; duplicates are blocked
     * both by validation and the DB unique index).
     */
    public function attachProduct(Request $request, HomeSection $homeSection)
    {
        abort_if($homeSection->product_source !== 'manual', 422, 'This section resolves products automatically.');

        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
                Rule::unique('home_section_products', 'product_id')
                    ->where('home_section_id', $homeSection->id),
            ],
        ]);

        $nextOrder = (int) $homeSection->products()->max('home_section_products.sort_order');

        $homeSection->products()->attach($validated['product_id'], [
            'sort_order' => $homeSection->products()->count() ? $nextOrder + 1 : 0,
        ]);

        return back()->with('success', 'Product added to section.');
    }

    public function detachProduct(HomeSection $homeSection, Product $product)
    {
        $homeSection->products()->detach($product->id);

        return back()->with('success', 'Product removed from section.');
    }

    /**
     * Persist the order of products within a section after a drag-drop.
     */
    public function reorderProducts(Request $request, HomeSection $homeSection)
    {
        $validated = $request->validate([
            'products' => ['present', 'array'],
            'products.*.id' => ['required', 'integer'],
            'products.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $homeSection) {
            foreach ($validated['products'] as $row) {
                $homeSection->products()->updateExistingPivot($row['id'], ['sort_order' => $row['sort_order']]);
            }
        });

        return back();
    }

    private function validateSection(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'type' => ['required', Rule::in(['trending', 'deal', 'featured', 'custom'])],
            'product_source' => ['required', Rule::in(['auto', 'manual', 'category'])],
            'display_style' => ['required', Rule::in(['grid', 'carousel', 'list'])],
            'product_limit' => ['required', 'integer', 'min:1', 'max:50'],
            // Only allow relative paths to avoid open-redirect / javascript: URLs.
            'view_all_link' => ['nullable', 'string', 'max:255', 'starts_with:/'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ]);
    }
}
