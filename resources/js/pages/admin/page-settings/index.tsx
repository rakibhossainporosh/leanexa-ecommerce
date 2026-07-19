import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import JoditEditor from 'jodit-react';

interface QA {
    question: string;
    answer: string;
}

interface PageSettingsProps {
    pages: {
        our_story: string;
        returns_refunds: string;
        privacy_policy: string;
        terms_conditions: string;
        shipping_policy: string;
        return_policy: string;
        warranty_policy: string;
        register_heading: string;
        register_subtitle: string;
        register_benefits: string[];
        faq: QA[];
    };
}

export default function PageSettingsIndex({ pages }: PageSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        our_story: pages.our_story || '',
        returns_refunds: pages.returns_refunds || '',
        privacy_policy: pages.privacy_policy || '',
        terms_conditions: pages.terms_conditions || '',
        shipping_policy: pages.shipping_policy || '',
        return_policy: pages.return_policy || '',
        warranty_policy: pages.warranty_policy || '',
        register_heading: pages.register_heading || '',
        register_subtitle: pages.register_subtitle || '',
        register_benefits: pages.register_benefits || [],
        faq: pages.faq || [],
    });

    const addBenefit = () => {
        setData('register_benefits', [...data.register_benefits, '']);
    };

    const removeBenefit = (index: number) => {
        const next = [...data.register_benefits];
        next.splice(index, 1);
        setData('register_benefits', next);
    };

    const updateBenefit = (index: number, value: string) => {
        const next = [...data.register_benefits];
        next[index] = value;
        setData('register_benefits', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/page-settings', {
            preserveScroll: true,
        });
    };

    const addFaq = () => {
        setData('faq', [...data.faq, { question: '', answer: '' }]);
    };

    const removeFaq = (index: number) => {
        const newFaq = [...data.faq];
        newFaq.splice(index, 1);
        setData('faq', newFaq);
    };

    const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaq = [...data.faq];
        newFaq[index][field] = value;
        setData('faq', newFaq);
    };

    const config = {
        readonly: false,
        height: 400,
        placeholder: 'Start typings...'
    };

    return (
        <AdminLayout>
            <Head title="Page Settings" />

            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Page Settings</h2>
                    <p className="text-muted-foreground">
                        Manage the content of your static pages.
                    </p>
                </div>
                <Button onClick={submit} disabled={processing}>Save Changes</Button>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Register Page</CardTitle>
                        <CardDescription>The heading, subtitle and benefit points shown on the account creation page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="register_heading">Heading</Label>
                            <Input
                                id="register_heading"
                                value={data.register_heading}
                                onChange={(e) => setData('register_heading', e.target.value)}
                                placeholder="Create your account."
                            />
                            {errors.register_heading && <p className="text-sm text-red-500">{errors.register_heading}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register_subtitle">Subtitle</Label>
                            <Textarea
                                id="register_subtitle"
                                rows={2}
                                value={data.register_subtitle}
                                onChange={(e) => setData('register_subtitle', e.target.value)}
                                placeholder="Join thousands of shoppers..."
                            />
                            {errors.register_subtitle && <p className="text-sm text-red-500">{errors.register_subtitle}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Benefit points</Label>
                            {data.register_benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={benefit}
                                        onChange={(e) => updateBenefit(index, e.target.value)}
                                        placeholder={`Benefit ${index + 1}`}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeBenefit(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {errors['register_benefits.0' as keyof typeof errors] && <p className="text-sm text-red-500">Benefit text is required.</p>}
                            <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                                <Plus className="mr-2 h-4 w-4" /> Add Benefit
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Our Story</CardTitle>
                        <CardDescription>Content for the "Our Story" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.our_story}
                                config={config}
                                onBlur={(newContent) => setData('our_story', newContent)}
                            />
                            {errors.our_story && <p className="text-sm text-red-500">{errors.our_story}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Returns & Refunds</CardTitle>
                        <CardDescription>Content for the "Returns & Refunds" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.returns_refunds}
                                config={config}
                                onBlur={(newContent) => setData('returns_refunds', newContent)}
                            />
                            {errors.returns_refunds && <p className="text-sm text-red-500">{errors.returns_refunds}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy Policy</CardTitle>
                        <CardDescription>Content for the "Privacy Policy" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.privacy_policy}
                                config={config}
                                onBlur={(newContent) => setData('privacy_policy', newContent)}
                            />
                            {errors.privacy_policy && <p className="text-sm text-red-500">{errors.privacy_policy}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Terms & Conditions</CardTitle>
                        <CardDescription>Content for the "Terms & Conditions" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.terms_conditions}
                                config={config}
                                onBlur={(newContent) => setData('terms_conditions', newContent)}
                            />
                            {errors.terms_conditions && <p className="text-sm text-red-500">{errors.terms_conditions}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Policy</CardTitle>
                        <CardDescription>Content for the "Shipping Policy" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.shipping_policy}
                                config={config}
                                onBlur={(newContent) => setData('shipping_policy', newContent)}
                            />
                            {errors.shipping_policy && <p className="text-sm text-red-500">{errors.shipping_policy}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Return Policy</CardTitle>
                        <CardDescription>Content for the "Return Policy" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.return_policy}
                                config={config}
                                onBlur={(newContent) => setData('return_policy', newContent)}
                            />
                            {errors.return_policy && <p className="text-sm text-red-500">{errors.return_policy}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Warranty Policy</CardTitle>
                        <CardDescription>Content for the "Warranty Policy" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <JoditEditor
                                value={data.warranty_policy}
                                config={config}
                                onBlur={(newContent) => setData('warranty_policy', newContent)}
                            />
                            {errors.warranty_policy && <p className="text-sm text-red-500">{errors.warranty_policy}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>FAQ (Frequently Asked Questions)</CardTitle>
                            <CardDescription>Manage your Q&A boxes here.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addFaq} className="flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Add FAQ
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.faq.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start border p-4 rounded-md bg-muted/20">
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Question</Label>
                                            <Input 
                                                value={item.question} 
                                                onChange={(e) => updateFaq(index, 'question', e.target.value)} 
                                                placeholder="e.g. How long does shipping take?"
                                            />
                                            {/* @ts-ignore */}
                                            {errors[`faq.${index}.question`] && <p className="text-sm text-red-500">{errors[`faq.${index}.question`]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Answer</Label>
                                            <Textarea 
                                                value={item.answer} 
                                                onChange={(e) => updateFaq(index, 'answer', e.target.value)} 
                                                placeholder="Enter the answer..."
                                                rows={3}
                                            />
                                            {/* @ts-ignore */}
                                            {errors[`faq.${index}.answer`] && <p className="text-sm text-red-500">{errors[`faq.${index}.answer`]}</p>}
                                        </div>
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeFaq(index)} className="shrink-0 mt-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {data.faq.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No FAQs added yet. Click "Add FAQ" to start.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={submit} disabled={processing} size="lg">Save All Changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
