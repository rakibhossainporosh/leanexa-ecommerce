<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomPage;
use Illuminate\Http\Request;

class CustomPageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'is_active' => 'boolean',
            'show_in_footer' => 'boolean',
            'footer_section' => 'required|string|in:company,shop,information',
        ]);

        $validated['slug'] = CustomPage::uniqueSlug($validated['slug'] ?: $validated['title']);

        CustomPage::create($validated);

        return redirect()->back()->with('success', 'Page created successfully.');
    }

    public function update(Request $request, CustomPage $customPage)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'is_active' => 'boolean',
            'show_in_footer' => 'boolean',
            'footer_section' => 'required|string|in:company,shop,information',
        ]);

        $validated['slug'] = CustomPage::uniqueSlug($validated['slug'] ?: $validated['title'], $customPage->id);

        $customPage->update($validated);

        return redirect()->back()->with('success', 'Page updated successfully.');
    }

    public function destroy(CustomPage $customPage)
    {
        $customPage->delete();

        return redirect()->back()->with('success', 'Page deleted successfully.');
    }
}
