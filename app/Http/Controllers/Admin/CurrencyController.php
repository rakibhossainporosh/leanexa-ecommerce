<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Currency;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function index()
    {
        $currencies = Currency::all();
        return Inertia::render('admin/currencies/index', [
            'currencies' => $currencies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:currencies,code|max:10',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0.0001',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            Currency::where('id', '>', 0)->update(['is_default' => false]);
            $validated['is_default'] = true;
        } else {
            $validated['is_default'] = false;
        }

        Currency::create($validated);

        return redirect()->back()->with('success', 'Currency added successfully.');
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:currencies,code,'.$currency->id,
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0.0001',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
            $validated['is_default'] = true;
        } else {
            if ($currency->is_default && Currency::where('is_default', true)->count() <= 1) {
                return redirect()->back()->with('error', 'There must be at least one default currency.');
            }
            $validated['is_default'] = false;
        }

        $currency->update($validated);

        return redirect()->back()->with('success', 'Currency updated successfully.');
    }

    public function destroy(Currency $currency)
    {
        if ($currency->is_default) {
            return redirect()->back()->with('error', 'Cannot delete default currency.');
        }

        $currency->delete();
        return redirect()->back()->with('success', 'Currency deleted.');
    }
}
