import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';
import { Package, Heart, Settings, LogOut, ChevronRight, User } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

type Order = { id: number; order_number: string; status: string; total_amount: string | number; created_at: string };

export default function AccountIndex({
    stats,
    recentOrders = [],
}: {
    stats: { orders: number; wishlist: number };
    recentOrders?: Order[];
}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const { formatPrice } = useCurrency();

    const links = [
        { label: 'My Orders', description: 'Track and review your purchases', href: '/orders', icon: Package },
        { label: 'Wishlist', description: 'Products you saved for later', href: '/wishlist', icon: Heart },
        { label: 'Account Settings', description: 'Update your profile and password', href: '/settings/profile', icon: Settings },
    ];

    return (
        <CustomerLayout>
            <Head title="My Account" />
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-primary/10 text-xl font-bold text-shop">
                        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">Welcome back, {user?.name}</h1>
                        <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                {/* Stat tiles */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <Package className="mb-2 h-5 w-5 text-shop" />
                        <div className="text-2xl font-bold">{stats.orders}</div>
                        <div className="text-sm text-muted-foreground">Total orders</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <Heart className="mb-2 h-5 w-5 text-shop" />
                        <div className="text-2xl font-bold">{stats.wishlist}</div>
                        <div className="text-sm text-muted-foreground">Wishlist items</div>
                    </div>
                    <Link href="/settings/profile" className="hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-shop sm:block">
                        <User className="mb-2 h-5 w-5 text-shop" />
                        <div className="text-2xl font-bold">Profile</div>
                        <div className="text-sm text-muted-foreground">Manage details</div>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick links */}
                    <div className="lg:col-span-1">
                        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            {links.map((l) => (
                                <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-shop">
                                        <l.icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold">{l.label}</p>
                                        <p className="truncate text-xs text-muted-foreground">{l.description}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            ))}
                            <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-destructive/10">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-red-600">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-red-600">Log out</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent orders */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center justify-between border-b border-border p-5">
                                <h2 className="font-semibold">Recent Orders</h2>
                                <Link href="/orders" className="text-sm font-semibold text-shop hover:text-shop/80">View all</Link>
                            </div>
                            {recentOrders.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {recentOrders.map((o) => (
                                        <div key={o.id} className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="text-sm font-medium">#{o.order_number}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={o.status === 'completed' ? 'default' : 'secondary'}>{o.status}</Badge>
                                                <span className="text-sm font-semibold">{formatPrice(o.total_amount)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">You haven't placed any orders yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
