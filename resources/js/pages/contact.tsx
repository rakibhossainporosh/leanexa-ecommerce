import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
    return (
        <CustomerLayout>
            <Head title="Contact Us" />
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                    <p className="text-lg text-muted-foreground">We'd love to hear from you. Please reach out with any questions or feedback.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-card p-8 border rounded-xl shadow-sm">
                        <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name</label>
                                <input type="text" className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary" placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input type="email" className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary" placeholder="john@example.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea className="w-full border rounded-md px-3 py-2 outline-none focus:border-shop-primary focus:ring-1 focus:ring-shop-primary min-h-[120px]" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="w-full bg-shop-primary text-white py-2.5 rounded-md font-semibold hover:bg-shop-primary-hover transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8 flex flex-col justify-center">
                        <div className="flex items-start gap-4">
                            <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Our Location</h4>
                                <p className="text-muted-foreground mt-1">123 E-commerce St.<br />Tech City, TC 10101</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Phone Number</h4>
                                <p className="text-muted-foreground mt-1">+880 1234 567890<br />Mon-Fri, 9am-6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-shop-primary/10 p-3 rounded-full text-shop-primary">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Email Address</h4>
                                <p className="text-muted-foreground mt-1">support@eshop.com<br />contact@eshop.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
