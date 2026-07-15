import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccess({ order }: { order: any }) {
    return (
        <CustomerLayout>
            <Head title="Order Successful" />
            <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="h-20 w-20 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Thank you for your order!</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Your order <span className="font-bold text-foreground">{order.order_number}</span> has been placed successfully.
                </p>
                
                <div className="bg-card border rounded-xl p-8 mb-8 text-left">
                    <h2 className="font-semibold text-lg mb-4 border-b pb-2">Order Summary</h2>
                    <div className="space-y-3">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product_name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${order.total_amount}</span>
                    </div>
                    <div className="border-t mt-4 pt-4 flex justify-between font-bold text-md text-muted-foreground">
                        <span>Payment Status</span>
                        <span className={order.payment_status === 'paid' ? 'text-green-500' : 'text-amber-500'}>
                            {order.payment_status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {order.payment_status !== 'paid' && (
                        <Button asChild className="bg-shop-primary hover:bg-shop-primary-hover text-white" onClick={(e) => {
                            e.preventDefault();
                            import('@inertiajs/react').then(({ router }) => {
                                router.post(`/checkout/retry/${order.order_number}`);
                            });
                        }}>
                            <a href="#">Pay Now</a>
                        </Button>
                    )}
                    <Button asChild variant="outline" className="border-shop-primary text-shop-primary hover:bg-shop-primary hover:text-white">
                        <Link href={'/account'}>View My Orders</Link>
                    </Button>
                    <Button asChild className="bg-shop-primary hover:bg-shop-primary-hover text-white">
                        <Link href={'/products'}>Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        </CustomerLayout>
    );
}
