import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

// Mirrors the Our Story page's layout and typography so admin-created pages
// read with the same font and styling.
export default function CustomPage({ title, content }: { title: string; content?: string }) {
    return (
        <CustomerLayout>
            <Head title={title} />
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-center">{title}</h1>
                <div
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: content || 'Content coming soon...' }}
                />
            </div>
        </CustomerLayout>
    );
}
