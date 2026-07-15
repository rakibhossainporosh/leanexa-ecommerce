import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url?: string | null;
    description?: string | null;
}

export default function BrandsIndex({ brands }: { brands: Brand[] }) {
    const { general_settings } = usePage().props as any;

    return (
        <CustomerLayout>
            <Head title={`${general_settings?.store_name || 'EShop'} — Brands`} />
            <section className="container mx-auto px-4 py-3 lg:py-6 lg:px-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Brands</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">Our Brands</h1>
                    <p className="mt-2 text-muted-foreground">Explore products from our trusted partner brands.</p>
                </div>

                {brands.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/products?search=${brand.name}`}
                                className="group flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-shop-primary hover:shadow-md"
                            >
                                <div className="mb-4 flex h-24 w-full items-center justify-center">
                                    {brand.logo_url ? (
                                        <img
                                            src={brand.logo_url}
                                            alt={brand.name}
                                            className="h-full w-full object-contain grayscale transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-shop-primary/10 text-xl font-bold text-shop-primary">
                                            {brand.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-foreground group-hover:text-shop-primary">{brand.name}</h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">No brands found.</div>
                )}
            </section>
        </CustomerLayout>
    );
}
