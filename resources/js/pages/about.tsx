import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

export default function About() {
    return (
        <CustomerLayout>
            <Head title="About Us" />
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-6">About Us</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Welcome to EShop. We are dedicated to providing you with the best electronics, gadgets, and accessories.
                    Our mission is to bring high-quality tech products directly to your door with exceptional customer service.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="font-bold text-xl mb-2">Quality First</h3>
                        <p className="text-muted-foreground text-sm">We ensure all our products meet strict quality standards.</p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
                        <p className="text-muted-foreground text-sm">Get your orders delivered to you as fast as possible.</p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="font-bold text-xl mb-2">24/7 Support</h3>
                        <p className="text-muted-foreground text-sm">Our team is always ready to assist you anytime.</p>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
