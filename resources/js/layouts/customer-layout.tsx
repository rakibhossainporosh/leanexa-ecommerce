import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    User,
    Heart,
    Menu,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    ChevronDown,
    Headphones,
    ShieldCheck,
    X,
    LogOut,
    Package,
    Home,
    LayoutGrid,
    Store,
    PackageOpen,
    ArrowUp,
    Youtube,
    ArrowLeft,
    Truck,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_LINKS = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/products' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT US', href: '/contact' },
];

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
);

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage();
    const { currencies, activeCurrency, general_settings, wishlistCount, cartCount = 0, auth, categories, footerPages = [] } = props as any;
    // The homepage hero already renders the category list right under this
    // button, so the hover dropdown is only needed on every other page.
    const pageUrl = usePage().url;

    const logoHeightDesktop = general_settings?.logo_height_desktop ? `${general_settings.logo_height_desktop}px` : '40px';
    const logoHeightMobile = general_settings?.logo_height_mobile ? `${general_settings.logo_height_mobile}px` : '32px';

    const showCategoryDropdown = !(pageUrl === '/' || pageUrl === '/products');
    // Reactive, globally-shared auth state (from HandleInertiaRequests::share).
    // Inertia refreshes this on every visit, so the navbar updates instantly
    // after login/logout with no page reload and no client-side token handling.
    const user = auth?.user ?? null;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const toggleCategory = (id: number) =>
        setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lock body scroll while the mobile drawer is open.
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const changeCurrency = (code: string) => {
        // preserveState keeps whatever the customer has already typed (e.g. the
        // checkout form) intact; the refreshed props still re-price the page.
        router.post('/currency', { currency: code }, { preserveScroll: true, preserveState: true });
    };

    const [searchQuery, setSearchQuery] = useState((props.filters as any)?.search ?? '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const debounceId = setTimeout(async () => {
            try {
                const res = await fetch(`/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(debounceId);
    }, [searchQuery]);

    const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowSuggestions(false);
        router.get('/products', { search: searchQuery }, { preserveState: false });
    };

    return (
        <div className="mesh-bg flex min-h-screen flex-col font-sans text-foreground antialiased pb-16 md:pb-0">
            {general_settings?.theme_color && (
                <style dangerouslySetInnerHTML={{ __html: `
                    :root {
                        --shop-primary: ${general_settings.theme_color};
                        --shop-primary-hover: color-mix(in srgb, ${general_settings.theme_color} 85%, black);
                    }
                `}} />
            )}
            {/* ---------- Utility top bar ---------- */}
            <div className="hidden border-b border-border/60 bg-white/60 text-xs text-muted-foreground backdrop-blur dark:bg-white/5 md:block">
                <div className="container mx-auto flex h-9 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-5">
                        {general_settings?.store_phone && (
                            <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-shop" /> {general_settings.store_phone}
                            </span>
                        )}
                        {(general_settings?.facebook_link || general_settings?.youtube_link || general_settings?.instagram_link) && (
                            <span className="flex items-center gap-3">
                                {general_settings?.facebook_link && (
                                    <a href={general_settings.facebook_link} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-shop">
                                        <Facebook className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {general_settings?.youtube_link && (
                                    <a href={general_settings.youtube_link} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground transition-colors hover:text-shop">
                                        <Youtube className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {general_settings?.instagram_link && (
                                    <a href={general_settings.instagram_link} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-shop">
                                        <Instagram className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">

                        {currencies && activeCurrency && (
                            <Select value={activeCurrency.code} onValueChange={changeCurrency}>
                                <SelectTrigger className="h-6 w-[86px] border-none bg-transparent px-1 text-xs shadow-none focus:ring-0">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((c: any) => (
                                        <SelectItem key={c.id} value={c.code}>
                                            {c.code} ({c.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Main header ---------- */}
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/90 backdrop-blur-xl dark:bg-black/80">
                <div className="container relative mx-auto flex h-16 items-center gap-4 px-4 lg:h-20 lg:gap-8 lg:px-8">
                    {/* Mobile menu toggle */}
                    <button
                        className="lg:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    {/* Back Button */}
                    {pageUrl !== '/' && (
                        <button
                            onClick={() => window.history.length > 2 ? window.history.back() : router.visit('/')}
                            className="group flex items-center gap-1.5 px-3 py-1.5 ml-1 lg:-ml-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-slate-300 active:scale-95"
                            title="Go Back"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    )}

                    {/* Logo */}
                    <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 group flex shrink-0 items-center gap-2 text-2xl font-bold tracking-tight">
                        {general_settings?.logo_url ? (
                            <>
                                <img src={general_settings.logo_url} alt={general_settings.store_name} className="w-auto object-contain transition-transform group-hover:scale-105 hidden lg:block" style={{ height: logoHeightDesktop }} />
                                <img src={general_settings.logo_url} alt={general_settings.store_name} className="w-auto object-contain transition-transform group-hover:scale-105 lg:hidden" style={{ height: logoHeightMobile }} />
                            </>
                        ) : (
                            <>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shop-primary shadow-lg shadow-shop-primary/25 transition-transform group-hover:scale-105">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                            </>
                        )}
                    </Link>

                    {/* Search bar */}
                    <div className="hidden flex-1 md:flex justify-center">
                        <div className="relative w-full max-w-2xl">
                            <form
                                onSubmit={submitSearch}
                                className="flex w-full items-center overflow-hidden rounded-full border border-border/80 bg-slate-50/50 shadow-sm transition-all focus-within:border-shop-primary/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-shop-primary/20 dark:bg-zinc-900/50"
                            >
                                <input
                                    name="search"
                                    type="text"
                                    placeholder="Search for products, brands and more..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="h-11 flex-1 bg-transparent px-5 text-sm outline-none placeholder:text-muted-foreground"
                                />
                                <button
                                    type="submit"
                                    className="mr-1.5 flex h-8 items-center gap-1.5 rounded-full bg-shop-primary px-4 text-xs font-semibold text-white transition-all hover:bg-shop-primary-hover active:scale-95"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">Search</span>
                                </button>
                            </form>
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
                                    <ul className="flex flex-col">
                                        {suggestions.map((product) => {
                                            const price = parseFloat(product.price);
                                            const discount = parseFloat(product.discount_price);
                                            const onSale = discount > 0 && discount < price;
                                            const finalPrice = onSale ? discount : price;

                                            return (
                                                <li key={product.id}>
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
                                                        onClick={() => setShowSuggestions(false)}
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-1 dark:bg-white/[0.03]">
                                                            {product.images?.length > 0 ? (
                                                                <img src={product.images[0].image_path} alt={product.name} className="h-full w-full object-contain" />
                                                            ) : (
                                                                <PackageOpen className="h-5 w-5 text-muted-foreground opacity-40" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-1 flex-col">
                                                            <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-shop">{formatPrice(finalPrice)}</span>
                                                                {onSale && (
                                                                    <span className="text-xs text-muted-foreground line-through">{formatPrice(price)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-3">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:text-shop sm:flex">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-shop-primary/10 text-sm font-semibold text-shop">
                                        {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                                    </span>
                                    <span className="hidden xl:flex xl:flex-col xl:leading-tight xl:text-left">
                                        <span className="max-w-[120px] truncate font-semibold">{user.name}</span>
                                    </span>
                                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground xl:block" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="flex flex-col">
                                        <span className="truncate">{user.name}</span>
                                        <span className="text-xs font-normal text-muted-foreground truncate">{user.email}</span>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" /> My Account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders" className="cursor-pointer">
                                            <Package className="mr-2 h-4 w-4" /> My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/track-order" className="cursor-pointer">
                                            <Truck className="mr-2 h-4 w-4" /> Track Order
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/wishlist" className="cursor-pointer">
                                            <Heart className="mr-2 h-4 w-4" /> Wishlist
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild variant="destructive">
                                        <Link href="/logout" method="post" as="button" className="w-full cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" /> Log out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link href="/track-order" className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:text-shop sm:flex">
                                    <Truck className="h-5 w-5" />
                                    <span className="hidden xl:flex xl:flex-col xl:leading-tight">
                                        <span className="font-semibold">Track Order</span>
                                    </span>
                                </Link>
                                <Link href="/login" className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:text-shop sm:flex">
                                    <User className="h-5 w-5" />
                                    <span className="hidden xl:flex xl:flex-col xl:leading-tight">
                                        <span className="font-semibold">Sign in</span>
                                    </span>
                                </Link>
                            </>
                        )}
                        <Link href="/wishlist" className="relative hidden p-2 text-muted-foreground hover:text-shop sm:block" aria-label="Wishlist">
                            <span className="relative">
                                <Heart className="h-6 w-6" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                        {wishlistCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                        <Link href="/cart" className="group relative flex items-center gap-2 rounded-md px-2 py-1.5 hover:text-shop">
                            <span className="relative">
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shop-primary px-1 text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                            <span className="hidden text-sm font-semibold xl:inline">Cart</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile search */}
                <form onSubmit={submitSearch} className="container mx-auto px-4 pb-3 md:hidden">
                    <div className="flex items-center overflow-hidden rounded-md border-2 border-shop-primary bg-background">
                        <input
                            name="search"
                            type="text"
                            placeholder="Search products..."
                            className="h-10 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <button type="submit" className="flex h-10 items-center bg-shop-primary px-4 text-white">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            {/* ---------- Department / main nav ---------- */}
            <div className="hidden border-b border-border/60 bg-white lg:block dark:bg-black">
                <div className="container mx-auto flex h-[52px] items-center justify-center px-4 lg:px-8">
                    <nav className="flex items-center gap-10 text-[13px] font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        {categories?.map((c: any) => (
                            <div key={c.id} className="group relative h-[52px] flex items-center">
                                <Link href={`/products?category=${c.slug}`} className="flex items-center gap-1.5 transition-colors hover:text-shop-primary">
                                    {c.name}
                                    {(c.children?.length ?? 0) > 0 && (
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:opacity-100 group-hover:rotate-180" />
                                    )}
                                </Link>
                                {(c.children?.length ?? 0) > 0 && (
                                    <div className="invisible absolute left-1/2 top-full z-40 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                                        <div className="pt-2">
                                            <ul className="flex min-w-[220px] flex-col overflow-hidden rounded-xl border border-border/50 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:bg-zinc-950/95">
                                                {c.children.map((ch: any) => (
                                                    <li key={ch.id}>
                                                        <Link
                                                            href={`/products?category=${ch.slug}`}
                                                            className="block rounded-md px-4 py-2.5 text-[13px] normal-case font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-shop-primary dark:text-slate-300 dark:hover:bg-zinc-800"
                                                        >
                                                            {ch.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>
        </header>

            {/* ---------- Mobile nav drawer ---------- */}
            <div className={`fixed inset-0 z-[60] lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Drawer panel */}
                <aside
                    className={`absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0d0d12] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-4">
                        <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                            {general_settings?.logo_url ? (
                                <img src={general_settings.logo_url} alt={general_settings.store_name} className="w-auto object-contain" style={{ height: logoHeightMobile }} />
                            ) : (
                                <>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shop-primary">
                                        <ShoppingCart className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-lg font-bold">{general_settings?.store_name || 'EShop'}</span>
                                </>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">


                        {/* Categories */}
                        {(categories?.length ?? 0) > 0 && (
                            <div className="border-t border-border/60 px-2 py-3">
                                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Categories
                                </p>
                                {categories.map((c: any) => {
                                    const hasChildren = (c.children?.length ?? 0) > 0;
                                    const isExpanded = expandedCategories.includes(c.id);

                                    return (
                                        <div key={c.id}>
                                            <div className="flex items-center rounded-lg transition-colors hover:bg-shop-primary/5">
                                                <Link
                                                    href={`/products?category=${c.slug}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex-1 px-3 py-2.5 text-sm text-foreground transition-colors hover:text-shop"
                                                >
                                                    {c.name}
                                                </Link>
                                                {hasChildren && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCategory(c.id)}
                                                        aria-expanded={isExpanded}
                                                        aria-label={`${isExpanded ? 'Hide' : 'Show'} ${c.name} subcategories`}
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:text-shop-primary"
                                                    >
                                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </div>

                                            {hasChildren && isExpanded && (
                                                <ul className="mb-1 ml-4 border-l border-border/60 pl-2">
                                                    {c.children.map((ch: any) => (
                                                        <li key={ch.id}>
                                                            <Link
                                                                href={`/products?category=${ch.slug}`}
                                                                onClick={() => setMobileOpen(false)}
                                                                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-shop-primary/5 hover:text-shop-primary"
                                                            >
                                                                {ch.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Account */}
                        <div className="border-t border-border/60 px-2 py-3">
                            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Account
                            </p>
                            {user ? (
                                <>
                                    <Link
                                        href="/account"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-shop-primary/5 hover:text-shop"
                                    >
                                        <User className="h-4 w-4" /> My Account
                                    </Link>
                                    <Link
                                        href="/orders"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-shop-primary/5 hover:text-shop"
                                    >
                                        <Package className="h-4 w-4" /> My Orders
                                    </Link>
                                    <Link
                                        href="/track-order"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-shop-primary/5 hover:text-shop"
                                    >
                                        <Truck className="h-4 w-4" /> Track Order
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-shop-primary/5 hover:text-shop"
                                    >
                                        <Heart className="h-4 w-4" /> Wishlist
                                        {wishlistCount > 0 && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-shop-primary/10 px-1.5 text-[11px] font-bold text-shop">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/track-order"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-shop-primary/5 hover:text-shop"
                                    >
                                        <Truck className="h-4 w-4" /> Track Order
                                    </Link>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="mx-3 mt-1 flex items-center justify-center gap-2 rounded-lg bg-shop-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shop-primary-hover"
                                    >
                                        <User className="h-4 w-4" /> Sign in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Drawer footer */}
                    {user ? (
                        <div className="border-t border-border p-3">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => setMobileOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="h-4 w-4" /> Log out
                            </Link>
                        </div>
                    ) : (
                        general_settings?.store_phone && (
                            <div className="border-t border-border p-4">
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5 text-shop" /> {general_settings.store_phone}
                                </p>
                            </div>
                        )
                    )}
                </aside>
            </div>

            <main className="w-full max-w-full flex-1 overflow-hidden">{children}</main>

            {/* ---------- Footer ---------- */}
            <footer className="mt-auto w-full border-t border-border bg-white dark:bg-[#0d0d12]">
                <div className="container mx-auto px-4 pt-8 pb-4 md:py-8">
                    <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-12">
                        {/* Logo and Short Description */}
                        <div className="space-y-4 col-span-2 md:col-span-3 lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                                {general_settings?.logo_url ? (
                                    <img src={general_settings.logo_url} alt={general_settings.store_name} className="w-auto object-contain" style={{ height: logoHeightDesktop }} />
                                ) : (
                                    <>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop-primary">
                                            <ShoppingCart className="h-4 w-4 text-white" />
                                        </div>
                                        <span>
                                            {general_settings?.store_name ? general_settings.store_name : (
                                                <>E<span className="text-shop">Shop</span></>
                                            )}
                                        </span>
                                    </>
                                )}
                            </Link>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {general_settings?.footer_description || 'Your one-stop shop for premium electronics, gadgets and accessories — delivered fast, right to your door.'}
                            </p>
                            {(general_settings?.facebook_link || general_settings?.instagram_link || general_settings?.youtube_link) && (
                                <div className="mt-5 flex gap-3 flex-wrap">
                                    {general_settings?.facebook_link && (
                                        <a href={general_settings.facebook_link} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-shop-primary hover:text-white">
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    )}
                                    {general_settings?.instagram_link && (
                                        <a href={general_settings.instagram_link} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-shop-primary hover:text-white">
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    )}
                                    {general_settings?.youtube_link && (
                                        <a href={general_settings.youtube_link} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-shop-primary hover:text-white">
                                            <Youtube className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Column 1: Company */}
                        <div className="col-span-1">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Company</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/about" className="hover:text-shop transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-shop transition-colors">Contact Us</Link></li>
                                <li><Link href="/our-story" className="hover:text-shop transition-colors">Our Story</Link></li>
                                <li><Link href="/returns-refunds" className="hover:text-shop transition-colors">Returns & Refunds</Link></li>
                                <li><Link href="/faq" className="hover:text-shop transition-colors">FAQ</Link></li>
                                {footerPages.filter((p: any) => (p.footer_section || 'company') === 'company').map((p: any) => (
                                    <li key={p.slug}><Link href={`/page/${p.slug}`} className="hover:text-shop transition-colors">{p.title}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2: Shop */}
                        <div className="col-span-1">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Shop</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/products" className="hover:text-shop transition-colors">All Products</Link></li>
                                <li><Link href="/products" className="hover:text-shop transition-colors">New Arrivals</Link></li>
                                <li><Link href="/products" className="hover:text-shop transition-colors">Best Sellers</Link></li>
                                <li><Link href="/products" className="hover:text-shop transition-colors">Hot Deals</Link></li>
                                <li><Link href="/brands" className="hover:text-shop transition-colors">Brands</Link></li>
                                {footerPages.filter((p: any) => p.footer_section === 'shop').map((p: any) => (
                                    <li key={p.slug}><Link href={`/page/${p.slug}`} className="hover:text-shop transition-colors">{p.title}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Information */}
                        <div className="col-span-1">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Information</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/privacy-policy" className="hover:text-shop transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms-conditions" className="hover:text-shop transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/shipping-policy" className="hover:text-shop transition-colors">Shipping Policy</Link></li>
                                <li><Link href="/return-policy" className="hover:text-shop transition-colors">Return Policy</Link></li>
                                <li><Link href="/warranty-policy" className="hover:text-shop transition-colors">Warranty Policy</Link></li>
                                {footerPages.filter((p: any) => p.footer_section === 'information').map((p: any) => (
                                    <li key={p.slug}><Link href={`/page/${p.slug}`} className="hover:text-shop transition-colors">{p.title}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact Us */}
                        <div className="col-span-1">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Contact Us</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground break-words">
                                {general_settings?.store_address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-shop shrink-0" /> <span>{general_settings.store_address}</span></li>}
                                {general_settings?.store_phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-shop shrink-0" /> {general_settings.store_phone}</li>}
                                {general_settings?.store_email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-shop shrink-0" /> <span className="truncate">{general_settings.store_email}</span></li>}
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="flex flex-col items-center gap-1 border-t border-border pt-4 mt-4 text-sm text-muted-foreground">
                        <div className="w-full flex justify-center px-4">
                            <a target="_blank" href="https://www.sslcommerz.com/" title="SSLCommerz">
                                <img className="w-full max-w-[1000px] h-auto object-contain" src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png" alt="SSLCommerz" />
                            </a>
                        </div>

                        <div className="w-full text-center">
                            <p>
                                {(general_settings?.footer_copyright || '© {year} {store}. All Rights Reserved.')
                                    .replace('{year}', String(new Date().getFullYear()))
                                    .replace('{store}', general_settings?.store_name || 'Elevate & Next')}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            {/* ---------- Mobile Bottom Navbar ---------- */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] flex h-14 items-center justify-around border-t border-border bg-white pb-safe dark:bg-black md:hidden">
                <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${usePage().url === '/' ? 'text-shop-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link href="/products" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${usePage().url.startsWith('/products') ? 'text-shop-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Store className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Shop</span>
                </Link>
                <Link href="/track-order" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${usePage().url.startsWith('/track-order') ? 'text-shop-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Truck className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Track Order</span>
                </Link>
                <Link href={user ? "/account" : "/login"} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${usePage().url.startsWith('/account') || usePage().url === '/login' ? 'text-shop-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <User className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{user ? 'Account' : 'Sign in'}</span>
                </Link>
            </div>

            {/* Back to Top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[90] flex h-10 w-10 items-center justify-center rounded-full bg-shop-primary text-white shadow-lg transition-all duration-300 ${
                    showBackToTop ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'
                }`}
                aria-label="Back to top"
            >
                <ArrowUp className="h-5 w-5" />
            </button>

            {/* WhatsApp Support */}
            {general_settings?.store_phone && (
                <a
                    href={`https://wa.me/${general_settings.store_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-[130px] md:bottom-20 right-4 md:right-8 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
                    aria-label="WhatsApp Support"
                >
                    <WhatsAppIcon className="h-7 w-7" />
                </a>
            )}
        </div>
    );
}
