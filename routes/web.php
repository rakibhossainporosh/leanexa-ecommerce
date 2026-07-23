<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\ProductController::class, 'index'])->name('home');

Route::post('/currency', function (\Illuminate\Http\Request $request) {
    $request->validate(['currency' => 'required|exists:currencies,code']);
    session(['currency' => $request->currency]);
    return back();
})->name('currency.change');

// Clear Cache for Live Server (cPanel)
Route::get('/clear-cache', function () {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    return 'Cache cleared successfully! You can now go back to your website.';
});

Route::get('/sync-favicon', function () {
    $settings = \App\Models\Setting::general();
    if (!empty($settings['favicon_url'])) {
        $sourcePath = public_path(str_replace('/storage/', 'storage/', $settings['favicon_url']));
        
        $destinations = [
            public_path('favicon.ico'),
            isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/favicon.ico' : null,
            base_path('../public_html/favicon.ico'),
        ];
        
        $success = false;
        $errors = [];
        foreach (array_filter($destinations) as $dest) {
            try {
                if (file_exists($sourcePath)) {
                    \Illuminate\Support\Facades\File::copy($sourcePath, $dest);
                    $success = true;
                }
            } catch (\Exception $e) {
                $errors[] = $dest . ': ' . $e->getMessage();
            }
        }
        return $success ? 'Favicon synced successfully to root! Hard refresh your browser.' : 'Failed to sync. Source exists? ' . (file_exists($sourcePath) ? 'Yes' : 'No') . ' Errors: ' . json_encode($errors);
    }
    return 'No custom favicon found in settings.';
});

// ============================================================================
// TEMPORARY one-time fresh-install trigger for handover. Wipes the ENTIRE
// database and re-seeds only the admin account. Protected by a long random
// token. DELETE THIS ROUTE immediately after it has been used once.
// ============================================================================
Route::get('/setup-fresh/d04ae3d575840676385693f83557b587da3e1187f21eebdc', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');

    return response(
        'Fresh install complete. Admin login: admin@example.com / password. '
        . 'NOW: (1) change the admin password, (2) add currencies, (3) remove this route.'
    );
});

// Customer Routes
Route::get('/about', function () {
    $pages = \App\Models\Setting::pages();

    return inertia('about', [
        'intro' => $pages['about_intro'] ?? '',
        'features' => $pages['about_features'] ?? [],
    ]);
})->name('about');
Route::get('/contact', function () {
    $pages = \App\Models\Setting::pages();

    return inertia('contact', [
        'contact' => [
            'subtitle' => $pages['contact_subtitle'] ?? '',
            'location' => $pages['contact_location'] ?? '',
            'phone' => $pages['contact_phone'] ?? '',
            'email' => $pages['contact_email'] ?? '',
        ],
    ]);
})->name('contact');

Route::post('/contact/message', [\App\Http\Controllers\ContactController::class, 'store'])
    ->middleware('throttle:10,1')->name('contact.store');
Route::get('/our-story', function () { 
    return inertia('our-story', ['page_data' => \App\Models\Setting::pages()['our_story']]); 
})->name('our-story');
Route::get('/returns-refunds', function () { 
    return inertia('returns-refunds', ['page_data' => \App\Models\Setting::pages()['returns_refunds']]); 
})->name('returns-refunds');
Route::get('/faq', function () { 
    return inertia('faq', ['page_data' => \App\Models\Setting::pages()['faq']]); 
})->name('faq');

Route::get('/privacy-policy', function () { 
    return inertia('info-page', ['title' => 'Privacy Policy', 'content' => \App\Models\Setting::pages()['privacy_policy']]); 
})->name('privacy-policy');
Route::get('/terms-conditions', function () { 
    return inertia('info-page', ['title' => 'Terms & Conditions', 'content' => \App\Models\Setting::pages()['terms_conditions']]); 
})->name('terms-conditions');
Route::get('/shipping-policy', function () { 
    return inertia('info-page', ['title' => 'Shipping Policy', 'content' => \App\Models\Setting::pages()['shipping_policy']]); 
})->name('shipping-policy');
Route::get('/return-policy', function () { 
    return inertia('info-page', ['title' => 'Return Policy', 'content' => \App\Models\Setting::pages()['return_policy']]); 
})->name('return-policy');
Route::get('/warranty-policy', function () { 
    return inertia('info-page', ['title' => 'Warranty Policy', 'content' => \App\Models\Setting::pages()['warranty_policy']]); 
})->name('warranty-policy');

// Admin-created custom pages.
Route::get('/page/{slug}', function (string $slug) {
    $page = \App\Models\CustomPage::where('slug', $slug)->where('is_active', true)->firstOrFail();

    return inertia('custom-page', ['title' => $page->title, 'content' => $page->content]);
})->name('custom-page');

Route::get('/track-order', [\App\Http\Controllers\TrackOrderController::class, 'index'])->name('track.order');

Route::get('/search-suggestions', [\App\Http\Controllers\ProductController::class, 'suggestions'])->name('search.suggestions');
Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/products/section/{id}', [\App\Http\Controllers\ProductController::class, 'section'])->name('products.section');
Route::get('/products/{slug}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');

Route::get('/brands', [\App\Http\Controllers\ProductController::class, 'brands'])->name('brands.index');

// Cart Routes
Route::get('/cart', [\App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/cart/add', [\App\Http\Controllers\CartController::class, 'add'])->name('cart.add');
    Route::put('/cart/{item}', [\App\Http\Controllers\CartController::class, 'updateQuantity'])->name('cart.update');
    Route::delete('/cart/coupon', [\App\Http\Controllers\CartController::class, 'removeCoupon'])->name('cart.coupon.remove');
    Route::delete('/cart/{item}', [\App\Http\Controllers\CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/sync-guest', [\App\Http\Controllers\CartController::class, 'syncGuest'])->name('cart.sync-guest');
});

// Tighter limit on coupon application to prevent code brute-forcing.
Route::post('/cart/coupon', [\App\Http\Controllers\CartController::class, 'applyCoupon'])
    ->middleware('throttle:10,1')->name('cart.coupon.apply');

// Checkout Routes
Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'process'])
    ->middleware('throttle:20,1')->name('checkout.process');
Route::get('/checkout/success/{order_number}', [\App\Http\Controllers\CheckoutController::class, 'success'])->name('checkout.success');
Route::post('/checkout/retry/{order}', [\App\Http\Controllers\CheckoutController::class, 'retryPayment'])->name('checkout.retry');

// Public homepage layout (active sections + server-resolved products)
Route::get('/frontend/home-layout', [\App\Http\Controllers\HomeLayoutController::class, 'index'])->name('home.layout');

// Custom Invoice Public Routes
Route::get('/invoice/{uuid}', [\App\Http\Controllers\PublicInvoiceController::class, 'show'])->name('invoice.show');
Route::post('/invoice/{uuid}/pay', [\App\Http\Controllers\PublicInvoiceController::class, 'pay'])
    ->middleware('throttle:10,1')->name('invoice.pay');

// Payment Routes
Route::post('/payment/success', [\App\Http\Controllers\PaymentController::class, 'success'])->name('sslcommerz.success');
Route::post('/payment/fail', [\App\Http\Controllers\PaymentController::class, 'fail'])->name('sslcommerz.fail');
Route::post('/payment/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('sslcommerz.cancel');
Route::post('/payment/ipn', [\App\Http\Controllers\PaymentController::class, 'ipn'])->name('sslcommerz.ipn');

Route::middleware(['auth', 'verified'])->group(function () {
    // Wishlist Routes
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product}', [\App\Http\Controllers\WishlistController::class, 'toggle'])->name('wishlist.toggle');

    // Customer Account Routes (SPA-navigable Inertia pages)
    Route::get('/account', [\App\Http\Controllers\AccountController::class, 'index'])->name('account');
    Route::get('/orders', [\App\Http\Controllers\AccountController::class, 'orders'])->name('orders');

    // Central post-login funnel for customers.
    // Fortify's `home` still points here, so customers land in their account area.
    Route::get('dashboard', function () {
        return redirect()->route('orders');
    })->name('dashboard');
});

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('login', function () {
            // Only an already-authenticated ADMIN is sent to the admin dashboard.
            if (auth()->guard('admin')->check()) {
                return redirect()->route('admin.dashboard');
            }

            return inertia('auth/admin-login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => session('status'),
            ]);
        })->withoutMiddleware(['auth', 'verified'])->name('login');

        Route::post('login', [\App\Http\Controllers\Admin\AdminAuthController::class, 'store'])
            ->withoutMiddleware(['auth', 'verified'])
            ->middleware('throttle:10,1')
            ->name('login.post');
        Route::post('logout', [\App\Http\Controllers\Admin\AdminAuthController::class, 'destroy'])->withoutMiddleware(['auth', 'verified'])->name('logout');

        Route::middleware(['auth:admin'])->group(function () {
            Route::get('dashboard', function () {
                // Revenue = orders that are completed OR paid. Grouped so the OR
                // never leaks past the date filters used for the month comparison.
                $paid = fn ($q) => $q->where('status', 'completed')->orWhere('payment_status', 'paid');

                $totalSales = \App\Models\Order::where($paid)->sum('total_amount');

                $thisMonthStart = now()->startOfMonth();
                $lastMonthStart = now()->subMonthNoOverflow()->startOfMonth();

                $thisMonthSales = \App\Models\Order::where($paid)
                    ->where('created_at', '>=', $thisMonthStart)
                    ->sum('total_amount');
                $lastMonthSales = \App\Models\Order::where($paid)
                    ->where('created_at', '>=', $lastMonthStart)
                    ->where('created_at', '<', $thisMonthStart)
                    ->sum('total_amount');

                // Real month-over-month change. When last month had no sales we
                // can't compute a ratio, so report +100% if there are sales now,
                // otherwise 0%.
                $salesChange = $lastMonthSales > 0
                    ? (int) round((($thisMonthSales - $lastMonthSales) / $lastMonthSales) * 100)
                    : ($thisMonthSales > 0 ? 100 : 0);

                $pendingOrdersCount = \App\Models\Order::where('status', 'pending')->count();
                $recentOrders = \App\Models\Order::with('customer')->latest()->take(5)->get();

                return inertia('dashboard', [
                    'metrics' => [
                        'totalSales' => $totalSales,
                        'pendingOrders' => $pendingOrdersCount,
                        'salesChange' => $salesChange,
                    ],
                    'recentOrders' => $recentOrders,
                ]);
            })->name('dashboard');

            Route::post('notifications/mark-read', function () {
                auth()->guard('admin')->user()->unreadNotifications->markAsRead();

                return back();
            })->name('notifications.mark-read');

            Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class)->except(['create', 'show', 'edit']);
            Route::resource('tags', \App\Http\Controllers\Admin\TagController::class)->except(['create', 'show', 'edit']);
            Route::resource('brands', \App\Http\Controllers\Admin\BrandController::class)->except(['create', 'show', 'edit']);
            Route::get('products-data', [\App\Http\Controllers\Admin\ProductController::class, 'data'])->name('products.data');
            Route::resource('products', \App\Http\Controllers\Admin\ProductController::class)->except(['show']);
            Route::resource('currencies', \App\Http\Controllers\Admin\CurrencyController::class)->except(['create', 'show', 'edit']);
            Route::resource('messages', \App\Http\Controllers\Admin\ContactMessageController::class)->only(['index', 'update', 'destroy']);
            Route::get('customers-data', [\App\Http\Controllers\Admin\CustomerController::class, 'data'])->name('customers.data');
            Route::resource('customers', \App\Http\Controllers\Admin\CustomerController::class)->only(['index', 'show', 'destroy']);
            Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::get('invoices-search-products', [\App\Http\Controllers\Admin\CustomInvoiceController::class, 'searchProducts'])->name('invoices.search-products');
            Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\Admin\CustomInvoiceController::class, 'pdf'])->name('invoices.pdf');
            Route::resource('invoices', \App\Http\Controllers\Admin\CustomInvoiceController::class)->except(['show', 'edit']);
            Route::resource('coupons', \App\Http\Controllers\Admin\CouponController::class)->except(['create', 'show', 'edit']);
            Route::get('orders-data', [\App\Http\Controllers\Admin\OrderController::class, 'data'])->name('orders.data');
            Route::get('orders/{order}/invoice', [\App\Http\Controllers\Admin\OrderController::class, 'invoice'])->name('orders.invoice');
            Route::resource('orders', \App\Http\Controllers\Admin\OrderController::class)->only(['index', 'show', 'update', 'destroy']);
            Route::resource('abandoned-carts', \App\Http\Controllers\Admin\AbandonedCartController::class)
                ->only(['index', 'destroy'])
                ->parameters(['abandoned-carts' => 'cart']);
            Route::get('sales-report', [\App\Http\Controllers\Admin\SalesReportController::class, 'index'])->name('sales-report');

            // Home Page Layout CMS
            Route::put('home-sections-reorder', [\App\Http\Controllers\Admin\HomeSectionController::class, 'reorder'])->name('home-sections.reorder');
            Route::post('home-sections/{homeSection}/products', [\App\Http\Controllers\Admin\HomeSectionController::class, 'attachProduct'])->name('home-sections.products.attach');
            Route::put('home-sections/{homeSection}/products-reorder', [\App\Http\Controllers\Admin\HomeSectionController::class, 'reorderProducts'])->name('home-sections.products.reorder');
            Route::delete('home-sections/{homeSection}/products/{product}', [\App\Http\Controllers\Admin\HomeSectionController::class, 'detachProduct'])->name('home-sections.products.detach');
            Route::resource('home-sections', \App\Http\Controllers\Admin\HomeSectionController::class)->except(['create', 'show', 'edit']);

            // General Shop Settings
            Route::get('general-settings', [\App\Http\Controllers\Admin\GeneralSettingController::class, 'index'])->name('general-settings.index');
            Route::put('general-settings', [\App\Http\Controllers\Admin\GeneralSettingController::class, 'update'])->name('general-settings.update');
            Route::get('test-email', function () {
                try {
                    $userEmail = 'rakibhossainporosh@gmail.com';
                    \Illuminate\Support\Facades\Mail::raw('This is a test email from the Leanexa Admin panel to verify your SMTP settings. If you received this, your email configuration is working perfectly.', function ($message) use ($userEmail) {
                        $message->to($userEmail)
                                ->subject('SMTP Test - Leanexa');
                    });
                    return "Test email sent successfully to {$userEmail}!";
                } catch (\Exception $e) {
                    return "Error sending email: " . $e->getMessage();
                }
            });

            Route::get('create-storage-link', function () {
                try {
                    $publicStorage = public_path('storage');
                    $storageAppPublic = storage_path('app/public');
                    
                    $output = "<b>Path Info:</b><br>";
                    $output .= "public_path('storage'): " . $publicStorage . "<br>";
                    $output .= "storage_path('app/public'): " . $storageAppPublic . "<br><br>";
                    
                    if (file_exists($publicStorage)) {
                        $output .= "<b>Status:</b> A file or folder already exists at public/storage.<br>";
                        if (is_link($publicStorage)) {
                            $output .= "It is a symlink pointing to: " . readlink($publicStorage) . "<br>";
                            unlink($publicStorage);
                            $output .= "Old symlink deleted.<br>";
                        } else {
                            $output .= "It is a normal folder, NOT a symlink. This is usually bad. Renaming it...<br>";
                            rename($publicStorage, $publicStorage . '_backup_' . time());
                        }
                    }
                    
                    symlink($storageAppPublic, $publicStorage);
                    $output .= "<br><b>Action:</b> New Symlink created manually via PHP!<br>";
                    
                    // Check if favicon exists
                    $settings = \App\Models\Setting::general();
                    if (!empty($settings['favicon_url'])) {
                        $faviconPath = str_replace('/storage/', '', $settings['favicon_url']);
                        $fullPath = $storageAppPublic . '/' . $faviconPath;
                        $output .= "<br><b>Favicon Check:</b><br>";
                        $output .= "DB URL: " . $settings['favicon_url'] . "<br>";
                        $output .= "Checking physical file at: " . $fullPath . "<br>";
                        if (file_exists($fullPath)) {
                            $output .= "<span style='color:green'>The favicon file EXISTS on the server!</span><br>";
                        } else {
                            $output .= "<span style='color:red'>The favicon file DOES NOT EXIST on the server! You need to upload it again.</span><br>";
                        }
                    }
                    
                    return $output;
                } catch (\Exception $e) {
                    return 'Error: ' . $e->getMessage() . '<br>File: ' . $e->getFile() . ' Line: ' . $e->getLine();
                }
            });

            // Payment Settings
            Route::get('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'index'])->name('payment-settings.index');
            Route::put('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'update'])->name('payment-settings.update');

            // Landing Page Customization
            Route::get('landing', [\App\Http\Controllers\Admin\LandingController::class, 'index'])->name('landing.index');
            Route::put('landing', [\App\Http\Controllers\Admin\LandingController::class, 'update'])->name('landing.update');
            Route::post('landing/banners', [\App\Http\Controllers\Admin\LandingController::class, 'storeBanner'])->name('landing.banners.store');
            Route::put('landing/banners/{banner}', [\App\Http\Controllers\Admin\LandingController::class, 'updateBanner'])->name('landing.banners.update');
            Route::delete('landing/banners/{banner}', [\App\Http\Controllers\Admin\LandingController::class, 'destroyBanner'])->name('landing.banners.destroy');

            // Page Settings
            Route::get('page-settings', [\App\Http\Controllers\Admin\PageSettingController::class, 'index'])->name('page-settings.index');
            Route::put('page-settings', [\App\Http\Controllers\Admin\PageSettingController::class, 'store'])->name('page-settings.update');
            Route::resource('custom-pages', \App\Http\Controllers\Admin\CustomPageController::class)->only(['store', 'update', 'destroy']);

            // Media Library
            Route::get('media', [\App\Http\Controllers\Admin\MediaController::class, 'index'])->name('media.index');
            Route::get('media-list', [\App\Http\Controllers\Admin\MediaController::class, 'list'])->name('media.list');
            Route::post('media', [\App\Http\Controllers\Admin\MediaController::class, 'store'])->name('media.store');
            Route::put('media/{medium}', [\App\Http\Controllers\Admin\MediaController::class, 'update'])->name('media.update');
            Route::delete('media/{medium}', [\App\Http\Controllers\Admin\MediaController::class, 'destroy'])->name('media.destroy');
        });
    });

// Custom logout to prevent invalidating admin session
Route::post('/logout', [\App\Http\Controllers\AccountController::class, 'logout'])->name('logout');

require __DIR__.'/settings.php';