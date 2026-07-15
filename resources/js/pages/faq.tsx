import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

export default function FAQ({ page_data }: { page_data: { question: string, answer: string }[] }) {
    return (
        <CustomerLayout>
            <Head title="FAQ" />
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                <div className="space-y-6">
                    {page_data && page_data.length > 0 ? (
                        page_data.map((faq, index) => (
                            <div key={index} className="bg-card border border-border p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">No FAQs available yet.</p>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
