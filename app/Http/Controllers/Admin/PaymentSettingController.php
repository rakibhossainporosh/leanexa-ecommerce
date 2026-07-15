<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/payment-settings/index', [
            'settings' => Setting::payment(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'nullable|string|max:255',
            'store_password' => 'nullable|string|max:255',
            'is_sandbox' => 'required|boolean',
        ]);

        Setting::set('payment_settings', $validated);

        return redirect()->back()->with('success', 'Payment settings saved successfully.');
    }
}
