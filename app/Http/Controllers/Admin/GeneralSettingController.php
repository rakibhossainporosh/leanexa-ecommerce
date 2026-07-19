<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GeneralSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/general-settings/index', [
            'settings' => Setting::general(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_email' => 'required|email|max:255',
            'store_phone' => 'nullable|string|max:50',
            'store_address' => 'nullable|string|max:1000',
            'delivery_inside_dhaka' => 'required|numeric|min:0',
            'delivery_outside_dhaka' => 'required|numeric|min:0',
            'delivery_usa' => 'nullable|numeric|min:0',
            'shipping_details' => 'nullable|string|max:2000',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'favicon' => 'nullable|file|mimes:ico,png,svg,jpg,jpeg,webp|max:1024',
            'logo_height_desktop' => 'nullable|numeric|min:10|max:200',
            'logo_height_mobile' => 'nullable|numeric|min:10|max:150',
            'theme_color' => ['nullable', 'string', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
            'facebook_link' => 'nullable|url|max:255',
            'twitter_link' => 'nullable|url|max:255',
            'instagram_link' => 'nullable|url|max:255',
            'smtp_email' => 'nullable|email|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'official_smtp_email' => 'nullable|email|max:255',
            'official_smtp_password' => 'nullable|string|max:255',
            'primary_mailer' => 'nullable|string|in:gmail,hostinger',
            'admin_notification_emails' => 'nullable|string|max:2000',
            'abandoned_cart_enabled' => 'boolean',
            'abandoned_cart_timeout_hours' => 'required|integer|min:0',
            'abandoned_cart_discount_type' => 'required|string|in:none,percentage,fixed',
            'abandoned_cart_discount_value' => 'required|numeric|min:0',
        ]);

        $currentSettings = Setting::general();

        if ($request->hasFile('logo')) {
            if (!empty($currentSettings['logo_url'])) {
                $oldPath = str_replace('/storage/', '', $currentSettings['logo_url']);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('settings', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        } else {
            $validated['logo_url'] = $currentSettings['logo_url'] ?? '';
        }
        
        if ($request->hasFile('favicon')) {
            if (!empty($currentSettings['favicon_url'])) {
                $oldPath = str_replace('/storage/', '', $currentSettings['favicon_url']);
                Storage::disk('public')->delete($oldPath);
            }
            $file = $request->file('favicon');
            $path = $file->store('settings', 'public');
            $validated['favicon_url'] = '/storage/' . $path;
            
            // Also copy to public/favicon.ico for global fallback (like raw PDF views)
            try {
                \Illuminate\Support\Facades\File::copy($file->getRealPath(), public_path('favicon.ico'));
            } catch (\Exception $e) {}
            
        } else {
            $validated['favicon_url'] = $currentSettings['favicon_url'] ?? '';
        }
        
        unset($validated['logo']);
        unset($validated['favicon']);

        Setting::set('general_settings', $validated);

        return redirect()->back()->with('success', 'General shop settings saved successfully.');
    }
}
