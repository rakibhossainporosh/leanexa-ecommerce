import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Tags,
    List,
    ShoppingBag,
    Coins,
    LogOut,
    Bell,
    Menu,
    Users,
    FileText,
    Ticket,
    TrendingUp,
    Award,
    Image as ImageIcon,
    Palette,
    Package,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    UserCog,
    CreditCard,
    type LucideIcon,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type NavItem = { name: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { name: 'Sales Report', href: '/admin/sales-report', icon: TrendingUp },
        ],
    },
    {
        label: 'Catalog',
        items: [
            { name: 'Products', href: '/admin/products', icon: ShoppingBag },
            { name: 'Categories', href: '/admin/categories', icon: List },
            { name: 'Brands', href: '/admin/brands', icon: Award },
            { name: 'Tags', href: '/admin/tags', icon: Tags },
            { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
        ],
    },
    {
        label: 'Sales & Orders',
        items: [
            { name: 'Orders', href: '/admin/orders', icon: Package },
            { name: 'Invoices', href: '/admin/invoices', icon: FileText },
        ],
    },
    {
        label: 'Customers & Marketing',
        items: [
            { name: 'Customers', href: '/admin/customers', icon: Users },
            { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
            { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingBag },
        ],
    },
    {
        label: 'Storefront',
        items: [
            { name: 'Home Layout', href: '/admin/home-sections', icon: LayoutGrid },
            { name: 'Landing Page', href: '/admin/landing', icon: Palette },
            { name: 'Page Settings', href: '/admin/page-settings', icon: FileText },
        ],
    },
    {
        label: 'Settings & Users',
        items: [
            { name: 'Shop Settings', href: '/admin/general-settings', icon: Settings },
            { name: 'Payment Settings', href: '/admin/payment-settings', icon: CreditCard },
            { name: 'Currencies', href: '/admin/currencies', icon: Coins },
            { name: 'Admin Users', href: '/admin/users', icon: UserCog },
        ],
    },
];

const COLLAPSE_KEY = 'admin_sidebar_collapsed';

type AdminNotification = {
    id: string;
    data: {
        order_id: number;
        order_number: string;
        customer_name: string | null;
        total_amount: string | number;
    };
    read_at: string | null;
    created_at: string;
};

function NotificationBell({ notifications }: { notifications: { unread: number; items: AdminNotification[] } | null }) {
    const unread = notifications?.unread ?? 0;
    const items = notifications?.items ?? [];

    // Keep the badge fresh: re-fetch only the notification prop periodically.
    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['adminNotifications'] });
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const handleOpenChange = (open: boolean) => {
        if (open && unread > 0) {
            router.post('/admin/notifications/mark-read', {}, { preserveScroll: true, preserveState: true, only: ['adminNotifications'] });
        }
    };

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <span className="bg-destructive absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ring-2 ring-background">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-6 text-center text-sm">No notifications yet</p>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {items.map((n) => (
                            <DropdownMenuItem key={n.id} asChild>
                                <Link href={`/admin/orders/${n.data.order_id}`} className="flex w-full items-start gap-3 px-3 py-2">
                                    <div
                                        className={cn(
                                            'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                            n.read_at ? 'bg-muted text-muted-foreground' : 'bg-shop-primary/10 text-shop-primary',
                                        )}
                                    >
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={cn('truncate text-sm', !n.read_at && 'font-semibold')}>
                                            New order {n.data.order_number}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {n.data.customer_name ?? 'Customer'} — ৳{Number(n.data.total_amount).toLocaleString()}
                                        </p>
                                        <p className="text-muted-foreground/70 text-xs">{n.created_at}</p>
                                    </div>
                                    {!n.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-shop-primary" />}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
    const page = usePage();
    const { auth, general_settings: settings, adminNotifications } = page.props as any;
    const storeName = settings?.store_name || 'EShop';
    const logoUrl = settings?.logo_url || '';
    const pathname = (page.url || '').split('?')[0];

    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
    const [collapsed, setCollapsed] = useState(false); // desktop icon-only

    // Persist the desktop collapse preference.
    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(COLLAPSE_KEY) : null;
        if (saved === '1') setCollapsed(true);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((c) => {
            const next = !c;
            localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
            return next;
        });
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const NavLink = ({ item }: { item: NavItem }) => {
        const active = isActive(item.href);
        const link = (
            <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0',
                    active
                        ? 'bg-shop-primary/10 text-shop-primary dark:text-shop-primary'
                        : 'text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground',
                )}
            >
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-shop-primary" />}
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-shop-primary dark:text-shop-primary')} />
                <span className={cn(collapsed && 'lg:hidden')}>{item.name}</span>
            </Link>
        );

        // Show a tooltip with the label when the rail is collapsed.
        return collapsed ? (
            <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
        ) : (
            link
        );
    };

    return (
        <div className="mesh-bg flex min-h-screen text-foreground">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside
                className={cn(
                    'bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    collapsed ? 'w-64 lg:w-[74px]' : 'w-64',
                )}
            >
                <div className={cn('flex h-16 items-center gap-2 border-b px-4', collapsed && 'lg:justify-center lg:px-0')}>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className={cn('h-10 shrink-0 object-contain', collapsed ? 'max-w-[40px]' : 'max-w-[200px]')} />
                        ) : (
                            <>
                                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-primary font-bold text-white shadow-sm shadow-shop-primary/30', !collapsed && 'lg:hidden')}>
                                    {storeName.charAt(0).toUpperCase()}
                                </div>
                                <span className={cn('text-xl font-bold tracking-tight whitespace-nowrap', collapsed && 'lg:hidden')}>{storeName}</span>
                            </>
                        )}
                    </Link>
                </div>

                <nav className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-3 py-4">
                    {navGroups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <p className={cn('px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60', collapsed && 'lg:hidden')}>
                                {group.label}
                            </p>
                            {group.items.map((item) => (
                                <NavLink key={item.name} item={item} />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="border-t p-3">
                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive',
                            collapsed && 'lg:justify-center lg:px-0',
                        )}
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0" />
                        <span className={cn(collapsed && 'lg:hidden')}>Log out</span>
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Desktop collapse toggle */}
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleCollapsed} aria-label="Toggle sidebar">
                        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </Button>

                    {title && <h1 className="truncate text-sm font-semibold text-muted-foreground">{title}</h1>}

                    <div className="ml-auto flex items-center gap-1">
                        <NotificationBell notifications={adminNotifications} />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 gap-2 px-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-shop-primary/10 text-shop-primary dark:text-shop-primary">
                                            {auth.user?.name?.charAt(0) ?? 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium sm:inline">{auth.user?.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="flex flex-col">
                                    <span>{auth.user?.name}</span>
                                    <span className="text-muted-foreground text-xs font-normal">{auth.user?.email}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/general-settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild variant="destructive">
                                    <Link href="/admin/logout" method="post" as="button" className="w-full">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {title && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
