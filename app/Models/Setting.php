<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'array',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Default landing-page content, merged over any saved values.
     *
     * @return array<string, mixed>
     */
    public static function landingDefaults(): array
    {
        return [
            'hero_enabled' => true,
            'featured_title' => 'Featured Products',
            'featured_subtitle' => 'Handpicked electronics loved by our customers.',
            'promo_enabled' => true,
            'promo_eyebrow' => 'Limited Time Offer',
            'promo_title' => 'Mega Electronics Sale — up to 40% off',
            'promo_subtitle' => "Upgrade your gear with unbeatable deals on the season's hottest tech.",
            'promo_button_text' => 'Shop the Sale',
            'promo_link' => '/products',
            'brands_enabled' => true,
            'brands_title' => 'Top Brands',
            'services' => [
                ['icon' => 'Truck', 'title' => 'Free Shipping', 'desc' => 'On orders over $50'],
                ['icon' => 'CreditCard', 'title' => 'Secure Payment', 'desc' => '100% protected'],
                ['icon' => 'RefreshCw', 'title' => 'Easy Returns', 'desc' => '30-day guarantee'],
                ['icon' => 'ShieldCheck', 'title' => '2-Year Warranty', 'desc' => 'On all products'],
            ],
            'promo_tiles' => [
                [
                    'eyebrow' => 'New Technologies',
                    'title' => 'Webcams 2024',
                    'img' => 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?q=80&w=800&auto=format&fit=crop',
                    'link' => '/products',
                ],
                [
                    'eyebrow' => 'Best Sound',
                    'title' => 'Wireless Buds',
                    'img' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
                    'link' => '/products',
                ],
                [
                    'eyebrow' => 'Apple Accessories',
                    'title' => 'Leather Cases',
                    'img' => 'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=800&auto=format&fit=crop',
                    'link' => '/products',
                ]
            ],
        ];
    }

    /**
     * Landing settings with defaults applied for any missing keys.
     *
     * @return array<string, mixed>
     */
    public static function landing(): array
    {
        return array_merge(static::landingDefaults(), static::get('landing', []) ?? []);
    }

    /**
     * Default general settings content.
     *
     * @return array<string, mixed>
     */
    public static function generalDefaults(): array
    {
        return [
            'store_name' => 'EShop',
            'store_email' => 'support@eshop.com',
            'store_phone' => '+880 1234 567890',
            'store_address' => 'Dhaka, Bangladesh',
            'footer_description' => 'Your one-stop shop for premium electronics, gadgets and accessories — delivered fast, right to your door.',
            'footer_copyright' => '© {year} {store}. All Rights Reserved.',
            'delivery_inside_dhaka' => 60,
            'delivery_outside_dhaka' => 120,
            'delivery_usa' => 0,
            'tax_rate' => 0,
            'logo_url' => '',
            'logo_height_desktop' => '40',
            'logo_height_mobile' => '32',
            'theme_color' => '#2b59ff',
            'facebook_link' => '',
            'youtube_link' => '',
            'instagram_link' => '',
            'abandoned_cart_enabled' => false,
            'abandoned_cart_timeout_hours' => 24,
            'abandoned_cart_discount_type' => 'none',
            'abandoned_cart_discount_value' => 0,
            'admin_notification_emails' => '',
            'order_prefix' => 'ORD',
            'invoice_prefix' => 'INV',
            'shipping_details' => "Standard Delivery:\nOrders within Bangladesh are typically delivered within 24 to 48 hours.\n\nInternational Shipping:\nFor international orders, please allow 7-10 business days for delivery depending on the destination.\n\nNote: Shipping times may vary during public holidays and peak seasons.",
        ];
    }

    /**
     * General settings with defaults applied.
     *
     * @return array<string, mixed>
     */
    public static function general(): array
    {
        return array_merge(static::generalDefaults(), static::get('general_settings', []) ?? []);
    }

    /**
     * The admin addresses that should be copied on every payment, entered in the
     * panel one-per-line or comma-separated. Only well-formed emails survive.
     *
     * @return array<int, string>
     */
    public static function adminNotificationEmails(): array
    {
        $raw = static::general()['admin_notification_emails'] ?? '';

        return collect(preg_split('/[\s,]+/', (string) $raw))
            ->map(fn ($e) => trim($e))
            ->filter(fn ($e) => $e !== '' && filter_var($e, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Default payment settings.
     *
     * @return array<string, mixed>
     */
    public static function paymentDefaults(): array
    {
        return [
            'store_id' => config('sslcommerz.store_id', ''),
            'store_password' => config('sslcommerz.store_password', ''),
            'is_sandbox' => config('sslcommerz.sandbox', true),
        ];
    }

    /**
     * Payment settings with defaults applied.
     *
     * @return array<string, mixed>
     */
    public static function payment(): array
    {
        return array_merge(static::paymentDefaults(), static::get('payment_settings', []) ?? []);
    }

    /**
     * Default page contents.
     *
     * @return array<string, mixed>
     */
    public static function pageDefaults(): array
    {
        return [
            'contact_subtitle' => "We'd love to hear from you. Please reach out with any questions or feedback.",
            'contact_location' => "123 E-commerce St.\nTech City, TC 10101",
            'contact_phone' => "+880 1234 567890\nMon-Fri, 9am-6pm",
            'contact_email' => "support@eshop.com\ncontact@eshop.com",
            'about_intro' => '<p>Welcome to EShop. We are dedicated to providing you with the best electronics, gadgets, and accessories. Our mission is to bring high-quality tech products directly to your door with exceptional customer service.</p>',
            'about_features' => [
                ['title' => 'Quality First', 'description' => 'We ensure all our products meet strict quality standards.'],
                ['title' => 'Fast Delivery', 'description' => 'Get your orders delivered to you as fast as possible.'],
                ['title' => '24/7 Support', 'description' => 'Our team is always ready to assist you anytime.'],
            ],
            'our_story' => '<p>Welcome to our store. We started with a simple idea: to provide high-quality products at accessible prices.</p><p>Over the years, our passion for excellence has driven us from the beginning and continues to drive us into the future. The team knows that every product counts, and strives to make the entire shopping experience as rewarding and fun as possible.</p><p>Check out our store and special offers, and get in touch with questions or requests. We are always happy to help!</p>',
            'returns_refunds' => '<section><h2>Return Policy</h2><p>We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.</p><p>To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.</p></section><section><h2>Refunds</h2><p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p></section><section><h2>Exchanges</h2><p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p></section>',
            'privacy_policy' => '<p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.</p>',
            'terms_conditions' => '<p>By visiting our site and/ or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>',
            'shipping_policy' => '<p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email.</p>',
            'return_policy' => '<p>We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.</p>',
            'warranty_policy' => '<p>Our products come with a standard 1-year warranty against manufacturing defects.</p>',
            'register_heading' => 'Create your account.',
            'register_subtitle' => 'Join thousands of shoppers and unlock a faster, more personal way to buy.',
            'register_benefits' => [
                'Exclusive member pricing',
                'Save addresses & track orders',
                'Your data stays protected',
            ],
            'login_heading' => 'Welcome back to your store.',
            'login_subtitle' => 'Track orders, manage your wishlist and check out faster — all in one place.',
            'login_benefits' => [
                'Secure, encrypted checkout',
                'Real-time order tracking',
                'Members-only deals',
            ],
            'faq' => [
                [
                    'question' => 'How long does shipping take?',
                    'answer' => 'Shipping times vary depending on your location. Generally, orders are processed within 1-2 business days and delivery takes 3-5 business days for domestic orders.'
                ],
                [
                    'question' => 'Do you ship internationally?',
                    'answer' => 'Currently, we only ship within the country. We are working on expanding our shipping options to international destinations in the near future.'
                ],
                [
                    'question' => 'How can I track my order?',
                    'answer' => 'Once your order has shipped, you will receive an email with a tracking number. You can also track your order directly from the "Track Order" link in the footer or mobile navigation menu.'
                ],
                [
                    'question' => 'What payment methods do you accept?',
                    'answer' => 'We accept all major credit cards (Visa, MasterCard, American Express), mobile banking (bKash, Nagad), and cash on delivery (COD) depending on your location.'
                ]
            ],
        ];
    }

    /**
     * Page settings with defaults applied.
     *
     * @return array<string, mixed>
     */
    public static function pages(): array
    {
        return array_merge(static::pageDefaults(), static::get('page_settings', []) ?? []);
    }
}
