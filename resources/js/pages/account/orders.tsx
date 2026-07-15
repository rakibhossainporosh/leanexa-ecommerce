import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

type Order = {
    id: number;
    order_number: string;
    status: string;
    payment_status?: string;
    total_amount: string | number;
    created_at: string;
};

export default function AccountOrders({ orders = [] }: { orders?: Order[] }) {
    const { formatPrice } = useCurrency();
    return (
        <CustomerLayout>
            <Head title="My Orders" />
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shop-primary/10 text-shop">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
                        <p className="text-sm text-muted-foreground">Track and review all your purchases.</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Order #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-muted-foreground">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.id} className="transition-colors hover:bg-muted/30">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">#{order.order_number}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
                                            <span>{formatPrice(order.total_amount)}</span>
                                            {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                                                <button 
                                                    className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        import('@inertiajs/react').then(({ router }) => {
                                                            router.post(`/checkout/retry/${order.order_number}`);
                                                        });
                                                    }}
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                            You haven't placed any orders yet.{' '}
                                            <Link href="/products" className="font-semibold text-shop hover:text-shop/80">Start shopping</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
