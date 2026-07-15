import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Package, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/use-currency';

type Order = {
    order_number: string;
    status: string;
    payment_status?: string;
    created_at: string;
    total_amount: string | number;
};

export default function TrackOrder({ order, error, searched }: { order?: Order, error?: string, searched?: boolean }) {
    const { formatPrice } = useCurrency();
    const { data, setData, get, processing } = useForm({
        order_number: order?.order_number || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/track-order', { preserveState: true });
    };

    return (
        <CustomerLayout>
            <Head title="Track Order" />
            <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-shop-primary/10 text-shop">
                        <Truck className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Track Your Order</h1>
                    <p className="mt-2 text-muted-foreground">
                        Enter your order number below to check its current status.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
                    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <Input 
                                type="text" 
                                placeholder="Order Number (e.g. ORD-12345)" 
                                value={data.order_number}
                                onChange={e => setData('order_number', e.target.value)}
                                className="h-12"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={processing} className="h-12 bg-shop-primary text-white hover:bg-shop-primary-hover">
                            <Search className="mr-2 h-4 w-4" />
                            Track Order
                        </Button>
                    </form>

                    {searched && (
                        <div className="mt-8 pt-8 border-t border-border/50">
                            {error ? (
                                <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                                    {error}
                                </div>
                            ) : order ? (
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-6">
                                    <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-shop-primary/10 text-shop">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Order #{order.order_number}</h3>
                                                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Total Amount</p>
                                            <p className="font-semibold text-foreground">{formatPrice(order.total_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Payment Status</p>
                                            <p className="font-semibold capitalize text-foreground">{order.payment_status}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
