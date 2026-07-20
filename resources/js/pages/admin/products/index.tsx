import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Pencil,
    Eye,
    PackageSearch,
    Image as ImageIcon,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
 * Hidden columns (slug, sku, brand.name) only widen the global search.
 */
const DT_COLUMNS: DataTableColumn[] = [
    { data: 'id', name: 'id', searchable: false, orderable: true },
    { data: 'name', name: 'name', searchable: true, orderable: true },
    {
        data: 'category.name',
        name: 'category.name',
        searchable: true,
        orderable: true,
    },
    { data: 'price', name: 'price', searchable: false, orderable: true },
    { data: 'stock', name: 'stock', searchable: false, orderable: true },
    { data: 'slug', name: 'slug', searchable: true, orderable: false },
    { data: 'sku', name: 'sku', searchable: true, orderable: false },
    {
        data: 'brand.name',
        name: 'brand.name',
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

export default function ProductsIndex() {
    // Products are priced in the store's default currency, so the admin panel
    // always shows that currency's symbol — never the visitor-selected one.
    const { currencies } = usePage().props as any;
    const defaultCurrency = currencies?.find((c: any) => c.is_default);
    const currencySymbol = defaultCurrency?.symbol || '৳';
    const [viewingProduct, setViewingProduct] = useState<any>(null);

    // Server-side DataTable via yajra/laravel-datatables.
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
        reload: loadData,
        lastPage,
        from,
        to,
    } = useDataTable('/admin/products-data', DT_COLUMNS);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/admin/products/${id}`, {
                preserveScroll: true,
                onSuccess: () => loadData(),
            });
        }
    };

    return (
        <AdminLayout title="Products">
            <Head title="Manage Products" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                    Manage your store's inventory and pricing.
                </p>

                <Button asChild>
                    <Link href="/admin/products/create">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="px-0">
                    {/* Table toolbar: global search + page size */}
                    <div className="flex flex-col gap-3 border-b px-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search products, category, brand, SKU..."
                                className="h-9 pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Show</span>
                            <Select
                                value={String(perPage)}
                                onValueChange={(v) => {
                                    setPerPage(Number(v));
                                    setPage(0);
                                }}
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
                                    Product{' '}
                                    <SortIndicator order={order} col={1} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(2)}
                                >
                                    Category{' '}
                                    <SortIndicator order={order} col={2} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(3)}
                                >
                                    Price{' '}
                                    <SortIndicator order={order} col={3} />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => toggleSort(4)}
                                >
                                    Stock{' '}
                                    <SortIndicator order={order} col={4} />
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
                            {rows.map((product: any) => (
                                <TableRow key={product.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                {product.images &&
                                                product.images.length > 0 ? (
                                                    <img
                                                        src={
                                                            product.images[0]
                                                                .image_path
                                                        }
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.slug}
                                                    {product.variants &&
                                                        product.variants
                                                            .length > 0 && (
                                                            <span className="ml-2 text-primary">
                                                                (
                                                                {
                                                                    product
                                                                        .variants
                                                                        .length
                                                                }{' '}
                                                                variants)
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            {product.category ? (
                                                <Badge variant="outline">
                                                    {product.category.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    -
                                                </span>
                                            )}
                                            {product.brand && (
                                                <span className="text-xs text-muted-foreground">
                                                    {product.brand.name}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {currencySymbol}{product.price}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.stock > 10
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.stock} in stock
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="View Details"
                                                onClick={() =>
                                                    setViewingProduct(product)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Edit"
                                                asChild
                                            >
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
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
                                        colSpan={5}
                                        className="py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center">
                                            {loading ? (
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            ) : (
                                                <>
                                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                        <PackageSearch className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="font-medium">
                                                        No products found
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {search
                                                            ? 'Try a different search term.'
                                                            : 'Get started by creating a new product.'}
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
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
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

            {/* Read-only product details modal */}
            <Dialog open={!!viewingProduct} onOpenChange={(o) => !o && setViewingProduct(null)}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
                    {viewingProduct && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="pr-6">{viewingProduct.name}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5">
                                {/* Image + key facts */}
                                <div className="flex gap-4">
                                    <div className="bg-muted flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                        {viewingProduct.images?.length > 0 ? (
                                            <img
                                                src={viewingProduct.images[0].image_path}
                                                alt={viewingProduct.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground h-8 w-8" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-lg font-bold">
                                                {currencySymbol}
                                                {Number(
                                                    viewingProduct.discount_price &&
                                                        Number(viewingProduct.discount_price) > 0 &&
                                                        Number(viewingProduct.discount_price) < Number(viewingProduct.price)
                                                        ? viewingProduct.discount_price
                                                        : viewingProduct.price,
                                                ).toLocaleString()}
                                            </span>
                                            {viewingProduct.discount_price &&
                                                Number(viewingProduct.discount_price) > 0 &&
                                                Number(viewingProduct.discount_price) < Number(viewingProduct.price) && (
                                                    <span className="text-muted-foreground text-sm line-through">
                                                        {currencySymbol}{Number(viewingProduct.price).toLocaleString()}
                                                    </span>
                                                )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            <Badge variant={viewingProduct.is_active ? 'default' : 'secondary'}>
                                                {viewingProduct.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant={viewingProduct.stock > 10 ? 'outline' : 'destructive'}>
                                                {viewingProduct.stock} in stock
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground truncate text-xs">SKU: {viewingProduct.sku || '—'}</p>
                                        <p className="text-muted-foreground truncate text-xs">Slug: {viewingProduct.slug}</p>
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-muted/40 rounded-lg border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">Category</p>
                                        <p className="mt-0.5 font-medium">{viewingProduct.category?.name || '—'}</p>
                                    </div>
                                    <div className="bg-muted/40 rounded-lg border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">Brand</p>
                                        <p className="mt-0.5 font-medium">{viewingProduct.brand?.name || '—'}</p>
                                    </div>
                                </div>

                                {/* Short Description (rich text) */}
                                {viewingProduct.short_description && (
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wide">Short Description</p>
                                        <div className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert" dangerouslySetInnerHTML={{ __html: viewingProduct.short_description }} />
                                    </div>
                                )}

                                {/* Long Description (rich text) */}
                                {viewingProduct.description && (
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wide">Long Description</p>
                                        <div className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert" dangerouslySetInnerHTML={{ __html: viewingProduct.description }} />
                                    </div>
                                )}

                                {/* Variants */}
                                {viewingProduct.variants?.length > 0 && (
                                    <div>
                                        <p className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-wide">
                                            Variants ({viewingProduct.variants.length})
                                        </p>
                                        <div className="overflow-hidden rounded-lg border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr className="text-muted-foreground text-left text-xs">
                                                        <th className="px-3 py-2 font-medium">Name</th>
                                                        <th className="px-3 py-2 font-medium">Price</th>
                                                        <th className="px-3 py-2 font-medium">Stock</th>
                                                        <th className="px-3 py-2 font-medium">SKU</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {viewingProduct.variants.map((v: any) => (
                                                        <tr key={v.id} className="border-t">
                                                            <td className="px-3 py-2">{v.name}</td>
                                                            <td className="px-3 py-2">
                                                                {v.price ? `${currencySymbol}${Number(v.price).toLocaleString()}` : 'Inherit'}
                                                            </td>
                                                            <td className="px-3 py-2">{v.stock}</td>
                                                            <td className="text-muted-foreground px-3 py-2 text-xs">{v.sku || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" asChild>
                                    <a href={`/products/${viewingProduct.slug}`} target="_blank">
                                        <Eye className="mr-2 h-4 w-4" /> View in Store
                                    </a>
                                </Button>
                                <Button asChild>
                                    <Link href={`/admin/products/${viewingProduct.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit Product
                                    </Link>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
