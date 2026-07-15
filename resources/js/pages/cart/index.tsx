import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Ticket, X, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/use-currency';

export default function CartIndex({ cart, appliedCoupon }: { cart: any, appliedCoupon?: any }) {
    const { formatPrice } = useCurrency();
    const [localItems, setLocalItems] = useState(cart?.items || []);
    
    useEffect(() => {
        setLocalItems(cart?.items || []);
    }, [cart]);

    const items = localItems;
    
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discountAmount = subtotal * (appliedCoupon.value / 100);
        } else {
            discountAmount = parseFloat(appliedCoupon.value);
        }
    }
    
    const total = Math.max(0, subtotal - discountAmount);

    const { data, setData, post, processing, reset } = useForm({
        code: ''
    });

    const applyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cart/coupon', {
            preserveScroll: true,
            onSuccess: () => reset()
        });
    };

    const removeCoupon = () => {
        router.delete('/cart/coupon', { preserveScroll: true });
    };

    const updateQuantity = (itemId: number, newQuantity: number, maxStock: number = Infinity) => {
        if (newQuantity < 1) return;
        if (newQuantity > maxStock) return;
        
        // Optimistic UI update
        setLocalItems((prev: any[]) => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        
        router.put(`/cart/${itemId}`, { quantity: newQuantity }, { 
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // Revert on error
                setLocalItems(cart?.items || []);
            }
        });
    };

    const removeItem = (itemId: number) => {
        // Optimistic UI update
        setLocalItems((prev: any[]) => prev.filter(item => item.id !== itemId));
        
        router.delete(`/cart/${itemId}`, { 
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setLocalItems(cart?.items || []);
            }
        });
    };

    return (
        <CustomerLayout>
            <Head title="Shopping Cart" />
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="font-heading text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
                
                {items.length === 0 ? (
                    <div className="text-center py-16 border rounded-xl bg-muted/20">
                        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                        <Button asChild className="bg-shop-primary hover:bg-shop-primary-hover text-white">
                            <Link href={'/products'}>Continue Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 border rounded-xl p-4 bg-card">
                                    <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                        {item.colorVariant?.image_path ? (
                                            <img src={item.colorVariant.image_path} alt={item.colorVariant.name} className="w-full h-full object-cover" />
                                        ) : item.product.images?.length > 0 ? (
                                            <img src={item.product.images[0].image_path} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-semibold line-clamp-1">
                                                    <Link href={`/products/${item.product.slug}`} className="hover:underline">
                                                        {item.product.name}
                                                    </Link>
                                                </h3>
                                                {(item.colorVariant || item.sizeVariant) && (
                                                    <div className="text-xs font-medium text-primary mt-0.5 space-x-2">
                                                        {item.colorVariant && <span>Color: {item.colorVariant.name}</span>}
                                                        {item.sizeVariant && <span>Size: {item.sizeVariant.name}</span>}
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground mt-1">{formatPrice(item.price)} each</div>
                                            </div>
                                            <div className="font-bold">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border rounded-md">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <div className="w-10 text-center text-sm font-medium">{item.quantity}</div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-none" 
                                                    disabled={item.quantity >= Math.min(item.colorVariant?.stock ?? item.product.stock, item.sizeVariant?.stock ?? item.product.stock)}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, Math.min(item.colorVariant?.stock ?? item.product.stock, item.sizeVariant?.stock ?? item.product.stock))}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-card border rounded-xl p-6 h-fit sticky top-24">
                            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                            <div className="space-y-3 text-sm mb-6">
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
                                    <span>Calculated at checkout</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                            
                            {!appliedCoupon ? (
                                <form onSubmit={applyCoupon} className="flex gap-2 mb-6">
                                    <Input 
                                        placeholder="Promo Code" 
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <Button type="submit" disabled={processing || !data.code}>Apply</Button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-lg mb-6">
                                    <div className="flex items-center text-green-700 dark:text-green-500 text-sm font-medium">
                                        <Check className="w-4 h-4 mr-2" />
                                        {appliedCoupon.code} Applied
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={removeCoupon} className="h-8 w-8 p-0 text-slate-500 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            <Button className="w-full bg-shop-primary hover:bg-shop-primary-hover text-white" size="lg" asChild>
                                <Link href={'/checkout'}>Proceed to Checkout</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
