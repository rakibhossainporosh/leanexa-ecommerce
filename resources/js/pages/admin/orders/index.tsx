import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Eye,
    List,
    FileText,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
    Loader2,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDataTable } from '@/hooks/use-datatable';
import type { DataTableColumn } from '@/hooks/use-datatable';
import AdminLayout from '@/layouts/admin-layout';

/**
 * Column definitions sent to the yajra/laravel-datatables endpoint.
 * The hidden customer.email column only widens the global search.
 */
const DT_COLUMNS: DataTableColumn[] = [
    { data: 'id', name: 'id', searchable: false, orderable: true },
    {
        data: 'order_number',
        name: 'order_number',
        searchable: true,
        orderable: true,
    },
    {
        data: 'customer.name',
        name: 'customer.name',
        searchable: true,
        orderable: true,
    },
    {
        data: 'created_at',
        name: 'created_at',
        searchable: false,
        orderable: true,
    },
    {
        data: 'total_amount',
        name: 'total_amount',
        searchable: false,
        orderable: true,
    },
    {
        data: 'payment_status',
        name: 'payment_status',
        searchable: true,
        orderable: true,
    },
    { data: 'status', name: 'status', searchable: true, orderable: true },
    {
        data: 'customer.email',
        name: 'customer.email',
        searchable: true,
        orderable: false,
    },
];

function SortIndicator({
    col,
    order,
}: {
    col: number;
    order: { col: number; dir: 'asc' | 'desc' };
}) {
    if (order.col !== col) {
        return (
            <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />
        );
    }

    return order.dir === 'asc' ? (
        <ChevronUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
        <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
    );
}

export default function OrdersIndex() {
    const { activeCurrency } = usePage().props as any;
    const currencySymbol = activeCurrency?.symbol || '৳';

    const {
        rows,
        recordsTotal,
        recordsFiltered,
        loading,
        search,
        setSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        order,
        toggleSort,
        reload,
        lastPage,
        from,
        to,
    } = useDataTable('/admin/orders-data', DT_COLUMNS);

    const remove = (row: any) => {
        const paidWarning = row.payment_status === 'paid'
            ? '\n\nThis order is PAID — deleting it removes its revenue from the Sales Report.'
            : '';

        if (!confirm(`Delete order #${row.order_number}?${paidWarning}\n\nThis cannot be undone.`)) {
            return;
        }

        router.delete(`/admin/orders/${row.id}`, {
            preserveScroll: true,
            // The table feeds itself from /admin/orders-data rather than Inertia
            // props, so it has to be told to refetch.
            onSuccess: () => { reload(); toast.success('Order deleted successfully.'); },
        });
    };

    return (
        <AdminLayout title="Orders">
            <Head title="Manage Orders" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                    View and manage customer orders.
                </p>
            </div>

            <Card>
                <CardContent className="px-0">
                    {/* Table toolbar: global search + page size */}
                    <div className="flex flex-col gap-3 border-b px-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order no, customer, status..."
                                className="h-9 pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Show</span>
                            <Select
                                value={String(perPage)}
                                onValueChange={(v) => setPerPage(Number(v))}
                            >
                                <SelectTrigger className="h-9 w-[76px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">
                                entries
                            </span>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer pl-6 select-none"
                                    onClick={() => toggleSort(1)}
                                >
                                    Order ID{' '}
                                    <SortIndicator order={order} col={1} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(2)}
                                >
                                    Customer{' '}
                                    <SortIndicator order={order} col={2} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(3)}
                                >
                                    Date <SortIndicator order={order} col={3} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(4)}
                                >
                                    Total Amount{' '}
                                    <SortIndicator order={order} col={4} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(5)}
                                >
                                    Payment{' '}
                                    <SortIndicator order={order} col={5} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(6)}
                                >
                                    Status{' '}
                                    <SortIndicator order={order} col={6} />
                                </TableHead>
                                <TableHead className="pr-6 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            className={
                                loading
                                    ? 'opacity-50 transition-opacity'
                                    : 'transition-opacity'
                            }
                        >
                            {rows.map((order: any) => (
                                <TableRow key={order.id} className="group">
                                    <TableCell className="pl-6 font-medium">
                                        #{order.order_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>
                                                {order.customer?.name ||
                                                    'Guest'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {order.customer?.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {currencySymbol}{Number(order.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.payment_status === 'paid'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {order.payment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === 'delivered'
                                                    ? 'default'
                                                    : order.status ===
                                                        'cancelled'
                                                      ? 'destructive'
                                                      : 'outline'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                title="View Details"
                                            >
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                title="View Invoice"
                                            >
                                                <a
                                                    href={`/admin/orders/${order.id}/invoice`}
                                                    target="_blank"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete Order"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => remove(order)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center">
                                            {loading ? (
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            ) : (
                                                <>
                                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                        <List className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="font-medium">
                                                        No orders found
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {search
                                                            ? 'Try a different search term.'
                                                            : 'When customers place orders, they will appear here.'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t px-6 pt-4 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Showing {from} to {to} of {recordsFiltered} entries
                            {recordsFiltered !== recordsTotal &&
                                ` (filtered from ${recordsTotal} total)`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0 || loading}
                                onClick={() =>
                                    setPage((p) => Math.max(0, p - 1))
                                }
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />{' '}
                                Previous
                            </Button>
                            <span className="px-2 text-sm text-muted-foreground">
                                Page {Math.min(page + 1, lastPage + 1)} of{' '}
                                {lastPage + 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= lastPage || loading}
                                onClick={() =>
                                    setPage((p) => Math.min(lastPage, p + 1))
                                }
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
