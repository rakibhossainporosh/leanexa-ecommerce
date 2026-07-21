import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

type Feature = { title: string; description: string };

export default function About({ intro = '', features = [] }: { intro?: string; features?: Feature[] }) {
    return (
        <CustomerLayout>
            <Head title="About Us" />
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-6">About Us</h1>
                {intro && (
                    <div
                        className="ck-content text-lg text-muted-foreground mb-8"
                        dangerouslySetInnerHTML={{ __html: intro }}
                    />
                )}
                {features.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        {features.map((f, i) => (
                            <div key={i} className="p-6 border rounded-xl bg-card">
                                <h3 className="font-bold text-xl mb-2">{f.title}</h3>
                                <p className="text-muted-foreground text-sm">{f.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
