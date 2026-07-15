import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AdminLayout from '@/layouts/admin-layout';
import CustomerLayout from '@/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'completed') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
};

export default function Dashboard({ metrics, recentOrders, orders }: { metrics?: any, recentOrders?: any[], orders?: any[] }) {
    const { formatPrice } = useCurrency();
    const { auth } = usePage().props as any;
    const isAdmin = window.location.pathname.startsWith('/admin');

    if (isAdmin) {
        return (
            <AdminLayout title="Dashboard Overview">
                <Head title="Admin Dashboard" />

                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(metrics?.totalSales || 0)}</div>
                            <p className="mt-1 flex items-center text-xs text-emerald-600">
                                <TrendingUp className="mr-1 h-3.5 w-3.5" /> +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Pending Orders</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.pendingOrders || 0}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Needs your attention</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Recent Orders</CardTitle>
                        <Badge variant="outline">Last 5 Orders</Badge>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders?.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-primary pl-6 font-medium">#{order.order_number}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">{order.customer?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{order.customer?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(order.status)}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono pr-6 text-right font-medium">{formatPrice(order.total_amount)}</TableCell>
                                    </TableRow>
                                ))}
                                {recentOrders?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                                            No recent orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </AdminLayout>
        );
    }

    // Customer View
    return (
        <CustomerLayout>
            <Head title="My Dashboard" />
            <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto w-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, {auth.user?.name}!</h1>
                    <p className="text-slate-500">Here you can view your recent orders and manage your account.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Order History</h2>
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Order #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {orders?.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">#{order.order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900 dark:text-white">{formatPrice(order.total_amount)}</td>
                                    </tr>
                                ))}
                                {orders?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">You haven't placed any orders yet.</td>
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
