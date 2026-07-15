import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Trash2, ShoppingBag, Eye } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AbandonedCartsIndex({ carts, settings }: { carts: any, settings: any }) {
    const { formatPrice } = useCurrency();
    const timeout = settings.abandoned_cart_timeout_hours || 24;

    const deleteCart = (id: number) => {
        if (confirm('Are you sure you want to remove this abandoned cart?')) {
            router.delete(`/admin/abandoned-carts/${id}`, {
                onSuccess: () => toast.success('Cart removed successfully.')
            });
        }
    };

    const sendEmail = (id: number) => {
        if (confirm('Send reminder email to this customer?')) {
            router.post(`/admin/abandoned-carts/${id}/send-email`, {}, {
                onSuccess: () => toast.success('Reminder email sent successfully.')
            });
        }
    };

    return (
        <AdminLayout title="Abandoned Carts">
            <Head title="Abandoned Carts" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-muted-foreground text-sm mt-1">
                        Carts inactive for more than {timeout} hours.
                    </p>
                </div>
                <Link href="/admin/general-settings">
                    <Button variant="outline">Settings</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Abandoned Carts List</CardTitle>
                    <CardDescription>View carts left behind by customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total Value</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carts.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No abandoned carts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {carts.data.map((cart: any) => {
                                    const total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                                    
                                    let name = cart.customer ? cart.customer.name : (cart.guest_name || 'Guest');
                                    let email = cart.customer ? cart.customer.email : (cart.guest_email || 'No Email');
                                    
                                    return (
                                        <TableRow key={cart.id}>
                                            <TableCell>
                                                <div className="font-medium">{name}</div>
                                                <div className="text-xs text-muted-foreground">{email}</div>
                                                {!cart.customer && <Badge variant="outline" className="mt-1 text-[10px]">Guest</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                                    {cart.items.length} item(s)
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatPrice(total)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDistanceToNow(new Date(cart.updated_at), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                                {cart.abandoned_email_sent_at ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        Sent {formatDistanceToNow(new Date(cart.abandoned_email_sent_at), { addSuffix: true })}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Not Sent</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Abandoned Cart Details</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-6 mt-4">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-muted-foreground block mb-1">Customer Name</span>
                                                                        <span className="font-medium">{name}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground block mb-1">Email Address</span>
                                                                        <span className="font-medium">{email}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground block mb-1">Phone Number</span>
                                                                        <span className="font-medium">{cart.customer?.phone || cart.guest_phone || 'N/A'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground block mb-1">Last Updated</span>
                                                                        <span className="font-medium">{formatDistanceToNow(new Date(cart.updated_at), { addSuffix: true })}</span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-semibold mb-3 border-b pb-2">Cart Items</h4>
                                                                    <div className="space-y-4">
                                                                        {cart.items.map((item: any) => (
                                                                            <div key={item.id} className="flex gap-4">
                                                                                <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                                                                    {item.product?.images?.[0] ? (
                                                                                        <img src={item.product.images[0].image_path} alt={item.product.name} className="h-full w-full object-cover" />
                                                                                    ) : (
                                                                                        <ShoppingBag className="h-6 w-6 m-auto mt-5 text-muted-foreground opacity-20" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="font-medium text-sm">{item.product?.name || 'Unknown Product'}</div>
                                                                                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                                                                        <span>Qty: {item.quantity}</span>
                                                                                        <span>Price: {formatPrice(item.price)}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="font-semibold text-sm text-right">
                                                                                    {formatPrice(item.price * item.quantity)}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                                                                    <span>Total Value</span>
                                                                    <span>{formatPrice(total)}</span>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => sendEmail(cart.id)}
                                                        disabled={email === 'No Email'}
                                                        title="Send Reminder Email"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => deleteCart(cart.id)}
                                                        title="Remove Cart"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination - Simplified for brevity */}
                    {carts.links && carts.links.length > 3 && (
                        <div className="mt-4 flex items-center justify-center gap-1">
                            {carts.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-sm border rounded-md ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
