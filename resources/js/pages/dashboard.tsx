import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'completed') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
};

const titleCase = (value?: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—');

export default function Dashboard({
    metrics,
    recentOrders = [],
}: {
    metrics?: { totalSales?: number; pendingOrders?: number; salesChange?: number };
    recentOrders?: any[];
}) {
    const { formatPrice } = useCurrency();
    const salesChange = metrics?.salesChange ?? 0;
    const salesUp = salesChange >= 0;

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
                        <p className={`mt-1 flex items-center text-xs ${salesUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {salesUp ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                            {salesUp ? '+' : ''}{salesChange}% from last month
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
                                                <AvatarFallback className="text-xs">{order.customer?.name?.charAt(0) ?? 'G'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{order.customer?.name ?? 'Guest'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(order.status)}>{titleCase(order.status)}</Badge>
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
