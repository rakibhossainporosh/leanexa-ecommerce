import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

export default function OurStory({ page_data }: { page_data: string }) {
    return (
        <CustomerLayout>
            <Head title="Our Story" />
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-center">Our Story</h1>
                <div 
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: page_data }}
                />
            </div>
        </CustomerLayout>
    );
}
