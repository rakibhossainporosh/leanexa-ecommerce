import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Award, ExternalLink, X } from 'lucide-react';

export default function BrandsIndex({ brands }: { brands: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        description: '',
        website: '',
        is_active: true,
        logo: null as File | null,
        remove_logo: false,
        _method: 'post',
    });

    // Preview: a freshly picked file, else the brand's existing logo (unless cleared).
    const newLogoPreview = useMemo(() => (data.logo ? URL.createObjectURL(data.logo) : null), [data.logo]);
    const existingLogo = editingBrand && !data.remove_logo ? editingBrand.logo_url : null;
    const logoPreview = newLogoPreview || existingLogo;

    // reset() restores Inertia's "defaults", which become the last submitted
    // values after a successful save — so "Add Brand" would show the brand just
    // edited. Always start from an explicit blank state instead.
    const blankBrand = () => setData({
        name: '',
        description: '',
        website: '',
        is_active: true,
        logo: null,
        remove_logo: false,
        _method: 'post',
    });

    const openCreateModal = () => {
        setEditingBrand(null);
        blankBrand();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (brand: any) => {
        setEditingBrand(brand);
        setData({
            name: brand.name,
            description: brand.description || '',
            website: brand.website || '',
            is_active: brand.is_active,
            logo: null,
            remove_logo: false,
            _method: 'put',
        });
        clearErrors();
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBrand) {
            post(`/admin/brands/${editingBrand.id}`, { onSuccess: () => setIsOpen(false) });
        } else {
            post('/admin/brands', { onSuccess: () => setIsOpen(false) });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            router.delete(`/admin/brands/${id}`);
        }
    };

    const toggleStatus = (brand: any) => {
        router.put(
            `/admin/brands/${brand.id}`,
            { name: brand.name, description: brand.description, website: brand.website, is_active: !brand.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout title="Brands">
            <Head title="Manage Brands" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Manage the manufacturers and brands sold in your store.</p>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            setEditingBrand(null);
                            blankBrand();
                            clearErrors();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" /> Add Brand
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Apple" />
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Brand Logo (Optional)</Label>
                                <div className="flex items-start gap-3">
                                    {logoPreview && (
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                                            <button
                                                type="button"
                                                title="Remove logo"
                                                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                                onClick={() => {
                                                    setData((prev: any) => ({ ...prev, logo: null, remove_logo: true }));
                                                    const el = document.getElementById('logo') as HTMLInputElement | null;
                                                    if (el) el.value = '';
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData((prev: any) => ({ ...prev, logo: e.target.files ? e.target.files[0] : null, remove_logo: false }))}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP or SVG. Max 2MB. Recommended size: 400x300px (4:3).</p>
                                    </div>
                                </div>
                                {errors.logo && <p className="text-destructive text-sm">{errors.logo}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website (Optional)</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://example.com"
                                />
                                {errors.website && <p className="text-destructive text-sm">{errors.website}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the brand..."
                                />
                                {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
                                <Label htmlFor="is_active" className="cursor-pointer font-normal">Active (Visible in store)</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {editingBrand ? 'Update Brand' : 'Save Brand'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Brand</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.map((brand) => (
                                <TableRow key={brand.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-md bg-white p-0.5 border">
                                                {brand.logo_url ? <AvatarImage src={brand.logo_url} alt={brand.name} className="object-contain" /> : null}
                                                <AvatarFallback className="rounded-md text-xs font-semibold">
                                                    {brand.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{brand.name}</div>
                                                {brand.description && (
                                                    <div className="text-muted-foreground max-w-xs truncate text-xs">{brand.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {brand.website ? (
                                            <a
                                                href={brand.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                                            >
                                                Visit <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{brand.slug}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={brand.is_active ? 'default' : 'secondary'}
                                            className="cursor-pointer"
                                            onClick={() => toggleStatus(brand)}
                                        >
                                            {brand.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(brand)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-8 w-8"
                                                onClick={() => handleDelete(brand.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {brands.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                <Award className="text-muted-foreground h-8 w-8" />
                                            </div>
                                            <p className="font-medium">No brands found</p>
                                            <p className="text-muted-foreground mt-1 text-sm">Get started by adding your first brand.</p>
                                        </div>
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
