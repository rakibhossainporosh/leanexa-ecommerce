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
        login_heading: string;
        login_subtitle: string;
        login_benefits: string[];
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
        login_heading: pages.login_heading || '',
        login_subtitle: pages.login_subtitle || '',
        login_benefits: pages.login_benefits || [],
        faq: pages.faq || [],
    });

    // Shared helpers for the register/login benefit lists.
    type BenefitField = 'register_benefits' | 'login_benefits';

    const addBenefit = (field: BenefitField) => {
        setData(field, [...data[field], '']);
    };

    const removeBenefit = (field: BenefitField, index: number) => {
        const next = [...data[field]];
        next.splice(index, 1);
        setData(field, next);
    };

    const updateBenefit = (field: BenefitField, index: number, value: string) => {
        const next = [...data[field]];
        next[index] = value;
        setData(field, next);
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

    const TABS = [
        { id: 'auth', label: 'Register & Login' },
        { id: 'story', label: 'Our Story' },
        { id: 'policies', label: 'Policies' },
        { id: 'faq', label: 'FAQ' },
    ] as const;
    const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]['id']>('auth');

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

            {/* Tab bar — one Save button (top) submits every tab's fields. */}
            <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === t.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="space-y-6">
                {activeTab === 'auth' && ([
                    { title: 'Register Page', desc: 'The heading, subtitle and benefit points shown on the account creation page.', hf: 'register_heading', sf: 'register_subtitle', bf: 'register_benefits' as BenefitField, hp: 'Create your account.', sp: 'Join thousands of shoppers...' },
                    { title: 'Login Page', desc: 'The heading, subtitle and benefit points shown on the sign-in page.', hf: 'login_heading', sf: 'login_subtitle', bf: 'login_benefits' as BenefitField, hp: 'Welcome back to your store.', sp: 'Track orders, manage your wishlist...' },
                ] as const).map((s) => (
                    <Card key={s.bf}>
                        <CardHeader>
                            <CardTitle>{s.title}</CardTitle>
                            <CardDescription>{s.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={s.hf}>Heading</Label>
                                <Input
                                    id={s.hf}
                                    value={data[s.hf]}
                                    onChange={(e) => setData(s.hf, e.target.value)}
                                    placeholder={s.hp}
                                />
                                {errors[s.hf as keyof typeof errors] && <p className="text-sm text-red-500">{errors[s.hf as keyof typeof errors]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={s.sf}>Subtitle</Label>
                                <Textarea
                                    id={s.sf}
                                    rows={2}
                                    value={data[s.sf]}
                                    onChange={(e) => setData(s.sf, e.target.value)}
                                    placeholder={s.sp}
                                />
                                {errors[s.sf as keyof typeof errors] && <p className="text-sm text-red-500">{errors[s.sf as keyof typeof errors]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Benefit points</Label>
                                {data[s.bf].map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={benefit}
                                            onChange={(e) => updateBenefit(s.bf, index, e.target.value)}
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeBenefit(s.bf, index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {errors[`${s.bf}.0` as keyof typeof errors] && <p className="text-sm text-red-500">Benefit text is required.</p>}
                                <Button type="button" variant="outline" size="sm" onClick={() => addBenefit(s.bf)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Benefit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {activeTab === 'story' && (
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
                )}

                {activeTab === 'policies' && (
                <div className="space-y-6">
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
                </div>
                )}

                {activeTab === 'faq' && (
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
                )}

                <div className="flex justify-end">
                    <Button onClick={submit} disabled={processing} size="lg">Save All Changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
