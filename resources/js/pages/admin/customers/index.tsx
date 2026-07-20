import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    Eye,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataTable } from '@/hooks/use-datatable';
import type { DataTableColumn } from '@/hooks/use-datatable';

const DT_COLUMNS: DataTableColumn[] = [
    { data: 'name', name: 'name', searchable: true, orderable: true },
    { data: 'email', name: 'email', searchable: true, orderable: true },
    { data: 'created_at', name: 'created_at', searchable: false, orderable: true },
];

function SortIndicator({ col, order }: { col: number; order: { col: number; dir: 'asc' | 'desc' } }) {
    if (order.col !== col) {
        return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return order.dir === 'asc' ? (
        <ChevronUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
        <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
    );
}

export default function CustomersIndex() {
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
    } = useDataTable('/admin/customers-data', DT_COLUMNS);

    const remove = (customer: any) => {
        if (!confirm(`Delete ${customer.name}? This permanently removes the customer and cannot be undone.`)) {
            return;
        }
        router.delete(`/admin/customers/${customer.id}`, {
            preserveScroll: true,
            // The table feeds itself from /admin/customers-data rather than
            // Inertia props, so it has to be told to refetch.
            onSuccess: () => reload(),
        });
    };

    return (
        <AdminLayout title="Customers">
            <Head title="Customers" />

            <p className="text-muted-foreground mb-6 text-sm">View and manage your registered customers.</p>

            <Card>
                <CardContent className="px-0">
                    {/* Table toolbar: global search + page size */}
                    <div className="flex flex-col gap-3 border-b px-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name or email..."
                                className="h-9 pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Show</span>
                            <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
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
                            <span className="text-muted-foreground">entries</span>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer pl-6 select-none" onClick={() => toggleSort(1)}>
                                    Name <SortIndicator order={order} col={1} />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(2)}>
                                    Email <SortIndicator order={order} col={2} />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(3)}>
                                    Joined Date <SortIndicator order={order} col={3} />
                                </TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                            {rows.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{customer.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{customer.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button asChild variant="ghost" size="icon" title="View customer">
                                                <Link href={`/admin/customers/${customer.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete customer"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => remove(customer)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            {loading ? (
                                                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                        <Users className="text-muted-foreground h-8 w-8" />
                                                    </div>
                                                    <p className="font-medium">No customers found</p>
                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        {search ? 'Try a different search term.' : 'Registered customers will appear here.'}
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
                        <p className="text-muted-foreground text-sm">
                            Showing {from} to {to} of {recordsFiltered} entries
                            {recordsFiltered !== recordsTotal && ` (filtered from ${recordsTotal} total)`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0 || loading}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </Button>
                            <span className="text-muted-foreground px-2 text-sm">
                                Page {Math.min(page + 1, lastPage + 1)} of {lastPage + 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= lastPage || loading}
                                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
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
