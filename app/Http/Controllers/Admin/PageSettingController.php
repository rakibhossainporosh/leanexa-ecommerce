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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'our_story' => 'nullable|string',
            'returns_refunds' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'shipping_policy' => 'nullable|string',
            'return_policy' => 'nullable|string',
            'warranty_policy' => 'nullable|string',
            'faq' => 'nullable|array',
            'faq.*.question' => 'required|string',
            'faq.*.answer' => 'required|string',
        ]);

        Setting::set('page_settings', $validated);

        return redirect()->back()->with('success', 'Page settings updated successfully.');
    }
}
