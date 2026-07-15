import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, GripVertical, Package, Search, X, ArrowUp, ArrowDown } from 'lucide-react';

type Category = { id: number; name: string };
type SectionProduct = { id: number; name: string; slug?: string };
type Section = {
    id: number;
    title: string;
    subtitle: string | null;
    type: 'trending' | 'deal' | 'featured' | 'custom';
    product_source: 'auto' | 'manual' | 'category';
    display_style: 'grid' | 'carousel' | 'list';
    product_limit: number;
    view_all_link: string | null;
    is_active: boolean;
    sort_order: number;
    category_ids?: number[];
    products_count?: number;
    products?: SectionProduct[];
};

const LIMITS = [4, 8, 12, 16, 20];

export default function HomeSectionsIndex({ sections, categories }: { sections: Section[]; categories: Category[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<Section | null>(null);
    const [managingId, setManagingId] = useState<number | null>(null);

    // Local ordering copy so drag-drop feels instant before it persists.
    const [order, setOrder] = useState<Section[]>(sections);
    useEffect(() => setOrder(sections), [sections]);

    const dragIndex = useRef<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subtitle: '',
        type: 'custom',
        product_source: 'manual',
        display_style: 'grid',
        product_limit: 8,
        view_all_link: '/products',
        is_active: true,
        category_ids: [] as number[],
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEdit = (s: Section) => {
        setEditing(s);
        setData({
            title: s.title,
            subtitle: s.subtitle ?? '',
            type: s.type,
            product_source: s.product_source,
            display_style: s.display_style,
            product_limit: s.product_limit,
            view_all_link: s.view_all_link ?? '',
            is_active: s.is_active,
            category_ids: s.category_ids ?? [],
        });
        clearErrors();
        setIsOpen(true);
    };

    // A custom section cannot use 'auto' (since it has no product flag to resolve from).
    const forcedNotAuto = data.type === 'custom';
    useEffect(() => {
        if (forcedNotAuto && data.product_source === 'auto') {
            setData('product_source', 'manual');
        }
    }, [forcedNotAuto]); // eslint-disable-line react-hooks/exhaustive-deps

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => setIsOpen(false), preserveScroll: true };
        if (editing) {
            put(`/admin/home-sections/${editing.id}`, opts);
        } else {
            post('/admin/home-sections', opts);
        }
    };

    const remove = (id: number) => {
        if (confirm('Delete this section? Its product assignments will be removed.')) {
            router.delete(`/admin/home-sections/${id}`, { preserveScroll: true });
        }
    };

    const toggleActive = (s: Section) => {
        router.put(
            `/admin/home-sections/${s.id}`,
            { ...s, subtitle: s.subtitle ?? '', view_all_link: s.view_all_link ?? '', is_active: !s.is_active },
            { preserveScroll: true },
        );
    };

    const persistOrder = (next: Section[]) => {
        setOrder(next);
        router.put(
            '/admin/home-sections-reorder',
            { sections: next.map((s, i) => ({ id: s.id, sort_order: i })) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const onDrop = (dropIndex: number) => {
        const from = dragIndex.current;
        dragIndex.current = null;
        if (from === null || from === dropIndex) return;
        const next = [...order];
        const [moved] = next.splice(from, 1);
        next.splice(dropIndex, 0, moved);
        persistOrder(next);
    };

    const managingSection = useMemo(
        () => sections.find((s) => s.id === managingId) ?? null,
        [sections, managingId],
    );

    return (
        <AdminLayout title="Home Page Layout">
            <Head title="Home Page Layout" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">
                    Control which product sections appear on the homepage, their order, style and products. Drag rows to reorder.
                </p>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) reset();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit Section' : 'Add Section'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Section Title</Label>
                                <Input id="title" placeholder="e.g. Trending Products" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                                <Input id="subtitle" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} />
                                {errors.subtitle && <p className="text-destructive text-sm">{errors.subtitle}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="trending">Trending</SelectItem>
                                            <SelectItem value="deal">Deal of the Day</SelectItem>
                                            <SelectItem value="featured">Featured</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Source</Label>
                                    <Select value={data.product_source} onValueChange={(v: any) => setData('product_source', v)}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto" disabled={forcedNotAuto}>Automatic (by type)</SelectItem>
                                            <SelectItem value="manual">Manual (pick products)</SelectItem>
                                            <SelectItem value="category">Category (pick categories)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {forcedNotAuto && <p className="text-muted-foreground text-xs">Custom sections cannot be auto.</p>}
                                </div>
                            </div>

                            {data.product_source === 'category' && (
                                <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                                    <Label>Select Categories</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <div key={cat.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`cat-${cat.id}`}
                                                    checked={data.category_ids?.includes(cat.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = data.category_ids || [];
                                                        if (checked) {
                                                            setData('category_ids', [...current, cat.id]);
                                                        } else {
                                                            setData('category_ids', current.filter((id) => id !== cat.id));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer text-sm">
                                                    {cat.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.category_ids && <p className="text-destructive text-sm">{errors.category_ids}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Display Style</Label>
                                    <Select value={data.display_style} onValueChange={(v) => setData('display_style', v)}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="grid">Grid</SelectItem>
                                            <SelectItem value="carousel">Carousel</SelectItem>
                                            <SelectItem value="list">List</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Products to Show</Label>
                                    <Select value={String(data.product_limit)} onValueChange={(v) => setData('product_limit', Number(v))}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {LIMITS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="view_all_link">"View All" Link (Optional)</Label>
                                <Input id="view_all_link" placeholder="/products" value={data.view_all_link} onChange={(e) => setData('view_all_link', e.target.value)} />
                                {errors.view_all_link && <p className="text-destructive text-sm">{errors.view_all_link}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', c as boolean)} />
                                <Label htmlFor="is_active" className="cursor-pointer font-normal">Active (visible on homepage)</Label>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>{editing ? 'Update Section' : 'Create Section'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {order.map((s, index) => (
                            <div
                                key={s.id}
                                draggable
                                onDragStart={() => (dragIndex.current = index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onDrop(index)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                            >
                                <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{s.title}</span>
                                        <Badge variant="outline" className="capitalize">{s.type}</Badge>
                                        <Badge variant="secondary" className="capitalize">{s.product_source}</Badge>
                                        <Badge variant="secondary" className="capitalize">{s.display_style}</Badge>
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        Shows {s.product_limit}
                                        {s.product_source === 'manual' ? ` · ${s.products_count ?? 0} selected` : ' · auto by type'}
                                    </p>
                                </div>

                                {s.product_source === 'manual' && (
                                    <Button variant="outline" size="sm" onClick={() => setManagingId(s.id)}>
                                        <Package className="mr-1.5 h-4 w-4" /> Products
                                    </Button>
                                )}

                                <Badge
                                    variant={s.is_active ? 'default' : 'secondary'}
                                    className="cursor-pointer"
                                    onClick={() => toggleActive(s)}
                                >
                                    {s.is_active ? 'Active' : 'Inactive'}
                                </Badge>

                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => remove(s.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {order.length === 0 && (
                            <div className="text-muted-foreground py-12 text-center text-sm">
                                No sections yet. Add one to start building your homepage.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ManageProductsDialog section={managingSection} onClose={() => setManagingId(null)} />
        </AdminLayout>
    );
}

/* ------------------------------------------------------------------ */
/* Product management (manual sections)                                */
/* ------------------------------------------------------------------ */

type SearchResult = { id: number; name: string; price?: string; discount_price?: string | null };

function ManageProductsDialog({ section, onClose }: { section: Section | null; onClose: () => void }) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const products = section?.products ?? [];
    const assignedIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

    useEffect(() => {
        if (search.trim().length < 1) {
            setResults([]);
            return;
        }
        setSearching(true);
        const t = setTimeout(() => {
            fetch(`/admin/invoices-search-products?q=${encodeURIComponent(search)}`, {
                headers: { Accept: 'application/json' },
            })
                .then((r) => r.json())
                .then((d) => setResults(Array.isArray(d) ? d : []))
                .catch(() => setResults([]))
                .finally(() => setSearching(false));
        }, 250);
        return () => clearTimeout(t);
    }, [search]);

    if (!section) return null;

    const attach = (productId: number) => {
        router.post(`/admin/home-sections/${section.id}/products`, { product_id: productId }, { preserveScroll: true, preserveState: true });
    };

    const detach = (productId: number) => {
        router.delete(`/admin/home-sections/${section.id}/products/${productId}`, { preserveScroll: true, preserveState: true });
    };

    const move = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= products.length) return;
        const next = [...products];
        [next[index], next[target]] = [next[target], next[index]];
        router.put(
            `/admin/home-sections/${section.id}/products-reorder`,
            { products: next.map((p, i) => ({ id: p.id, sort_order: i })) },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Dialog open={!!section} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Products — {section.title}</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input className="pl-9" placeholder="Search products by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    {search.trim().length > 0 && (
                        <div className="bg-popover absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border shadow-md">
                            {searching && <div className="text-muted-foreground px-3 py-2 text-sm">Searching…</div>}
                            {!searching && results.length === 0 && <div className="text-muted-foreground px-3 py-2 text-sm">No products found.</div>}
                            {results.map((r) => {
                                const already = assignedIds.has(r.id);
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        disabled={already}
                                        onClick={() => { attach(r.id); setSearch(''); }}
                                        className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm disabled:opacity-50"
                                    >
                                        <span>{r.name}</span>
                                        {already ? <Badge variant="secondary">Added</Badge> : <Plus className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-2 divide-y divide-border rounded-md border">
                    {products.length === 0 && (
                        <div className="text-muted-foreground py-8 text-center text-sm">No products selected yet.</div>
                    )}
                    {products.map((p, index) => (
                        <div key={p.id} className="flex items-center gap-2 px-3 py-2">
                            <span className="text-muted-foreground w-6 text-center text-xs">{index + 1}</span>
                            <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)}>
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === products.length - 1} onClick={() => move(index, 1)}>
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => detach(p.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
