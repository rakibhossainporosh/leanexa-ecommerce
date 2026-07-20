import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, ShoppingBag, Wallet, BadgeCheck, Trash2 } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CustomerShow({ customer, stats }: { customer: any; stats: any }) {
    const handleDelete = () => {
        if (confirm(`Delete ${customer.name}?\n\nThis also permanently deletes ALL of their orders (and removes that revenue from the Sales Report), along with their cart and wishlist. This cannot be undone.`)) {
            router.delete(`/admin/customers/${customer.id}`);
        }
    };

    return (
        <AdminLayout title="Customer">
            <Head title={customer.name} />

            <div className="mb-6 flex items-center justify-between">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/customers">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                    </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile */}
                <Card className="lg:col-span-1">
                    <CardContent className="flex flex-col items-center py-8 text-center">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl">{customer.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <h2 className="mt-4 text-xl font-semibold">{customer.name}</h2>
                        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" /> {customer.email}
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" /> Joined {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                        {customer.email_verified_at && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <BadgeCheck className="h-3.5 w-3.5" /> Email verified
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats + Orders */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardContent className="flex items-center gap-4 py-6">
                                <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-lg">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats?.orders_count ?? 0}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 py-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Spent (paid)</p>
                                    <p className="text-2xl font-bold">
                                        {Number(stats?.total_spent ?? 0).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Order History</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Order #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="pr-6 text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customer.orders?.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="pl-6">
                                                <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                                                    #{order.order_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status] || 'bg-muted text-muted-foreground'}`}>
                                                    {order.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground capitalize">{order.payment_status}</TableCell>
                                            <TableCell className="pr-6 text-right font-medium">
                                                {Number(order.total_amount).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!customer.orders || customer.orders.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-sm">
                                                No orders yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
