<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BrandService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Brand;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {}

    public function index()
    {
        $brands = $this->brandService->getAllBrands();
        return Inertia::render('admin/brands/index', [
            'brands' => $brands
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        unset($validated['logo']);

        $this->brandService->createBrand($validated);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        $brand = Brand::findOrFail($id);

        if ($request->hasFile('logo')) {
            if ($brand->logo_url) {
                $oldPath = str_replace('/storage/', '', $brand->logo_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        unset($validated['logo']);

        $this->brandService->updateBrand($id, $validated);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        if ($brand->logo_url) {
            $oldPath = str_replace('/storage/', '', $brand->logo_url);
            Storage::disk('public')->delete($oldPath);
        }

        $this->brandService->deleteBrand($id);

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}
