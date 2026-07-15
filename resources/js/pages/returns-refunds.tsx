import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

export default function ReturnsRefunds({ page_data }: { page_data: string }) {
    return (
        <CustomerLayout>
            <Head title="Returns & Refunds" />
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-center">Returns & Refunds</h1>
                <div 
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground space-y-6"
                    dangerouslySetInnerHTML={{ __html: page_data }}
                />
            </div>
        </CustomerLayout>
    );
}
