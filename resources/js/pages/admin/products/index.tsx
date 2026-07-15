import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Pencil,
    Eye,
    PackageSearch,
    Image as ImageIcon,
    X,
    RefreshCw,
    ImagePlus,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import MediaPicker from '@/components/media-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
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

export default function ProductsIndex({
    categories,
    brands,
    tags,
}: {
    categories: any[];
    brands: any[];
    tags: any[];
}) {
    const { activeCurrency } = usePage().props as any;
    const currencySymbol = activeCurrency?.symbol || '৳';
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingProduct, setViewingProduct] = useState<any>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [variantPickerIndex, setVariantPickerIndex] = useState<number | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

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
    // Inertia's useForm updates its "defaults" to the submitted values after a
    // successful post, so reset() would refill the last product's data. Keep an
    // explicit blank state and always start "Add" from it.
    const EMPTY_PRODUCT = {
        name: '',
        description: '',
        price: '',
        discount_price: '',
        stock: '',
        category_id: '',
        brand_id: '',
        tags: [] as number[],
        image: null as File | null,
        image_url: '',
        variants: [] as any[],
        _method: 'post',
    };

    const { data, setData, post, processing, errors, clearErrors } = useForm<typeof EMPTY_PRODUCT>({ ...EMPTY_PRODUCT });

    const blankForm = () => setData({ ...EMPTY_PRODUCT, variants: [] });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct
            ? `/admin/products/${editingProduct.id}`
            : '/admin/products';
        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                setEditingProduct(null);
                blankForm();
                loadData();
            },
        });
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            discount_price: product.discount_price || '',
            stock: product.stock,
            category_id: product.category_id ? String(product.category_id) : '',
            brand_id: product.brand_id ? String(product.brand_id) : '',
            tags: product.tags ? product.tags.map((t: any) => t.id) : [],
            image: null,
            image_url: '',
            variants: product.variants || [],
            _method: 'put',
        });
        setIsOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            setTimeout(() => {
                setEditingProduct(null);
                blankForm();
                clearErrors();
            }, 300);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/admin/products/${id}`, {
                preserveScroll: true,
                onSuccess: () => loadData(),
            });
        }
    };

    const variantError = (index: number) =>
        (errors as Record<string, string>)[`variants.${index}.sku`];

    return (
        <AdminLayout title="Products">
            <Head title="Manage Products" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                    Manage your store's inventory and pricing.
                </p>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                blankForm();
                                clearErrors();
                                setEditingProduct(null);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl"
                        // Clicks inside the stacked MediaPicker dialog register as
                        // "outside" of this dialog — don't let them dismiss it.
                        onInteractOutside={(e) => {
                            if (pickerOpen) {
                                e.preventDefault();
                            }
                        }}
                        onEscapeKeyDown={(e) => {
                            if (pickerOpen) {
                                e.preventDefault();
                            }
                        }}
                        // When the picker unmounts, focus briefly lands outside this
                        // dialog and would dismiss it — focus is trapped anyway.
                        onFocusOutside={(e) => e.preventDefault()}
                    >
                        <DialogHeader className="border-b px-6 py-4">
                            <DialogTitle className="text-lg">
                                {editingProduct
                                    ? 'Edit Product'
                                    : 'Create Product'}
                            </DialogTitle>
                            <p className="text-sm font-normal text-muted-foreground">
                                {editingProduct
                                    ? 'Update the details of this product.'
                                    : 'Fill in the details below to add a new product to your catalog.'}
                            </p>
                        </DialogHeader>

                        <form onSubmit={submit}>
                            <div className="space-y-6 px-6 py-5">
                                {/* ---- Basic information ---- */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Basic Information
                                    </h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Product Name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="e.g. Nike Air Zoom Pegasus 41"
                                            className="h-10"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe the product's features, materials and fit..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* ---- Pricing & inventory ---- */}
                                <section className="space-y-4 border-t pt-5">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Pricing &amp; Inventory
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">
                                                Price{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                                    {currencySymbol}
                                                </span>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="h-10 pl-7"
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="text-sm text-destructive">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discount_price">
                                                Sale Price
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                                    {currencySymbol}
                                                </span>
                                                <Input
                                                    id="discount_price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.discount_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'discount_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Optional"
                                                    className="h-10 pl-7"
                                                />
                                            </div>
                                            {errors.discount_price && (
                                                <p className="text-sm text-destructive">
                                                    {errors.discount_price}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stock">
                                                Stock{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                value={data.stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'stock',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-10"
                                            />
                                            {errors.stock && (
                                                <p className="text-sm text-destructive">
                                                    {errors.stock}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* ---- Organization ---- */}
                                <section className="space-y-4 border-t pt-5">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Organization
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">
                                                Category
                                            </Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(v) =>
                                                    setData('category_id', v)
                                                }
                                            >
                                                <SelectTrigger
                                                    id="category_id"
                                                    className="h-10 w-full"
                                                >
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={String(
                                                                cat.id,
                                                            )}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-destructive">
                                                    {errors.category_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">
                                                Brand
                                            </Label>
                                            <Select
                                                value={data.brand_id}
                                                onValueChange={(v) =>
                                                    setData('brand_id', v)
                                                }
                                            >
                                                <SelectTrigger
                                                    id="brand_id"
                                                    className="h-10 w-full"
                                                >
                                                    <SelectValue placeholder="Select a brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem
                                                            key={brand.id}
                                                            value={String(
                                                                brand.id,
                                                            )}
                                                        >
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.brand_id && (
                                                <p className="text-sm text-destructive">
                                                    {errors.brand_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Tags</Label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                                                {tags.map((tag) => (
                                                    <div key={tag.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`tag-${tag.id}`}
                                                            checked={data.tags.includes(tag.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setData('tags', [...data.tags, tag.id]);
                                                                } else {
                                                                    setData('tags', data.tags.filter((id) => id !== tag.id));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`tag-${tag.id}`} className="font-normal cursor-pointer">
                                                            {tag.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* ---- Variants ---- */}
                                <section className="space-y-3 border-t pt-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Variants
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Sizes, colors or other options
                                                with their own stock.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setData('variants', [
                                                    ...data.variants,
                                                    {
                                                        type: 'color',
                                                        name: '',
                                                        price: '',
                                                        stock: '',
                                                        sku: '',
                                                    },
                                                ])
                                            }
                                            className="h-8 text-xs"
                                        >
                                            <Plus className="mr-1 h-3 w-3" />{' '}
                                            Add Variant
                                        </Button>
                                    </div>

                                    {data.variants.length === 0 ? (
                                        <p className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
                                            No variants — the product will be
                                            sold as a single item.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="border rounded-md overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-muted/50">
                                                        <TableRow>
                                                            <TableHead className="w-[30%] text-xs">Type & Name</TableHead>
                                                            <TableHead className="w-[15%] text-xs">Price</TableHead>
                                                            <TableHead className="w-[15%] text-xs">Stock</TableHead>
                                                            <TableHead className="w-[20%] text-xs">SKU</TableHead>
                                                            <TableHead className="w-[15%] text-center text-xs">Image</TableHead>
                                                            <TableHead className="w-[5%]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {data.variants.map((variant, index) => (
                                                            <TableRow key={index} className="group/row bg-card hover:bg-muted/20">
                                                                <TableCell className="p-2 align-top">
                                                                    <div className="flex gap-1">
                                                                        <Select
                                                                            value={variant.type || 'color'}
                                                                            onValueChange={(val) => {
                                                                                const v = [...data.variants];
                                                                                v[index].type = val;
                                                                                // If switched to size, we might want to clear the image, but let's just let the controller handle it or ignore.
                                                                                setData('variants', v);
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-[85px] h-9 text-xs">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="color">Color</SelectItem>
                                                                                <SelectItem value="size">Size</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Input
                                                                            placeholder="e.g. Size 42"
                                                                            value={variant.name}
                                                                            onChange={(e) => {
                                                                                const v = [...data.variants];
                                                                                v[index].name = e.target.value;
                                                                                setData('variants', v);
                                                                            }}
                                                                            className="h-9 flex-1 text-sm bg-transparent"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top">
                                                                    <Input
                                                                        placeholder="Inherit"
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={variant.price}
                                                                        onChange={(e) => {
                                                                            const v = [...data.variants];
                                                                            v[index].price = e.target.value;
                                                                            setData('variants', v);
                                                                        }}
                                                                        className="h-9 text-sm bg-transparent"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top">
                                                                    <Input
                                                                        placeholder="0"
                                                                        type="number"
                                                                        value={variant.stock}
                                                                        onChange={(e) => {
                                                                            const v = [...data.variants];
                                                                            v[index].stock = e.target.value;
                                                                            setData('variants', v);
                                                                        }}
                                                                        className="h-9 text-sm bg-transparent"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top">
                                                                    <div className="flex gap-1">
                                                                        <Input
                                                                            placeholder="Auto"
                                                                            value={variant.sku}
                                                                            onChange={(e) => {
                                                                                const v = [...data.variants];
                                                                                v[index].sku = e.target.value;
                                                                                setData('variants', v);
                                                                            }}
                                                                            className={`h-9 flex-1 text-sm bg-transparent ${variantError(index) ? 'border-destructive' : ''}`}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-9 w-9 shrink-0"
                                                                            title="Generate SKU"
                                                                            onClick={() => {
                                                                                const v = [...data.variants];
                                                                                v[index].sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                                                                                setData('variants', v);
                                                                            }}
                                                                        >
                                                                            <RefreshCw className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                    {variantError(index) && (
                                                                        <p className="mt-1 text-[10px] text-destructive">{variantError(index)}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-center">
                                                                    {(!variant.type || variant.type === 'color') ? (
                                                                        <div className="flex items-center justify-center gap-1 w-full">
                                                                            <label className="cursor-pointer group flex items-center justify-center w-10 h-10 border border-dashed rounded-md overflow-hidden relative bg-muted/10 hover:bg-muted/50 transition-colors shrink-0" title="Upload Variant Image — JPG, PNG, GIF or WebP. Max 20MB. Recommended size: 800x800px (1:1 square).">
                                                                                <input 
                                                                                    type="file" 
                                                                                    className="hidden" 
                                                                                    accept="image/*" 
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files && e.target.files.length > 0) {
                                                                                            const file = e.target.files[0];
                                                                                            const v = [...data.variants];
                                                                                            v[index].image = file;
                                                                                            v[index]._localPreview = URL.createObjectURL(file);
                                                                                            v[index].image_url = null;
                                                                                            setData('variants', v);
                                                                                        }
                                                                                    }} 
                                                                                />
                                                                                {variant._localPreview || variant.image_url || variant.image_path ? (
                                                                                    <img src={variant._localPreview || variant.image_url || variant.image_path} className="object-cover w-full h-full" alt="Variant Preview" />
                                                                                ) : (
                                                                                    <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                                                )}
                                                                            </label>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-10 w-10 shrink-0"
                                                                                title="Choose from Library"
                                                                                onClick={() => {
                                                                                    setVariantPickerIndex(index);
                                                                                    setPickerOpen(true);
                                                                                }}
                                                                            >
                                                                                <ImageIcon className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[10px] text-muted-foreground flex items-center justify-center h-10">N/A</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="p-2 align-top text-right">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-9 w-9 shrink-0 text-destructive hover:text-destructive opacity-50 group-hover/row:opacity-100 transition-opacity"
                                                                        onClick={() => setData('variants', data.variants.filter((_, i) => i !== index))}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* ---- Image ---- */}
                                <section className="space-y-3 border-t pt-5">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Product Image
                                    </h3>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                                            {data.image_url ? (
                                                <div className="relative h-full w-full">
                                                    <img
                                                        src={data.image_url}
                                                        alt="Selected"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'image_url',
                                                                '',
                                                            )
                                                        }
                                                        className="absolute top-1 right-1 rounded-full border bg-background p-0.5 shadow"
                                                        aria-label="Remove selected image"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : editingProduct?.images?.length >
                                              0 ? (
                                                <img
                                                    src={
                                                        editingProduct.images[0]
                                                            .image_path
                                                    }
                                                    alt="Current"
                                                    className="h-full w-full object-cover opacity-80"
                                                />
                                            ) : (
                                                <ImageIcon className="h-7 w-7 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Input
                                                    ref={imageInputRef}
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    className="h-10 flex-1"
                                                    onChange={(e) => {
                                                        setData(
                                                            'image',
                                                            e.target.files
                                                                ? e.target
                                                                      .files[0]
                                                                : null,
                                                        );

                                                        if (
                                                            e.target.files
                                                                ?.length
                                                        ) {
                                                            setData(
                                                                'image_url',
                                                                '',
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10"
                                                    onClick={() => {
                                                        setVariantPickerIndex(null);
                                                        setPickerOpen(true);
                                                    }}
                                                >
                                                    <ImagePlus className="mr-2 h-4 w-4" />{' '}
                                                    Library
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG or WebP — large images
                                                are compressed automatically.<br/>
                                                Max 20MB. Recommended size: 800x800px (1:1 square).
                                                {editingProduct &&
                                                    ' Leave empty to keep the current image.'}
                                            </p>
                                            {errors.image && (
                                                <p className="text-sm text-destructive">
                                                    {errors.image}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingProduct
                                        ? 'Update Product'
                                        : 'Save Product'}
                                </Button>
                            </DialogFooter>
                        </form>

                        {/* Nested inside this dialog so Radix treats it as a child
                            layer — a sibling dialog's clicks would dismiss this one. */}
                        <MediaPicker
                            open={pickerOpen}
                            onOpenChange={setPickerOpen}
                            onSelect={(m) => {
                                if (variantPickerIndex !== null) {
                                    const v = [...data.variants];
                                    v[variantPickerIndex].image_url = m.url;
                                    v[variantPickerIndex].image = null;
                                    v[variantPickerIndex]._localPreview = null;
                                    setData('variants', v);
                                    setVariantPickerIndex(null);
                                } else {
                                    setData('image_url', m.url);
                                    setData('image', null);

                                    if (imageInputRef.current) {
                                        imageInputRef.current.value = '';
                                    }
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
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
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
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

                                {/* Description */}
                                {viewingProduct.description && (
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-[11px] font-semibold uppercase tracking-wide">Description</p>
                                        <p className="text-sm leading-relaxed">{viewingProduct.description}</p>
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
                                <Button
                                    onClick={() => {
                                        setViewingProduct(null);
                                        handleEdit(viewingProduct);
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Product
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
