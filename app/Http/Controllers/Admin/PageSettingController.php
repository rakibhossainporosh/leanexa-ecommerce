<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/page-settings/index', [
            'pages' => Setting::pages(),
            'customPages' => \App\Models\CustomPage::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_subtitle' => 'nullable|string|max:500',
            'contact_location' => 'nullable|string|max:500',
            'contact_phone' => 'nullable|string|max:255',
            'contact_email' => 'nullable|string|max:255',
            'about_intro' => 'nullable|string',
            'about_features' => 'nullable|array|max:6',
            'about_features.*.title' => 'required|string|max:255',
            'about_features.*.description' => 'required|string|max:1000',
            'our_story' => 'nullable|string',
            'returns_refunds' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'shipping_policy' => 'nullable|string',
            'return_policy' => 'nullable|string',
            'warranty_policy' => 'nullable|string',
            'register_heading' => 'nullable|string|max:255',
            'register_subtitle' => 'nullable|string|max:500',
            'register_benefits' => 'nullable|array|max:6',
            'register_benefits.*' => 'required|string|max:255',
            'login_heading' => 'nullable|string|max:255',
            'login_subtitle' => 'nullable|string|max:500',
            'login_benefits' => 'nullable|array|max:6',
            'login_benefits.*' => 'required|string|max:255',
            'faq' => 'nullable|array',
            'faq.*.question' => 'required|string',
            'faq.*.answer' => 'required|string',
        ]);

        Setting::set('page_settings', $validated);

        return redirect()->back()->with('success', 'Page settings updated successfully.');
    }
}
