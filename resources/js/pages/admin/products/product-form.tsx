import { Head, useForm, usePage, Link } from '@inertiajs/react';
import JoditEditor from 'jodit-react';

// Paste rich content straight in as clean HTML — never pop the "keep as HTML /
// insert as text" dialog, whose "as text" option escaped tags into &lt;p&gt;
// that then showed up literally on the storefront.
const pasteBehaviour = {
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html' as const,
    processPasteHTML: true,
};

const descriptionEditorConfig = {
    readonly: false,
    height: 300,
    placeholder: "Describe the product's features, materials and fit...",
    ...pasteBehaviour,
};

const shortDescriptionEditorConfig = {
    readonly: false,
    height: 150,
    placeholder: 'A brief summary shown near the top of the product page...',
    ...pasteBehaviour,
};
import {
    ArrowLeft,
    Trash2,
    Image as ImageIcon,
    X,
    RefreshCw,
    ImagePlus,
    Plus,
    Loader2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import MediaPicker from '@/components/media-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import AdminLayout from '@/layouts/admin-layout';

export default function ProductForm({
    product = null,
    categories,
    brands,
    tags,
}: {
    product?: any;
    categories: any[];
    brands: any[];
    tags: any[];
}) {
    // Products are priced in the store's default currency, so the admin panel
    // always shows that currency's symbol — never the visitor-selected one.
    const { currencies } = usePage().props as any;
    const defaultCurrency = currencies?.find((c: any) => c.is_default);
    const currencySymbol = defaultCurrency?.symbol || '৳';
    const isEditing = !!product;
    const [pickerOpen, setPickerOpen] = useState(false);
    const [variantPickerIndex, setVariantPickerIndex] = useState<number | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Normalise a variant loaded from the server into the multi-image shape the
    // form works with: kept_images (existing/library URLs) + new_images (pending
    // uploads) + _previews (blob URLs paired with new_images, transient).
    const toFormVariant = (v: any) => ({
        ...v,
        kept_images: Array.isArray(v.images) && v.images.length > 0
            ? [...v.images]
            : (v.image_path ? [v.image_path] : []),
        new_images: [] as File[],
        _previews: [] as string[],
    });

    const { data, setData, post, processing, errors, transform } = useForm<any>({
        name: product?.name ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        discount_price: product?.discount_price ?? '',
        stock: product?.stock ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        brand_id: product?.brand_id ? String(product.brand_id) : '',
        tags: product?.tags ? product.tags.map((t: any) => t.id) : [],
        image: null as File | null,
        image_url: '',
        variants: (product?.variants || []).map(toFormVariant),
        _method: isEditing ? 'put' : 'post',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing ? `/admin/products/${product.id}` : '/admin/products';
        // Drop transient preview-only keys so only kept_images + new_images reach
        // the backend for each variant.
        transform((payload: any) => ({
            ...payload,
            variants: (payload.variants || []).map((v: any) => {
                const { _previews, _localPreview, image, image_url, image_path, images, ...rest } = v;
                return rest;
            }),
        }));
        // On success the controller redirects to the products list.
        post(url, { forceFormData: true });
    };

    const variantError = (index: number) =>
        (errors as Record<string, string>)[`variants.${index}.sku`];

    return (
        <AdminLayout title={isEditing ? 'Edit Product' : 'Add Product'}>
            <Head title={isEditing ? 'Edit Product' : 'Add Product'} />

            <div className="mb-6">
                <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
                    <Link href="/admin/products">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                    {isEditing ? 'Edit Product' : 'Add Product'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isEditing
                        ? 'Update the details of this product.'
                        : 'Fill in the details below to add a new product to your catalog.'}
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
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
                                        <Label>Short Description</Label>
                                        <div className="rounded-md border">
                                            <JoditEditor
                                                value={data.short_description}
                                                config={shortDescriptionEditorConfig}
                                                onBlur={(newContent) => setData('short_description', newContent)}
                                            />
                                        </div>
                                        {errors.short_description && (
                                            <p className="text-sm text-destructive">
                                                {errors.short_description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Long Description</Label>
                                        <div className="rounded-md border">
                                            <JoditEditor
                                                value={data.description}
                                                config={descriptionEditorConfig}
                                                onBlur={(newContent) => setData('description', newContent)}
                                            />
                                        </div>
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
                                                                    setData('tags', data.tags.filter((id: number) => id !== tag.id));
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
                                                        kept_images: [],
                                                        new_images: [],
                                                        _previews: [],
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
                                                        {data.variants.map((variant: any, index: number) => (
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
                                                                        <div className="flex flex-wrap items-center justify-center gap-1 w-full max-w-[180px] mx-auto">
                                                                            {/* Kept / library images */}
                                                                            {(variant.kept_images || []).map((src: string, imgIdx: number) => (
                                                                                <div key={`k-${imgIdx}`} className="group/img relative w-10 h-10 rounded-md overflow-hidden border shrink-0">
                                                                                    <img src={src} className="object-cover w-full h-full" alt="Variant" />
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Remove image"
                                                                                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                                                        onClick={() => {
                                                                                            const v = [...data.variants];
                                                                                            v[index].kept_images = (v[index].kept_images || []).filter((_: string, i: number) => i !== imgIdx);
                                                                                            setData('variants', v);
                                                                                        }}
                                                                                    >
                                                                                        <X className="h-3.5 w-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            {/* Newly uploaded (pending) images */}
                                                                            {(variant._previews || []).map((src: string, imgIdx: number) => (
                                                                                <div key={`n-${imgIdx}`} className="group/img relative w-10 h-10 rounded-md overflow-hidden border border-primary/40 shrink-0">
                                                                                    <img src={src} className="object-cover w-full h-full" alt="New" />
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Remove image"
                                                                                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                                                        onClick={() => {
                                                                                            const v = [...data.variants];
                                                                                            v[index].new_images = (v[index].new_images || []).filter((_: File, i: number) => i !== imgIdx);
                                                                                            v[index]._previews = (v[index]._previews || []).filter((_: string, i: number) => i !== imgIdx);
                                                                                            setData('variants', v);
                                                                                        }}
                                                                                    >
                                                                                        <X className="h-3.5 w-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            {/* Upload (multiple) */}
                                                                            <label className="cursor-pointer group flex items-center justify-center w-10 h-10 border border-dashed rounded-md overflow-hidden relative bg-muted/10 hover:bg-muted/50 transition-colors shrink-0" title="Upload one or more images — JPG, PNG, GIF or WebP. Max 20MB each. Recommended 800x800px (1:1).">
                                                                                <input
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    accept="image/*"
                                                                                    multiple
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files && e.target.files.length > 0) {
                                                                                            const files = Array.from(e.target.files);
                                                                                            const v = [...data.variants];
                                                                                            v[index].new_images = [...(v[index].new_images || []), ...files];
                                                                                            v[index]._previews = [...(v[index]._previews || []), ...files.map((f) => URL.createObjectURL(f))];
                                                                                            setData('variants', v);
                                                                                            e.target.value = '';
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                                                                        onClick={() => setData('variants', data.variants.filter((_: any, i: number) => i !== index))}
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
                                            ) : product?.images?.length >
                                              0 ? (
                                                <img
                                                    src={
                                                        product.images[0]
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
                                                {isEditing &&
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

                            <div className="flex justify-end gap-2 border-t bg-muted/30 px-6 py-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/products">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isEditing
                                        ? 'Update Product'
                                        : 'Save Product'}
                                </Button>
                            </div>
                        </form>

                        <MediaPicker
                            open={pickerOpen}
                            onOpenChange={setPickerOpen}
                            onSelect={(m) => {
                                if (variantPickerIndex !== null) {
                                    const v = [...data.variants];
                                    // Append the library image to this variant's kept list.
                                    v[variantPickerIndex].kept_images = [...(v[variantPickerIndex].kept_images || []), m.url];
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
                    </CardContent>
                </Card>
        </AdminLayout>
    );
}
