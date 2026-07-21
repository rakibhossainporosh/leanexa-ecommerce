import { Head, Link, usePage, router } from '@inertiajs/react';
import { toast } from "sonner";
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { PackageOpen, Heart, Eye, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { useState } from 'react';

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

function ProductCard({ product }: { product: Product }) {
    const { formatPrice } = useCurrency();
    // usePage() must run during render, not inside the click handler.
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
        <div className="product-card group relative">
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

                <div className="mt-2 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-14 group-hover:opacity-100">
                    <Button onClick={addToCart} className="w-full rounded-md bg-shop-primary text-white hover:bg-shop-primary-hover h-9 text-xs flex items-center justify-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ links }: { links: any[] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {links.map((link, k) => {
                if (link.url === null) {
                    return (
                        <div
                            key={k}
                            className="mr-1 mb-1 rounded border border-border px-4 py-3 text-sm leading-4 text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={k}
                        className={`mr-1 mb-1 rounded border px-4 py-3 text-sm leading-4 hover:bg-shop-primary hover:text-white ${
                            link.active ? 'bg-shop-primary text-white border-shop-primary' : 'border-border text-foreground bg-card'
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

export default function SectionPage({
    section,
    products,
}: {
    section: { id: number; title: string; subtitle: string | null };
    products: { data: Product[]; links: any[] };
}) {
    const { general_settings } = usePage().props as any;

    return (
        <CustomerLayout>
            <Head title={`${section.title} — ${general_settings?.store_name || 'EShop'}`} />

            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-shop">
                        <ChevronLeft className="h-4 w-4" /> Back to Home
                    </Link>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">{section.title}</h1>
                    {section.subtitle && <p className="mt-2 text-muted-foreground">{section.subtitle}</p>}
                </div>

                {products.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {products.data.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                        <Pagination links={products.links} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-shop-primary/10">
                            <PackageOpen className="h-10 w-10 text-shop" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-foreground">No products found</h3>
                        <p className="mx-auto text-muted-foreground">This section currently has no products.</p>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
