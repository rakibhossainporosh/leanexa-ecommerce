import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function InfoPage({ title, content }: { title: string; content?: string }) {
    return (
        <CustomerLayout>
            <Head title={title} />
            <div className="container mx-auto px-4 py-8 lg:px-8 max-w-4xl">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8 lg:p-12">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-8">{title}</h1>
                    <div
                        className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading"
                        dangerouslySetInnerHTML={{ __html: content || 'Content coming soon...' }}
                    />
                </div>
            </div>
        </CustomerLayout>
    );
}
