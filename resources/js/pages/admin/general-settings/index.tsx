import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Mail, Palette, Share2, ShoppingCart, Store, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneralSettingsIndex({ settings }: { settings: any }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        store_name: settings.store_name || '',
        store_email: settings.store_email || '',
        store_phone: settings.store_phone || '',
        store_address: settings.store_address || '',
        delivery_inside_dhaka: settings.delivery_inside_dhaka || 0,
        delivery_outside_dhaka: settings.delivery_outside_dhaka || 0,
        delivery_usa: settings.delivery_usa || 0,
        shipping_details: settings.shipping_details || '',
        tax_rate: settings.tax_rate || 0,
        logo: null as File | null,
        favicon: null as File | null,
        logo_height_desktop: settings.logo_height_desktop || 40,
        logo_height_mobile: settings.logo_height_mobile || 32,
        theme_color: settings.theme_color || '#2b59ff',
        facebook_link: settings.facebook_link || '',
        twitter_link: settings.twitter_link || '',
        instagram_link: settings.instagram_link || '',
        smtp_email: settings.smtp_email || '',
        smtp_password: settings.smtp_password || '',
        official_smtp_email: settings.official_smtp_email || '',
        official_smtp_password: settings.official_smtp_password || '',
        primary_mailer: settings.primary_mailer || 'gmail',
        admin_notification_emails: settings.admin_notification_emails || '',
        abandoned_cart_enabled: settings.abandoned_cart_enabled ?? false,
        abandoned_cart_timeout_hours: settings.abandoned_cart_timeout_hours || 24,
        abandoned_cart_discount_type: settings.abandoned_cart_discount_type || 'none',
        abandoned_cart_discount_value: settings.abandoned_cart_discount_value || 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/general-settings', {
            onSuccess: () => toast.success('Settings saved successfully.'),
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="General Settings">
            <Head title="General Shop Settings" />

            <div className="mb-6">
                <p className="text-muted-foreground text-sm">Manage core settings for your store like name, contacts, and delivery charges.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* 1. Store Information — who the business is and how customers reach it. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            Store Information
                        </CardTitle>
                        <CardDescription>Your store name and the contact details shown to customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="store_name">Store Name</Label>
                            <Input
                                id="store_name"
                                value={data.store_name}
                                onChange={(e) => setData('store_name', e.target.value)}
                            />
                            {errors.store_name && <p className="text-destructive text-sm">{errors.store_name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="store_email">Contact Email</Label>
                                <Input
                                    id="store_email"
                                    type="email"
                                    value={data.store_email}
                                    onChange={(e) => setData('store_email', e.target.value)}
                                />
                                {errors.store_email && <p className="text-destructive text-sm">{errors.store_email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_phone">Contact Phone</Label>
                                <Input
                                    id="store_phone"
                                    value={data.store_phone}
                                    onChange={(e) => setData('store_phone', e.target.value)}
                                />
                                {errors.store_phone && <p className="text-destructive text-sm">{errors.store_phone}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="store_address">Full Address</Label>
                            <Textarea
                                id="store_address"
                                rows={3}
                                value={data.store_address}
                                onChange={(e) => setData('store_address', e.target.value)}
                            />
                            {errors.store_address && <p className="text-destructive text-sm">{errors.store_address}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Branding — every image and colour that affects how the storefront looks. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            Branding & Appearance
                        </CardTitle>
                        <CardDescription>Logo, favicon, banner and the colour used across your storefront.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo Image</Label>
                                <div className="flex items-center gap-4">
                                    {settings.logo_url && (
                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                                            <img src={settings.logo_url} alt="Logo" className="h-full w-full object-contain" />
                                        </div>
                                    )}
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                        className="flex-1"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 2MB. Recommended size: 500x200px (5:2 wide).</p>
                                {errors.logo && <p className="text-destructive text-sm">{errors.logo}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="favicon">Favicon Image</Label>
                                <div className="flex items-center gap-4">
                                    {settings.favicon_url && (
                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                                            <img src={settings.favicon_url} alt="Favicon" className="h-full w-full object-contain" />
                                        </div>
                                    )}
                                    <Input
                                        id="favicon"
                                        type="file"
                                        accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                                        onChange={(e) => setData('favicon', e.target.files?.[0] || null)}
                                        className="flex-1"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">ICO, PNG, SVG, JPG or WebP. Max 1MB. Recommended size: 32x32px or 64x64px (1:1 square).</p>
                                {errors.favicon && <p className="text-destructive text-sm">{errors.favicon}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="logo_height_desktop">Desktop Logo Height (px)</Label>
                                <Input
                                    id="logo_height_desktop"
                                    type="number"
                                    min="10"
                                    max="200"
                                    value={data.logo_height_desktop}
                                    onChange={(e) => setData('logo_height_desktop', e.target.value)}
                                />
                                {errors.logo_height_desktop && <p className="text-destructive text-sm">{errors.logo_height_desktop}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo_height_mobile">Mobile Logo Height (px)</Label>
                                <Input
                                    id="logo_height_mobile"
                                    type="number"
                                    min="10"
                                    max="150"
                                    value={data.logo_height_mobile}
                                    onChange={(e) => setData('logo_height_mobile', e.target.value)}
                                />
                                {errors.logo_height_mobile && <p className="text-destructive text-sm">{errors.logo_height_mobile}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="theme_color">Primary Theme Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="theme_color_picker"
                                        type="color"
                                        value={data.theme_color}
                                        onChange={(e) => setData('theme_color', e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        id="theme_color"
                                        type="text"
                                        value={data.theme_color}
                                        onChange={(e) => setData('theme_color', e.target.value)}
                                        placeholder="#2b59ff"
                                        className="flex-1 font-mono uppercase"
                                    />
                                </div>
                                {errors.theme_color && <p className="text-destructive text-sm">{errors.theme_color}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Delivery & Tax — charges plus the shipping copy shown on product pages. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            Delivery & Tax
                        </CardTitle>
                        <CardDescription>Delivery charges and tax applied at checkout, and the shipping text customers read.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery_inside_dhaka">Inside Dhaka Charge (৳)</Label>
                                <Input
                                    id="delivery_inside_dhaka"
                                    type="number"
                                    min="0"
                                    value={data.delivery_inside_dhaka}
                                    onChange={(e) => setData('delivery_inside_dhaka', e.target.value)}
                                />
                                {errors.delivery_inside_dhaka && <p className="text-destructive text-sm">{errors.delivery_inside_dhaka}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_outside_dhaka">Outside Dhaka Charge (৳)</Label>
                                <Input
                                    id="delivery_outside_dhaka"
                                    type="number"
                                    min="0"
                                    value={data.delivery_outside_dhaka}
                                    onChange={(e) => setData('delivery_outside_dhaka', e.target.value)}
                                />
                                {errors.delivery_outside_dhaka && <p className="text-destructive text-sm">{errors.delivery_outside_dhaka}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_usa">USA Charge (৳)</Label>
                                <Input
                                    id="delivery_usa"
                                    type="number"
                                    min="0"
                                    value={data.delivery_usa}
                                    onChange={(e) => setData('delivery_usa', e.target.value)}
                                />
                                {errors.delivery_usa && <p className="text-destructive text-sm">{errors.delivery_usa}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                <Input
                                    id="tax_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.tax_rate}
                                    onChange={(e) => setData('tax_rate', e.target.value)}
                                />
                                {errors.tax_rate && <p className="text-destructive text-sm">{errors.tax_rate}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="shipping_details">Shipping Details</Label>
                            <p className="text-muted-foreground text-xs">Shown to customers on every product page.</p>
                            <Textarea
                                id="shipping_details"
                                value={data.shipping_details}
                                onChange={(e) => setData('shipping_details', e.target.value)}
                                rows={6}
                                placeholder="Enter shipping details..."
                            />
                            {errors.shipping_details && <p className="text-destructive text-sm">{errors.shipping_details}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Email — both SMTP accounts and the single choice of which one sends. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email (SMTP)
                        </CardTitle>
                        <CardDescription>Set up your sending accounts, then choose which one your store sends from.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold">Gmail Account</h4>
                                <p className="text-muted-foreground text-xs">Use an App Password if 2-Step Verification is enabled.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_email">Gmail Address</Label>
                                    <Input
                                        id="smtp_email"
                                        type="email"
                                        placeholder="your_email@gmail.com"
                                        value={data.smtp_email}
                                        onChange={(e) => setData('smtp_email', e.target.value)}
                                    />
                                    {errors.smtp_email && <p className="text-destructive text-sm">{errors.smtp_email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_password">App Password</Label>
                                    <Input
                                        id="smtp_password"
                                        type="text"
                                        placeholder="16-character app password"
                                        value={data.smtp_password}
                                        onChange={(e) => setData('smtp_password', e.target.value)}
                                    />
                                    {errors.smtp_password && <p className="text-destructive text-sm">{errors.smtp_password}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-6">
                            <div>
                                <h4 className="text-sm font-semibold">Official Account (Hostinger)</h4>
                                <p className="text-muted-foreground text-xs">Your custom domain address, e.g. support@leanexa.store.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="official_smtp_email">Official Email Address</Label>
                                    <Input
                                        id="official_smtp_email"
                                        type="email"
                                        placeholder="support@leanexa.store"
                                        value={data.official_smtp_email}
                                        onChange={(e) => setData('official_smtp_email', e.target.value)}
                                    />
                                    {errors.official_smtp_email && <p className="text-destructive text-sm">{errors.official_smtp_email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="official_smtp_password">Email Password</Label>
                                    <Input
                                        id="official_smtp_password"
                                        type="text"
                                        placeholder="Enter your email password"
                                        value={data.official_smtp_password}
                                        onChange={(e) => setData('official_smtp_password', e.target.value)}
                                    />
                                    {errors.official_smtp_password && <p className="text-destructive text-sm">{errors.official_smtp_password}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-6">
                            <Label>Default Mailer</Label>
                            <p className="text-muted-foreground text-xs">The account all system emails are sent from.</p>
                            <ToggleGroup
                                type="single"
                                variant="outline"
                                value={data.primary_mailer}
                                onValueChange={(value) => value && setData('primary_mailer', value)}
                                className="mt-2 justify-start"
                            >
                                <ToggleGroupItem value="gmail" className="px-6">Gmail</ToggleGroupItem>
                                <ToggleGroupItem value="hostinger" className="px-6">Hostinger</ToggleGroupItem>
                            </ToggleGroup>
                            {errors.primary_mailer && <p className="text-destructive text-sm">{errors.primary_mailer}</p>}
                        </div>

                        <div className="space-y-2 border-t pt-6">
                            <Label htmlFor="admin_notification_emails">Admin Notification Emails</Label>
                            <p className="text-muted-foreground text-xs">
                                These addresses are copied on every payment — from both storefront orders and custom invoices.
                                Enter one email per line, or separate them with commas.
                            </p>
                            <Textarea
                                id="admin_notification_emails"
                                value={data.admin_notification_emails}
                                onChange={(e) => setData('admin_notification_emails', e.target.value)}
                                rows={3}
                                placeholder={'owner@store.com\naccounts@store.com'}
                            />
                            {errors.admin_notification_emails && <p className="text-destructive text-sm">{errors.admin_notification_emails}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Social Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                            Social Links
                        </CardTitle>
                        <CardDescription>Links to your social media profiles (Optional).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="facebook_link">Facebook URL</Label>
                                <Input
                                    id="facebook_link"
                                    type="url"
                                    placeholder="https://facebook.com/..."
                                    value={data.facebook_link}
                                    onChange={(e) => setData('facebook_link', e.target.value)}
                                />
                                {errors.facebook_link && <p className="text-destructive text-sm">{errors.facebook_link}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram_link">Instagram URL</Label>
                                <Input
                                    id="instagram_link"
                                    type="url"
                                    placeholder="https://instagram.com/..."
                                    value={data.instagram_link}
                                    onChange={(e) => setData('instagram_link', e.target.value)}
                                />
                                {errors.instagram_link && <p className="text-destructive text-sm">{errors.instagram_link}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter_link">Twitter URL</Label>
                                <Input
                                    id="twitter_link"
                                    type="url"
                                    placeholder="https://twitter.com/..."
                                    value={data.twitter_link}
                                    onChange={(e) => setData('twitter_link', e.target.value)}
                                />
                                {errors.twitter_link && <p className="text-destructive text-sm">{errors.twitter_link}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Abandoned Cart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            Abandoned Cart Recovery
                        </CardTitle>
                        <CardDescription>Configure how abandoned carts are handled and whether to offer discounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="abandoned_cart_enabled"
                                checked={data.abandoned_cart_enabled}
                                onChange={(e) => setData('abandoned_cart_enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-shop-primary focus:ring-shop-primary"
                            />
                            <Label htmlFor="abandoned_cart_enabled" className="cursor-pointer">Enable Abandoned Cart Recovery Emails</Label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="abandoned_cart_timeout_hours">Timeout (Hours)</Label>
                                <Input
                                    id="abandoned_cart_timeout_hours"
                                    type="number"
                                    min="0"
                                    value={data.abandoned_cart_timeout_hours}
                                    onChange={(e) => setData('abandoned_cart_timeout_hours', parseInt(e.target.value) || 0)}
                                    disabled={!data.abandoned_cart_enabled}
                                />
                                {errors.abandoned_cart_timeout_hours && <p className="text-destructive text-sm">{errors.abandoned_cart_timeout_hours}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="abandoned_cart_discount_type">Discount Type</Label>
                                <select
                                    id="abandoned_cart_discount_type"
                                    value={data.abandoned_cart_discount_type}
                                    onChange={(e) => setData('abandoned_cart_discount_type', e.target.value)}
                                    disabled={!data.abandoned_cart_enabled}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="none">No Discount</option>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                                {errors.abandoned_cart_discount_type && <p className="text-destructive text-sm">{errors.abandoned_cart_discount_type}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="abandoned_cart_discount_value">Discount Value</Label>
                                <Input
                                    id="abandoned_cart_discount_value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.abandoned_cart_discount_value}
                                    onChange={(e) => setData('abandoned_cart_discount_value', parseFloat(e.target.value) || 0)}
                                    disabled={!data.abandoned_cart_enabled || data.abandoned_cart_discount_type === 'none'}
                                />
                                {errors.abandoned_cart_discount_value && <p className="text-destructive text-sm">{errors.abandoned_cart_discount_value}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing} size="lg">
                        Save Settings
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
