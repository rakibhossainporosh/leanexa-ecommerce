<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/landing/index', [
            'settings' => Setting::landing(),
            'banners' => Banner::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'hero_enabled' => 'boolean',
            'featured_title' => 'required|string|max:255',
            'featured_subtitle' => 'nullable|string|max:500',
            'promo_enabled' => 'boolean',
            'promo_eyebrow' => 'nullable|string|max:255',
            'promo_title' => 'nullable|string|max:255',
            'promo_subtitle' => 'nullable|string|max:500',
            'promo_button_text' => 'nullable|string|max:100',
            'promo_link' => 'nullable|string|max:255',
            'mid_banner_enabled' => 'nullable|boolean',
            'mid_banner_image' => 'nullable|string',
            'mid_banner_link' => 'nullable|string|max:255',
            'brands_enabled' => 'boolean',
            'brands_title' => 'required|string|max:255',
            'services' => 'array|size:4',
            'services.*.icon' => 'required|string|max:50',
            'services.*.title' => 'required|string|max:255',
            'services.*.desc' => 'nullable|string|max:255',
            'promo_tiles' => 'array|size:3',
            'promo_tiles.*.eyebrow' => 'nullable|string|max:255',
            'promo_tiles.*.title' => 'required|string|max:255',
            'promo_tiles.*.img' => 'nullable|string',
            'promo_tiles.*.link' => 'nullable|string|max:255',
        ], [
            'featured_title.required' => 'The featured title is required.',
            'brands_title.required' => 'The brands title is required.',
            'services.*.icon.required' => 'The service icon is required.',
            'services.*.title.required' => 'The service title is required.',
            'promo_tiles.*.title.required' => 'The promo tile title is required.',
        ]);

        Setting::set('landing', $validated);

        return redirect()->back()->with('success', 'Landing page settings saved.');
    }

    public function storeBanner(Request $request)
    {
        $validated = $this->validateBanner($request);

        Banner::create($validated);

        return redirect()->back()->with('success', 'Banner added.');
    }

    public function updateBanner(Request $request, Banner $banner)
    {
        $validated = $this->validateBanner($request);

        $banner->update($validated);

        return redirect()->back()->with('success', 'Banner updated.');
    }

    public function destroyBanner(Banner $banner)
    {
        $banner->delete();

        return redirect()->back()->with('success', 'Banner deleted.');
    }

    private function validateBanner(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|string|max:2048',
            'button_text' => 'nullable|string|max:100',
            'link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);
    }
}
