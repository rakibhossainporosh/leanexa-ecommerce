import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

type ContactInfo = { subtitle?: string; location?: string; phone?: string; email?: string };

export default function Contact({ contact }: { contact?: ContactInfo }) {
    const info = contact ?? {};
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', message: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact/message', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Message sent successfully!');
            },
        });
    };

    return (
        <CustomerLayout>
            <Head title="Contact Us" />
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                    {info.subtitle && <p className="text-lg text-muted-foreground">{info.subtitle}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-card p-8 border rounded-xl shadow-sm">
                        <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                        <form className="space-y-4" onSubmit={submit}>
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary" placeholder="Enter your full name" required />
                                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary" placeholder="Enter your email address" required />
                                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary min-h-[120px]" placeholder="How can we help you?" required></textarea>
                                {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
                            </div>
                            <button type="submit" disabled={processing} className="w-full bg-shop-primary text-white py-2.5 rounded-md font-semibold hover:bg-shop-primary-hover transition-colors disabled:opacity-60">
                                {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info — each block only shows when the admin has set it */}
                    <div className="space-y-8 flex flex-col justify-center">
                        {info.location && (
                            <div className="flex items-start gap-4">
                                <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Our Location</h4>
                                    <p className="text-muted-foreground mt-1 whitespace-pre-line">{info.location}</p>
                                </div>
                            </div>
                        )}

                        {info.phone && (
                            <div className="flex items-start gap-4">
                                <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Phone Number</h4>
                                    <p className="text-muted-foreground mt-1 whitespace-pre-line">{info.phone}</p>
                                </div>
                            </div>
                        )}

                        {info.email && (
                            <div className="flex items-start gap-4">
                                <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Email Address</h4>
                                    <p className="text-muted-foreground mt-1 whitespace-pre-line">{info.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
