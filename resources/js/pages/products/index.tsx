import { Head, Link, usePage, router } from '@inertiajs/react';
import { useMemo, useState, Fragment } from 'react';
import { toast } from "sonner";
import { ShoppingCart, PackageOpen, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import CustomerLayout from '@/layouts/customer-layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BannerSlider from '@/components/banner-slider';
import {
    ArrowRight,
    Star,
    Eye,
    Heart,
    Smartphone,
    Laptop,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Tv,
    Speaker,
    Cpu,
    HardDrive,
    Truck,
    ShieldCheck,
    RefreshCw,
    CreditCard,
    ChevronDown,
    Package,
    Gift,
    Tag,
    MapPin,
    Clock,
    Phone,
} from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const icons: Record<string, any> = {
        Truck, CreditCard, RefreshCw, ShieldCheck, Package, Zap, Gift, Tag, Heart, Star, Phone, MapPin, Clock, Headphones
    };
    const Icon = icons[name] || Truck;
    return <Icon className={className} />;
};

import { useCurrency } from '@/hooks/use-currency';

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

type Product = {
    id: number;
    name: string;
    slug: string;
    price: number | string;
    discount_price?: number | string | null;
    stock?: number;
    images?: { image_path: string }[];
    category?: { id: number; name: string } | null;
    tags?: { id: number; name: string }[];
    variants?: { id: number; name: string; image_path?: string | null }[];
};

const num = (v: number | string | null | undefined): number =>
    typeof v === 'string' ? parseFloat(v) || 0 : v ?? 0;

const isOnSale = (p: Product) => num(p.discount_price) > 0 && num(p.discount_price) < num(p.price);

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

function ServiceCard({ service, className }: { service: { icon: string; title: string; desc: string }; className?: string }) {
    return (
        <div className={cn('flex items-center gap-3 border-r border-border/50 px-6', className)}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shop-primary/10 text-shop">
                <DynamicIcon name={service.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{service.title}</p>
                <p className="truncate text-xs text-muted-foreground">{service.desc}</p>
            </div>
        </div>
    );
}

function SectionHeading({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
    return (
        <div className="mb-6 flex items-end justify-between gap-4">
            <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {href && (
                <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-shop hover:gap-2 sm:flex">
                    View All <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Sidebar Category Item                                               */
/* ------------------------------------------------------------------ */

function SidebarCategoryItem({ category }: { category: any }) {
    const hasChildren = category.children && category.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    if (hasChildren) {
        return (
            <li className="flex flex-col border-b border-border/40 last:border-0">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-shop-primary/5 hover:text-shop-primary"
                >
                    {category.name}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground opacity-50 transition-all group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <ul className="flex flex-col bg-muted/20 pb-2 pt-1">
                        {category.children.map((child: any) => (
                            <li key={child.id}>
                                <Link
                                    href={`/products?category=${child.slug}`}
                                    className="block px-8 py-2 text-sm text-muted-foreground hover:text-shop-primary"
                                >
                                    {child.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // No sub-categories: plain link, no arrow.
    return (
        <li className="border-b border-border/40 last:border-0">
            <Link
                href={`/products?category=${category.slug}`}
                className="block px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-shop-primary/5 hover:text-shop-primary"
            >
                {category.name}
            </Link>
        </li>
    );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({ product }: { product: Product }) {
    const { formatPrice } = useCurrency();
    // Read wishlist state once during render — usePage() is a hook and must not
    // be called inside the click handler (it threw and aborted the request).
    const wishlistItems = (usePage().props.wishlistItems as number[]) ?? [];
    const isWishlisted = wishlistItems.includes(product.id);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const defaultImage = product.images && product.images.length > 0 ? product.images[0].image_path : null;
    const displayImage = activeImage || defaultImage;

    const price = num(product.price);
    const discount = num(product.discount_price);
    const onSale = isOnSale(product);
    const finalPrice = onSale ? discount : price;
    const off = onSale ? Math.round(((price - discount) / price) * 100) : 0;
    const outOfStock = product.stock !== undefined && product.stock <= 0;

    const sizeVariants = product.variants?.filter((v: any) => v.type === 'size' || v.name.toLowerCase().startsWith('size')) || [];
    const colorVariants = product.variants?.filter((v: any) => !sizeVariants.includes(v)) || [];
    const defaultColorId = colorVariants.length > 0 ? colorVariants[0].id : null;
    const defaultSizeId = sizeVariants.length > 0 ? sizeVariants[0].id : null;

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post('/cart/add', {
            product_id: product.id,
            color_variant_id: defaultColorId,
            size_variant_id: defaultSizeId,
            quantity: 1,
        }, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Added to cart')
        });
    };

    return (
        <div className="product-card group">
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                {onSale && <span className="rounded bg-[#e4322b] px-2 py-0.5 text-[11px] font-bold text-white">-{off}%</span>}
                {outOfStock && <span className="rounded bg-muted-foreground px-2 py-0.5 text-[11px] font-bold text-white">Sold out</span>}
            </div>

            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        const actionWord = isWishlisted ? 'Removed from' : 'Added to';
                        router.post(`/wishlist/${product.id}`, {}, {
                            preserveScroll: true,
                            onSuccess: () => toast.success(`${actionWord} wishlist`)
                        });
                    }}
                    aria-label="Wishlist"
                    className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-colors ${
                        isWishlisted
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                            : 'bg-background text-muted-foreground hover:bg-shop-primary hover:text-white'
                    }`}
                >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                {[
                    { icon: Eye, label: 'Quick view' },
                ].map(({ icon: Icon, label }) => (
                    <Link
                        key={label}
                        href={`/products/${product.slug}`}
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-md transition-colors hover:bg-shop-primary hover:text-white"
                    >
                        <Icon className="h-4 w-4" />
                    </Link>
                ))}
            </div>

            <Link
                href={`/products/${product.slug}`}
                className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-3 dark:bg-white/[0.03]"
            >
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <PackageOpen className="mb-2 h-12 w-12 opacity-40" />
                        <span className="text-sm">No Image</span>
                    </div>
                )}
            </Link>

            {product.variants && product.variants.some((v: any) => v.image_path) && (
                <div className="flex gap-2 px-4 pt-4 pb-0 overflow-x-auto no-scrollbar">
                    {product.variants.filter((v: any) => v.image_path).slice(0, 4).map((variant: any) => (
                        <button
                            key={variant.id}
                            onMouseEnter={() => setActiveImage(variant.image_path || null)}
                            onMouseLeave={() => setActiveImage(null)}
                            className={`w-8 h-8 shrink-0 rounded border overflow-hidden transition-colors ${
                                activeImage === variant.image_path ? 'border-shop-primary' : 'border-border hover:border-shop-primary/50'
                            }`}
                            title={variant.name}
                        >
                            <img src={variant.image_path} className="object-cover w-full h-full" alt={variant.name} />
                        </button>
                    ))}
                    {product.variants.filter((v: any) => v.image_path).length > 4 && (
                        <span className="text-[10px] text-muted-foreground flex items-center ml-1">
                            +{product.variants.filter((v: any) => v.image_path).length - 4}
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
                {product.category && (
                    <span className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{product.category.name}</span>
                )}
                {product.tags && product.tags.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                        {product.tags.map((tag: any) => (
                            <span key={tag.id} className="rounded-sm border border-shop-primary/20 bg-shop-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-shop-primary">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
                <Link
                    href={`/products/${product.slug}`}
                    className="mb-1 line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-shop"
                    title={product.name}
                >
                    {product.name}
                </Link>


                <div className="mt-auto flex items-baseline gap-2">
                    <span className="text-lg font-bold text-shop">{formatPrice(finalPrice)}</span>
                    {onSale && <span className="text-sm text-muted-foreground line-through">{formatPrice(price)}</span>}
                </div>

                <div className="mt-2">
                    <Button onClick={addToCart} className="w-full rounded-md bg-shop-primary text-white hover:bg-shop-primary-hover h-9 text-xs flex items-center justify-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Product row (list display style)                                    */
/* ------------------------------------------------------------------ */

function ProductRow({ product }: { product: Product }) {
    const { formatPrice } = useCurrency();
    const price = num(product.price);
    const discount = num(product.discount_price);
    const onSale = isOnSale(product);
    const finalPrice = onSale ? discount : price;

    return (
        <Link href={`/products/${product.slug}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1 dark:bg-white/[0.03]">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].image_path} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                    <PackageOpen className="h-6 w-6 text-muted-foreground opacity-40" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                {product.category && <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.category.name}</span>}
                <p className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</p>
            </div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-base font-bold text-shop">{formatPrice(finalPrice)}</span>
                {onSale && <span className="text-xs text-muted-foreground line-through">{formatPrice(price)}</span>}
            </div>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/* Dynamic, admin-controlled homepage section                          */
/* ------------------------------------------------------------------ */

type LayoutSection = {
    id: number;
    title: string;
    subtitle?: string | null;
    display_style: 'grid' | 'carousel' | 'list';
    view_all_link?: string | null;
    products: Product[];
};

function DynamicSection({ section }: { section: LayoutSection }) {
    const { title, subtitle, display_style, view_all_link, products } = section;

    if (!products || products.length === 0) {
        return (
            <section className="container mx-auto px-4 py-4 lg:py-6 lg:px-8">
                <SectionHeading title={title} subtitle={subtitle ?? undefined} href={view_all_link ?? undefined} />
                <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                    No products in this section yet.
                </p>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-4 lg:py-6 lg:px-8">
            <SectionHeading title={title} subtitle={subtitle ?? undefined} href={view_all_link ?? undefined} />

            {display_style === 'carousel' ? (
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
                    {products.map((p) => (
                        <div key={p.id} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            ) : display_style === 'list' ? (
                <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {products.map((p) => (
                        <ProductRow key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-shop-primary/10">
                <PackageOpen className="h-10 w-10 text-shop" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">No products found</h3>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                We couldn't find any products right now. Please check back later or browse other categories.
            </p>
            <Button asChild className="btn-shop h-11">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    );
}



/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type BannerRecord = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    button_text: string | null;
    link: string | null;
};

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
    brands_enabled: boolean;
    brands_title: string;
    services: { icon: string; title: string; desc: string }[];
    promo_tiles: { eyebrow: string; title: string; img: string; link: string }[];
};

type BrandRecord = {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
};

export default function ProductIndex({
    products,
    homeSections = [],
    banners,
    brands,
    landing,
    filters,
}: {
    products: { data: Product[]; links?: unknown };
    homeSections?: LayoutSection[];
    banners?: BannerRecord[];
    brands?: BrandRecord[];
    landing: LandingSettings;
    filters?: { search?: string; category?: string; categoryName?: string | null };
}) {
    const { general_settings, categories } = usePage().props as any;
    const isSearching = !!filters?.search;
    const isCategoryView = !isSearching && !!filters?.category;
    const isFiltered = isSearching || isCategoryView;
    const resultsTitle = isSearching
        ? `Search Results for "${filters?.search}"`
        : filters?.categoryName || 'Products';

    return (
        <CustomerLayout>
            <Head title={`${general_settings?.store_name || 'EShop'} — ${isFiltered ? resultsTitle : 'Electronics & Gadgets'}`} />

            {isFiltered ? (
                <section className="container mx-auto px-4 py-3 lg:py-6 lg:px-8">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{resultsTitle}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <SectionHeading title={resultsTitle} />
                    {products.data.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {products.data.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
                            {isSearching ? 'No products found matching your search.' : 'No products found in this category yet.'}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* Hero: slider */}
                    {landing.hero_enabled && (
                        <section className="container mx-auto px-4 lg:px-8 mt-0 mb-2 lg:mb-4">
                            <div className="w-full">
                                <BannerSlider banners={banners} />
                            </div>
                        </section>
                    )}

                    {/* Service strip */}
                    {landing.services && landing.services.length > 0 && (
                        <section className="container mx-auto px-4 pb-3 lg:pb-6 lg:px-8">
                            <div className="overflow-hidden rounded-xl border border-border bg-card">
                                {/* Mobile: auto-scrolling marquee */}
                                <div className="flex w-max animate-marquee py-4 md:hidden">
                                    {[...landing.services, ...landing.services, ...landing.services, ...landing.services].map((s, i) => (
                                        <ServiceCard key={i} service={s} className="w-[250px] shrink-0" />
                                    ))}
                                </div>
                                {/* Desktop: static row, no animation */}
                                <div className="hidden py-4 md:flex">
                                    {landing.services.map((s, i) => (
                                        <ServiceCard key={i} service={s} className="min-w-0 flex-1 last:border-r-0" />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Promo tiles */}
                    {landing.promo_tiles && landing.promo_tiles.length > 0 && (
                        <section className="container mx-auto hidden grid-cols-1 gap-5 px-4 sm:grid sm:grid-cols-3 lg:px-8">
                            {landing.promo_tiles.map((t, i) => (
                                <div key={i} className="group relative h-44 overflow-hidden rounded-xl bg-muted/30 border border-border">
                                    <div className="absolute inset-y-0 right-0 w-1/2 p-4">
                                        <img
                                            src={t.img}
                                            alt={t.title}
                                            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="relative z-10 flex h-full w-2/3 flex-col justify-center gap-1 p-6">
                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{t.eyebrow}</span>
                                        <h3 className="font-heading text-xl font-bold leading-tight text-foreground">{t.title}</h3>
                                        <Link
                                            href={t.link || "/products"}
                                            className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-semibold text-shop-primary underline-offset-4 hover:underline"
                                        >
                                            Shop Now <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Dynamic, admin-controlled homepage sections */}
                    {homeSections.length > 0 ? (
                        homeSections.map((section, index) => (
                            <Fragment key={section.id}>
                                <DynamicSection section={section} />
                                {index === 1 && landing.mid_banner_enabled && landing.mid_banner_image && (
                                    <section className="container mx-auto px-4 pb-6 lg:pb-6 lg:px-8">
                                        <Link href={landing.mid_banner_link || '#'}>
                                            <img
                                                src={landing.mid_banner_image}
                                                alt="Mid Banner"
                                                className="w-full h-auto md:h-[250px] lg:h-[300px] object-contain md:object-cover rounded-xl shadow-sm border border-border"
                                            />
                                        </Link>
                                    </section>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="container mx-auto px-4 py-4 lg:py-6 lg:px-8">
                            <SectionHeading title={landing.featured_title} subtitle={landing.featured_subtitle} href="/products" />
                            <EmptyState />
                        </section>
                    )}

                    {/* Promo band (customizable) */}
                    {landing.promo_enabled && (
                        <section className="container mx-auto px-4 pb-6 lg:pb-6 lg:px-8">
                            <div className="relative overflow-hidden rounded-2xl bg-[#0d1220] p-6 sm:p-10 md:p-14">
                                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-shop-primary/30 blur-3xl" />
                                <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-shop-primary/20 blur-3xl" />
                                <div className="relative flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
                                    <div className="max-w-xl">
                                        {landing.promo_eyebrow && (
                                            <span className="text-[11px] font-semibold uppercase tracking-widest text-shop-primary md:text-xs">{landing.promo_eyebrow}</span>
                                        )}
                                        <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl md:mt-2 md:text-4xl">{landing.promo_title}</h2>
                                        {landing.promo_subtitle && <p className="mt-2 text-sm text-slate-300 md:mt-3 md:text-base">{landing.promo_subtitle}</p>}
                                    </div>
                                    {landing.promo_button_text && (
                                        <Button asChild className="btn-shop h-12 shrink-0 px-8 text-base">
                                            <Link href={landing.promo_link || '/products'}>
                                                {landing.promo_button_text} <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Brands strip */}
                    {landing.brands_enabled && (brands?.length ?? 0) > 0 && (
                        <section className="container mx-auto px-4 pb-8 lg:pb-8 lg:px-8">
                            <SectionHeading title={landing.brands_title} />
                            <div className="overflow-hidden">
                                <div className="flex w-max animate-marquee">
                                    {[...brands!, ...brands!, ...brands!, ...brands!].map((b, i) => (
                                        <Link
                                            key={`${b.id}-${i}`}
                                            href="/products"
                                            className="mr-4 flex h-20 w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card text-lg font-bold text-muted-foreground grayscale transition-all hover:border-shop-primary hover:text-shop-primary hover:grayscale-0"
                                        >
                                            {b.logo_url ? (
                                                <img src={b.logo_url} alt={b.name} className="h-full w-full object-contain p-2" />
                                            ) : (
                                                b.name
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </CustomerLayout>
    );
}
