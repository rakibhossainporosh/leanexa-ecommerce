import { Head, useForm, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Ticket } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useCurrency } from '@/hooks/use-currency';

// Customers shopping in USD are shipping to the USA; everyone else defaults to Bangladesh.
const countryForCurrency = (code?: string) => (code === 'USD' ? 'US' : 'BD');

export default function CheckoutIndex({ cart, auth, appliedCoupon, shipping, taxRate }: { cart: any, auth: any, appliedCoupon?: any, shipping?: { inside_dhaka: number, outside_dhaka: number, usa?: number }, taxRate?: number }) {
    const { formatPrice, activeCurrency } = useCurrency();
    const items = cart?.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discountAmount = subtotal * (appliedCoupon.value / 100);
        } else {
            discountAmount = parseFloat(appliedCoupon.value);
        }
    }
    discountAmount = Math.min(discountAmount, subtotal);

    const { data, setData, post, processing, errors } = useForm({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: '',
        shipping_address: '',
        billing_address: '',
        country: countryForCurrency(activeCurrency?.code),
        delivery_area: 'inside_dhaka',
        notes: '',
    });

    // Track the latest chosen country so the currency->country sync below can
    // read it without re-running every time it changes.
    const countryRef = useRef(data.country);
    countryRef.current = data.country;

    // The top bar can change currency without remounting this page, so keep the
    // shipping country in step with it — but don't downgrade a manual "Other
    // Country" pick to USA just because both bill in USD.
    useEffect(() => {
        if (activeCurrency?.code === 'USD') {
            if (countryRef.current !== 'US' && countryRef.current !== 'OTHER') {
                setData('country', 'US');
            }
        } else {
            setData('country', 'BD');
        }
    }, [activeCurrency?.code]);

    // Selecting a country drives the display currency: Bangladesh -> BDT,
    // USA and Other Country -> USD (both settle internationally in USD).
    const handleCountryChange = (value: string) => {
        setData('country', value);
        router.post('/currency', { currency: value === 'BD' ? 'BDT' : 'USD' }, { preserveScroll: true, preserveState: true });
    };

    const shippingAmount = (data.country === 'US' || data.country === 'OTHER')
        ? (shipping?.usa ?? 0)
        : data.delivery_area === 'outside_dhaka'
            ? (shipping?.outside_dhaka ?? 0)
            : (shipping?.inside_dhaka ?? 0);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableBase * ((taxRate ?? 0) / 100);
    const total = Math.max(0, taxableBase + shippingAmount + taxAmount);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout');
    };

    const handleBlur = () => {
        // Sync contact details onto the cart for guests AND logged-in customers,
        // so an abandoned cart keeps the phone number typed at checkout
        // (customers have no phone on their account).
        fetch('/cart/sync-guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                guest_name: data.name,
                guest_email: data.email,
                guest_phone: data.phone,
            })
        }).catch(() => {});
    };

    return (
        <CustomerLayout>
            <Head title="Checkout" />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/cart">Cart</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Checkout</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="font-heading text-3xl font-bold tracking-tight mb-8">Checkout</h1>
                
                <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Customer & Shipping Information</h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} onBlur={handleBlur} required />
                                    {errors.name && <div className="text-destructive text-sm mt-1">{errors.name}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} onBlur={handleBlur} required />
                                    <p className="text-xs text-muted-foreground mt-1">We'll auto-create an account for you using this email if you don't have one.</p>
                                    {errors.email && <div className="text-destructive text-sm mt-1">{errors.email}</div>}
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} onBlur={handleBlur} />
                                {errors.phone && <div className="text-destructive text-sm mt-1">{errors.phone}</div>}
                            </div>

                            <div>
                                <Label htmlFor="shipping_address">Shipping Address</Label>
                                <Input id="shipping_address" value={data.shipping_address} onChange={e => setData('shipping_address', e.target.value)} required />
                                {errors.shipping_address && <div className="text-destructive text-sm mt-1">{errors.shipping_address}</div>}
                            </div>

                            <div>
                                <Label htmlFor="country">Country</Label>
                                <select 
                                    id="country" 
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.country}
                                    onChange={e => handleCountryChange(e.target.value)}
                                >
                                    <option value="BD">Bangladesh</option>
                                    <option value="US">USA</option>
                                    <option value="OTHER">Other Country</option>
                                </select>
                                {errors.country && <div className="text-destructive text-sm mt-1">{errors.country}</div>}
                            </div>

                            {data.country === 'BD' && (
                                <div>
                                    <Label>Delivery Area</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        <label className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer ${data.delivery_area === 'inside_dhaka' ? 'border-primary ring-1 ring-primary' : ''}`}>
                                            <input type="radio" name="delivery_area" value="inside_dhaka" checked={data.delivery_area === 'inside_dhaka'} onChange={e => setData('delivery_area', e.target.value)} />
                                            <span className="text-sm">Inside Dhaka ({formatPrice(shipping?.inside_dhaka ?? 0)})</span>
                                        </label>
                                        <label className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer ${data.delivery_area === 'outside_dhaka' ? 'border-primary ring-1 ring-primary' : ''}`}>
                                            <input type="radio" name="delivery_area" value="outside_dhaka" checked={data.delivery_area === 'outside_dhaka'} onChange={e => setData('delivery_area', e.target.value)} />
                                            <span className="text-sm">Outside Dhaka ({formatPrice(shipping?.outside_dhaka ?? 0)})</span>
                                        </label>
                                    </div>
                                    {errors.delivery_area && <div className="text-destructive text-sm mt-1">{errors.delivery_area}</div>}
                                </div>
                            )}

                            {(data.country === 'US' || data.country === 'OTHER') && (
                                <div>
                                    <Label>Delivery Area</Label>
                                    <div className="mt-2 flex items-center justify-between rounded-md border px-3 py-2">
                                        <span className="text-sm">International Shipping ({data.country === 'US' ? 'USA' : 'Other Country'})</span>
                                        <span className="text-sm font-medium">{formatPrice(shipping?.usa ?? 0)}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="billing_address">Billing Address (Optional)</Label>
                                <Input id="billing_address" value={data.billing_address} onChange={e => setData('billing_address', e.target.value)} />
                                <p className="text-xs text-muted-foreground mt-1">Leave empty if same as shipping.</p>
                            </div>

                            <div>
                                <Label htmlFor="notes">Order Notes (Optional)</Label>
                                <Input id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>

                            <Button type="submit" size="lg" className="w-full bg-shop-primary hover:bg-shop-primary-hover text-white" disabled={processing}>
                                {processing ? 'Processing...' : 'Place Order & Proceed to Payment'}
                            </Button>
                        </form>
                    </div>

                    <div>
                        <div className="bg-card border rounded-xl p-6 sticky top-24">
                            <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            {item.colorVariant?.image_path ? (
                                                <img src={item.colorVariant.image_path} alt={item.colorVariant.name} className="w-full h-full object-cover" />
                                            ) : item.product.images?.length > 0 ? (
                                                <img src={item.product.images[0].image_path} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between font-medium">
                                                <span>{item.product.name}</span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                            {(item.colorVariant || item.sizeVariant) && (
                                                <div className="text-xs text-primary mb-1 space-x-2">
                                                    {item.colorVariant && <span>Color: {item.colorVariant.name}</span>}
                                                    {item.sizeVariant && <span>Size: {item.sizeVariant.name}</span>}
                                                </div>
                                            )}
                                            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Separator className="mb-4" />
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center">
                                            <Ticket className="w-4 h-4 mr-1" />
                                            Coupon ({appliedCoupon.code})
                                        </span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(shippingAmount)}</span>
                                </div>
                                {(taxRate ?? 0) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                                        <span>{formatPrice(taxAmount)}</span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
