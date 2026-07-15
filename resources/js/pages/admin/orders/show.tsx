import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    ArrowLeft,
    MapPin,
    Receipt,
    User,
    Mail,
    StickyNote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin-layout';

const money = (v: number | string, symbol: string = '$') =>
    symbol +
    Number(v).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const ORDER_STATUS_STYLES: Record<
    string,
    { badge: string; icon: React.ReactNode }
> = {
    pending: {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    processing: {
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Package className="h-3.5 w-3.5" />,
    },
    shipped: {
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: <Truck className="h-3.5 w-3.5" />,
    },
    delivered: {
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    completed: {
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    cancelled: {
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="h-3.5 w-3.5" />,
    },
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    unpaid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled:
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

function AddressBlock({
    address,
    fallback,
    customerName,
}: {
    address: any;
    fallback: string;
    customerName?: string;
}) {
    if (!address) {
        return <p className="text-sm text-muted-foreground">{fallback}</p>;
    }

    return (
        <div className="space-y-1 text-sm">
            <p className="font-medium">{address.name || customerName}</p>
            {address.address && (
                <p className="text-muted-foreground">{address.address}</p>
            )}
            {(address.city || address.state || address.postal_code) && (
                <p className="text-muted-foreground">
                    {[address.city, address.state, address.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                </p>
            )}
            {address.country && (
                <p className="text-muted-foreground">{address.country}</p>
            )}
            {address.phone && (
                <p className="pt-1 text-muted-foreground">
                    Phone: {address.phone}
                </p>
            )}
        </div>
    );
}

export default function OrderShow({ order }: { order: any }) {
    const { activeCurrency } = usePage().props as any;
    const currencySymbol = activeCurrency?.symbol || '৳';

    const { data, setData, put, processing } = useForm({
        status: order.status,
        payment_status: order.payment_status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/orders/${order.id}`, {
            onSuccess: () => toast.success('Order status updated successfully'),
            preserveScroll: true,
        });
    };

    // Addresses are stored as plain text; older data may be JSON. Never let
    // a parse failure crash the page — fall back to showing the raw text.
    const parseAddress = (value: any): any => {
        if (!value) {
            return null;
        }

        if (typeof value !== 'string') {
            return value;
        }

        try {
            const parsed = JSON.parse(value);

            return typeof parsed === 'object' && parsed !== null
                ? parsed
                : { address: value };
        } catch {
            return { address: value };
        }
    };

    const shippingAddress = parseAddress(order.shipping_address);
    const billingAddress = parseAddress(order.billing_address);

    const statusStyle =
        ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending;
    const paymentStyle =
        PAYMENT_STATUS_STYLES[order.payment_status] ??
        PAYMENT_STATUS_STYLES.unpaid;
    const itemCount = order.items.reduce(
        (sum: number, i: any) => sum + i.quantity,
        0,
    );

    return (
        <AdminLayout>
            <Head title={`Order #${order.order_number}`} />

            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="mt-0.5 h-9 w-9 shrink-0"
                    >
                        <Link href="/admin/orders" aria-label="Back to orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                Order #{order.order_number}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle.badge}`}
                            >
                                {statusStyle.icon} {order.status}
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${paymentStyle}`}
                            >
                                {order.payment_status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                },
                            )}{' '}
                            · {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <a
                        href={`/admin/orders/${order.id}/invoice`}
                        target="_blank"
                    >
                        <FileText className="mr-2 h-4 w-4" /> View Invoice
                    </a>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex min-w-0 gap-4">
                                            {item.product?.images?.length >
                                            0 ? (
                                                <img
                                                    src={
                                                        item.product.images[0]
                                                            .image_path
                                                    }
                                                    alt={item.product_name}
                                                    className="h-16 w-16 shrink-0 rounded-lg border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="truncate font-medium">
                                                    {item.product_name}
                                                </h4>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {money(item.price, currencySymbol)} ×{' '}
                                                    {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="shrink-0 font-semibold">
                                            {money(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-5" />

                            <div className="ml-auto max-w-xs space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>
                                        {money(
                                            order.subtotal ??
                                                order.total_amount,
                                        )}
                                    </span>
                                </div>
                                {Number(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>
                                            -{money(order.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Shipping
                                    </span>
                                    <span>
                                        {money(order.shipping_amount ?? 0)}
                                    </span>
                                </div>
                                {Number(order.tax_amount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tax
                                        </span>
                                        <span>{money(order.tax_amount)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between pt-1 text-base font-bold">
                                    <span>Total</span>
                                    <span>{money(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold">
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AddressBlock
                                    address={shippingAddress}
                                    customerName={order.customer?.name}
                                    fallback="No shipping address provided."
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold">
                                    Billing Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AddressBlock
                                    address={billingAddress}
                                    customerName={order.customer?.name}
                                    fallback="Same as shipping address."
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Update Status
                            </CardTitle>
                            <CardDescription>
                                Change the order and payment statuses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Order Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) =>
                                            setData('status', v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="status"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="processing">
                                                Processing
                                            </SelectItem>
                                            <SelectItem value="shipped">
                                                Shipped
                                            </SelectItem>
                                            <SelectItem value="delivered">
                                                Delivered
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_status">
                                        Payment Status
                                    </Label>
                                    <Select
                                        value={data.payment_status}
                                        onValueChange={(v) =>
                                            setData('payment_status', v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="payment_status"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select Payment Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unpaid">
                                                Unpaid
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                Paid
                                            </SelectItem>
                                            <SelectItem value="failed">
                                                Failed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Order'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shop-primary/10 text-base font-bold text-shop-primary">
                                    {(order.customer?.name || 'G')
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {order.customer?.name || 'Guest'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Customer
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>
                                        {order.customer?.name || 'Guest'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                        {order.customer?.email || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            {order.notes && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                                        <StickyNote className="h-3.5 w-3.5" />{' '}
                                        Order Notes
                                    </p>
                                    {order.notes}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
