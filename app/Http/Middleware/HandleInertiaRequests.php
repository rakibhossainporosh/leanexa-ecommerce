<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currencies = \App\Models\Currency::where('is_active', true)->get();

        if (!session()->has('user_country')) {
            $countryCode = 'US'; // default
            try {
                $ip = $request->ip();
                if ($ip !== '127.0.0.1' && $ip !== '::1') {
                    $countryCode = $request->header('CF-IPCountry');
                    if (!$countryCode) {
                        $response = \Illuminate\Support\Facades\Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=countryCode");
                        if ($response->successful()) {
                            $countryCode = $response->json('countryCode');
                        }
                    }
                }
            } catch (\Exception $e) {}
            session(['user_country' => $countryCode ?: 'US']);
        }
        $userCountry = session('user_country', 'US');

        if (!session()->has('currency_auto_set') && !session()->has('currency')) {
            $currencyCode = $userCountry === 'BD' ? 'BDT' : 'USD';
            session(['currency' => $currencyCode, 'currency_auto_set' => true]);
        }

        $selectedCurrency = session('currency', 'USD');
        $activeCurrency = $currencies->where('code', $selectedCurrency)->first() ?? $currencies->first();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'userCountry' => $userCountry,
            // Only public-facing keys: never leak credentials (e.g. SMTP) here.
            'general_settings' => \Illuminate\Support\Arr::only(\App\Models\Setting::general(), [
                'store_name', 'store_email', 'store_phone', 'store_address',
                'delivery_inside_dhaka', 'delivery_outside_dhaka', 'delivery_usa', 'tax_rate', 'shipping_details',
                'logo_url', 'favicon_url', 'logo_height_desktop', 'logo_height_mobile', 'theme_color', 'facebook_link', 'youtube_link', 'instagram_link',
                'order_prefix', 'invoice_prefix',
            ]),
            'categories' => \App\Models\Category::whereNull('parent_id')->with('children')->get(),
            'auth' => [
                'user' => $request->is('admin*')
                    ? (Auth::guard('admin')->check()
                        ? Auth::guard('admin')->user()->toArray()
                        : null)
                    : (Auth::guard('web')->check() ? Auth::guard('web')->user()->toArray() : null),
            ],
            'adminNotifications' => fn () => $request->is('admin*') && Auth::guard('admin')->check()
                ? [
                    'unread' => Auth::guard('admin')->user()->unreadNotifications()->count(),
                    'items' => Auth::guard('admin')->user()->notifications()->latest()->take(10)->get()->map(fn ($n) => [
                        'id' => $n->id,
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at->diffForHumans(),
                    ]),
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currencies' => $currencies,
            'activeCurrency' => $activeCurrency,
            // Guard against non-Customer models on the web guard (e.g. in tests).
            'wishlistCount' => Auth::guard('web')->user() instanceof \App\Models\Customer
                ? Auth::guard('web')->user()->wishlistedProducts()->count() : 0,
            'wishlistItems' => Auth::guard('web')->user() instanceof \App\Models\Customer
                ? Auth::guard('web')->user()->wishlistedProducts()->pluck('products.id') : [],
            'cartCount' => app(\App\Services\CartService::class)->getCartCount(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
