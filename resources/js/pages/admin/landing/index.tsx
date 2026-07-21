import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Pencil, ImagePlus, X, Images, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import MediaPicker from '@/components/media-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

type LandingSettings = {
    hero_enabled: boolean;
    featured_title: string;
    featured_subtitle: string;
    promo_enabled: boolean;
    promo_eyebrow: string;
    promo_title: string;
    promo_subtitle: string;
    promo_button_text: string;
    promo_link: string;
    mid_banner_enabled: boolean;
    mid_banner_image: string;
    mid_banner_link: string;
    brands_enabled: boolean;
    brands_title: string;
    services: { icon: string; title: string; desc: string }[];
    promo_tiles: {
        eyebrow: string;
        title: string;
        img: string;
        link: string;
    }[];
};

type Banner = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    button_text: string | null;
    link: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function LandingIndex({
    settings,
    banners,
}: {
    settings: LandingSettings;
    banners: Banner[];
}) {
    /* ---------------- Content settings ---------------- */
    const settingsForm = useForm<LandingSettings>({ ...settings });

    const saveSettings = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        settingsForm.put('/admin/landing', {
            preserveScroll: true,
            onSuccess: () => toast.success('Landing page settings saved.'),
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(firstError);
                } else {
                    toast.error('Please check the form for errors.');
                }
            }
        });
    };

    const updateService = (index: number, key: string, value: string) => {
        const newServices = [...(settingsForm.data.services || [])];
        newServices[index] = { ...newServices[index], [key]: value } as any;
        settingsForm.setData('services', newServices);
    };

    const updatePromoTile = (index: number, key: string, value: string) => {
        const newTiles = [...(settingsForm.data.promo_tiles || [])];
        newTiles[index] = { ...newTiles[index], [key]: value } as any;
        settingsForm.setData('promo_tiles', newTiles);
    };

    /* ---------------- Banners ---------------- */
    const [bannerOpen, setBannerOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [midBannerPickerOpen, setMidBannerPickerOpen] = useState(false);
    const [promoPickerIndex, setPromoPickerIndex] = useState<number | null>(
        null,
    );

    // Inertia's useForm updates its "defaults" to the submitted values after a
    // successful post, so reset() would refill the last banner's data. Keep an
    // explicit blank state and always start "Add" from it.
    const EMPTY_BANNER = {
        title: '',
        subtitle: '',
        image: '',
        button_text: 'Shop Now',
        link: '/products',
        sort_order: 0,
        is_active: true,
    };

    const bannerForm = useForm<typeof EMPTY_BANNER>({ ...EMPTY_BANNER });

    const openCreateBanner = () => {
        setEditingBanner(null);
        bannerForm.setData({ ...EMPTY_BANNER });
        bannerForm.clearErrors();
        setBannerOpen(true);
    };

    const openEditBanner = (b: Banner) => {
        setEditingBanner(b);
        bannerForm.setData({
            title: b.title,
            subtitle: b.subtitle ?? '',
            image: b.image ?? '',
            button_text: b.button_text ?? '',
            link: b.link ?? '',
            sort_order: b.sort_order,
            is_active: b.is_active,
        });
        bannerForm.clearErrors();
        setBannerOpen(true);
    };

    const submitBanner = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setBannerOpen(false);
                toast.success(editingBanner ? 'Banner updated.' : 'Banner added.');
            },
        };

        if (editingBanner) {
            bannerForm.put(`/admin/landing/banners/${editingBanner.id}`, opts);
        } else {
            bannerForm.post('/admin/landing/banners', opts);
        }
    };

    const deleteBanner = (b: Banner) => {
        if (confirm(`Delete banner "${b.title}"?`)) {
            router.delete(`/admin/landing/banners/${b.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Banner deleted.'),
            });
        }
    };

    const field = (key: keyof LandingSettings) =>
        settingsForm.data[key] as string;

    return (
        <AdminLayout title="Landing Page">
            <Head title="Landing Page Customization" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Customize what visitors see on your storefront home page.
                </p>
                <Button
                    onClick={() => saveSettings()}
                    disabled={settingsForm.processing}
                >
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {/* ---------------- Left Column ---------------- */}
                <div className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Services / Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(settingsForm.data.services || []).map(
                                (service, idx) => (
                                    <div
                                        key={idx}
                                        className="space-y-2 border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="text-sm font-medium">
                                            Feature {idx + 1}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={service.title}
                                                    onChange={(e) =>
                                                        updateService(
                                                            idx,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Icon</Label>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={service.icon}
                                                    onChange={(e) =>
                                                        updateService(
                                                            idx,
                                                            'icon',
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="Truck">
                                                        Truck (Shipping)
                                                    </option>
                                                    <option value="CreditCard">
                                                        Credit Card (Payment)
                                                    </option>
                                                    <option value="RefreshCw">
                                                        Refresh (Returns)
                                                    </option>
                                                    <option value="ShieldCheck">
                                                        Shield
                                                        (Warranty/Security)
                                                    </option>
                                                    <option value="Package">
                                                        Package
                                                    </option>
                                                    <option value="Zap">
                                                        Lightning / Fast
                                                    </option>
                                                    <option value="Gift">
                                                        Gift
                                                    </option>
                                                    <option value="Tag">
                                                        Tag / Discount
                                                    </option>
                                                    <option value="Heart">
                                                        Heart
                                                    </option>
                                                    <option value="Star">
                                                        Star
                                                    </option>
                                                    <option value="Phone">
                                                        Phone / Support
                                                    </option>
                                                    <option value="MapPin">
                                                        Location Pin
                                                    </option>
                                                    <option value="Clock">
                                                        Clock
                                                    </option>
                                                    <option value="Headphones">
                                                        Headphones / Support
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                value={service.desc}
                                                onChange={(e) =>
                                                    updateService(
                                                        idx,
                                                        'desc',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Top Brands
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={settingsForm.data.brands_enabled}
                                    onCheckedChange={(c) =>
                                        settingsForm.setData(
                                            'brands_enabled',
                                            c as boolean,
                                        )
                                    }
                                />
                                <span className="text-sm font-medium">
                                    Show top brands section
                                </span>
                            </label>
                            <div className="space-y-2">
                                <Label htmlFor="brands_title">
                                    Section title
                                </Label>
                                <Input
                                    id="brands_title"
                                    value={field('brands_title')}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'brands_title',
                                            e.target.value,
                                        )
                                    }
                                />
                                {settingsForm.errors.brands_title && (
                                    <p className="text-sm text-destructive">
                                        {settingsForm.errors.brands_title}
                                    </p>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Only <span className="font-medium">active</span>{' '}
                                brands appear in this section. Add, edit, or
                                hide brands from the{' '}
                                <Link
                                    href="/admin/brands"
                                    className="text-primary underline underline-offset-2"
                                >
                                    Brands
                                </Link>{' '}
                                page.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ---------------- Right Column ---------------- */}
                <div className="space-y-6">
                    <Card className="h-fit">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base">
                                Hero Banners
                            </CardTitle>
                            <Dialog
                                open={bannerOpen}
                                onOpenChange={(o) => {
                                    setBannerOpen(o);

                                    if (!o) {
                                        setEditingBanner(null);
                                        bannerForm.setData({ ...EMPTY_BANNER });
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        onClick={openCreateBanner}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Banner
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]"
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
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingBanner
                                                ? 'Edit Banner'
                                                : 'Add Banner'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={submitBanner}
                                        className="space-y-4 pt-2"
                                    >
                                        <div className="space-y-2">
                                            <Label>Image</Label>
                                            <div className="flex items-center gap-3">
                                                {bannerForm.data.image ? (
                                                    <div className="relative">
                                                        <img
                                                            src={
                                                                bannerForm.data
                                                                    .image
                                                            }
                                                            alt=""
                                                            className="h-16 w-28 rounded-md border object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                bannerForm.setData(
                                                                    'image',
                                                                    '',
                                                                )
                                                            }
                                                            className="absolute -top-2 -right-2 rounded-full border bg-background p-0.5 shadow"
                                                            aria-label="Remove image"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-16 w-28 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                                        <Images className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setPickerOpen(true)
                                                    }
                                                >
                                                    <ImagePlus className="mr-2 h-4 w-4" />{' '}
                                                    Choose Image
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Max 20MB. Recommended size: 1920x800px (12:5 wide).</p>
                                            <InputError
                                                message={bannerForm.errors.image}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="b_title">
                                                Title
                                            </Label>
                                            <Input
                                                id="b_title"
                                                value={bannerForm.data.title}
                                                onChange={(e) =>
                                                    bannerForm.setData(
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {bannerForm.errors.title && (
                                                <p className="text-sm text-destructive">
                                                    {bannerForm.errors.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="b_subtitle">
                                                Subtitle
                                            </Label>
                                            <Textarea
                                                id="b_subtitle"
                                                value={bannerForm.data.subtitle}
                                                onChange={(e) =>
                                                    bannerForm.setData(
                                                        'subtitle',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="b_button">
                                                    Button text
                                                </Label>
                                                <Input
                                                    id="b_button"
                                                    value={
                                                        bannerForm.data
                                                            .button_text
                                                    }
                                                    onChange={(e) =>
                                                        bannerForm.setData(
                                                            'button_text',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="b_link">
                                                    Button link
                                                </Label>
                                                <Input
                                                    id="b_link"
                                                    value={bannerForm.data.link}
                                                    onChange={(e) =>
                                                        bannerForm.setData(
                                                            'link',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="/products"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 items-end gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="b_order">
                                                    Sort order
                                                </Label>
                                                <Input
                                                    id="b_order"
                                                    type="number"
                                                    min={0}
                                                    value={
                                                        bannerForm.data
                                                            .sort_order
                                                    }
                                                    onChange={(e) =>
                                                        bannerForm.setData(
                                                            'sort_order',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <label className="flex h-9 items-center gap-2">
                                                <Checkbox
                                                    checked={
                                                        bannerForm.data
                                                            .is_active
                                                    }
                                                    onCheckedChange={(c) =>
                                                        bannerForm.setData(
                                                            'is_active',
                                                            c as boolean,
                                                        )
                                                    }
                                                />
                                                <span className="text-sm font-medium">
                                                    Active
                                                </span>
                                            </label>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={bannerForm.processing}
                                            >
                                                {editingBanner
                                                    ? 'Update Banner'
                                                    : 'Add Banner'}
                                            </Button>
                                        </DialogFooter>
                                    </form>

                                    {/* Nested inside this dialog so Radix treats it as a child
                                    layer — a sibling dialog's clicks would dismiss this one. */}
                                    <MediaPicker
                                        open={pickerOpen}
                                        onOpenChange={setPickerOpen}
                                        onSelect={(m) =>
                                            bannerForm.setData('image', m.url)
                                        }
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="px-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">
                                            Banner
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="pr-6 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {banners.map((b) => (
                                        <TableRow key={b.id} className="group">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    {b.image ? (
                                                        <img
                                                            src={b.image}
                                                            alt=""
                                                            className="h-10 w-16 rounded border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-16 items-center justify-center rounded border bg-muted text-muted-foreground">
                                                            <Images className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {b.title}
                                                        </div>
                                                        {b.subtitle && (
                                                            <div className="truncate text-xs text-muted-foreground">
                                                                {b.subtitle}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        b.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {b.is_active
                                                        ? 'Active'
                                                        : 'Hidden'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openEditBanner(b)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            deleteBanner(b)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {banners.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-10 text-center text-sm text-muted-foreground"
                                            >
                                                No banners yet. Add one to
                                                populate the hero slider.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Promo Banner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={settingsForm.data.promo_enabled}
                                    onCheckedChange={(c) =>
                                        settingsForm.setData(
                                            'promo_enabled',
                                            c as boolean,
                                        )
                                    }
                                />
                                <span className="text-sm font-medium">
                                    Show promo banner
                                </span>
                            </label>
                            <div className="space-y-2">
                                <Label htmlFor="promo_eyebrow">Eyebrow</Label>
                                <Input
                                    id="promo_eyebrow"
                                    value={field('promo_eyebrow')}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'promo_eyebrow',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo_title">Title</Label>
                                <Input
                                    id="promo_title"
                                    value={field('promo_title')}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'promo_title',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo_subtitle">Subtitle</Label>
                                <Textarea
                                    id="promo_subtitle"
                                    value={field('promo_subtitle')}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'promo_subtitle',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="promo_button_text">
                                        Button text
                                    </Label>
                                    <Input
                                        id="promo_button_text"
                                        value={field('promo_button_text')}
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'promo_button_text',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="promo_link">
                                        Button link
                                    </Label>
                                    <Input
                                        id="promo_link"
                                        value={field('promo_link')}
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'promo_link',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="/products"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base">
                                Mid Banner (Gift Voucher)
                            </CardTitle>
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={field('mid_banner_enabled') === true}
                                    onCheckedChange={(c) =>
                                        settingsForm.setData(
                                            'mid_banner_enabled',
                                            c as boolean,
                                        )
                                    }
                                />
                                <span className="text-sm font-medium">
                                    Show mid banner
                                </span>
                            </label>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Image</Label>
                                <div className="flex items-center gap-4">
                                    {field('mid_banner_image') ? (
                                        <div className="relative">
                                            <img
                                                src={field('mid_banner_image')}
                                                alt=""
                                                className="h-16 w-32 rounded border object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    settingsForm.setData(
                                                        'mid_banner_image',
                                                        '',
                                                    )
                                                }
                                                className="absolute -right-2 -top-2 rounded-full border bg-background p-0.5 shadow"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-16 w-32 items-center justify-center rounded border bg-muted text-muted-foreground">
                                            <Images className="h-6 w-6" />
                                        </div>
                                    )}
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => setMidBannerPickerOpen(true)}
                                    >
                                        <ImagePlus className="mr-2 h-4 w-4" />{' '}
                                        Choose Image
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Max 20MB. Recommended size: 1920x400px (24:5 wide).</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mid_banner_link">Banner Link</Label>
                                <Input
                                    id="mid_banner_link"
                                    value={field('mid_banner_link')}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'mid_banner_link',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. /products?category=gift"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Promo Tiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(settingsForm.data.promo_tiles || []).map(
                                (tile, idx) => (
                                    <div
                                        key={idx}
                                        className="space-y-4 border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            Tile {idx + 1}
                                            {tile.img ? (
                                                <img
                                                    src={tile.img}
                                                    alt=""
                                                    className="h-10 w-16 rounded border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-16 items-center justify-center rounded border bg-muted">
                                                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>
                                                    Eyebrow (Small text)
                                                </Label>
                                                <Input
                                                    value={tile.eyebrow}
                                                    onChange={(e) =>
                                                        updatePromoTile(
                                                            idx,
                                                            'eyebrow',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={tile.title}
                                                    onChange={(e) =>
                                                        updatePromoTile(
                                                            idx,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError message={settingsForm.errors[`promo_tiles.${idx}.title` as keyof LandingSettings]} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Link</Label>
                                                <Input
                                                    value={tile.link}
                                                    onChange={(e) =>
                                                        updatePromoTile(
                                                            idx,
                                                            'link',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>
                                                    Image URL (Upload or paste)
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={tile.img}
                                                        onChange={(e) =>
                                                            updatePromoTile(
                                                                idx,
                                                                'img',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="https://..."
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0"
                                                        onClick={() =>
                                                            setPromoPickerIndex(
                                                                idx,
                                                            )
                                                        }
                                                    >
                                                        <ImagePlus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                            <p className="text-xs text-muted-foreground">
                                To upload an image, go to Media Library, copy
                                the URL and paste it in the Image URL field.<br/>
                                Max 20MB per tile. Recommended size: 600x600px (1:1 square).
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <MediaPicker
                open={promoPickerIndex !== null}
                onOpenChange={(o) => !o && setPromoPickerIndex(null)}
                onSelect={(m) => {
                    if (promoPickerIndex !== null) {
                        updatePromoTile(promoPickerIndex, 'img', m.url);
                        setPromoPickerIndex(null);
                    }
                }}
            />
            <MediaPicker
                open={midBannerPickerOpen}
                onOpenChange={(o) => setMidBannerPickerOpen(o)}
                onSelect={(m) => {
                    settingsForm.setData('mid_banner_image', m.url);
                    setMidBannerPickerOpen(false);
                }}
            />
        </AdminLayout>
    );
}
