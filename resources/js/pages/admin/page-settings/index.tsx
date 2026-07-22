import React from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '@/components/rich-text-editor';

interface QA {
    question: string;
    answer: string;
}

interface Feature {
    title: string;
    description: string;
}

interface PageSettingsProps {
    pages: {
        contact_subtitle: string;
        contact_location: string;
        contact_phone: string;
        contact_email: string;
        about_intro: string;
        about_features: Feature[];
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
    customPages: CustomPageRow[];
}

interface CustomPageRow {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    is_active: boolean;
    show_in_footer: boolean;
    footer_section: string;
}

export default function PageSettingsIndex({ pages, customPages = [] }: PageSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        contact_subtitle: pages.contact_subtitle || '',
        contact_location: pages.contact_location || '',
        contact_phone: pages.contact_phone || '',
        contact_email: pages.contact_email || '',
        about_intro: pages.about_intro || '',
        about_features: pages.about_features || [],
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
            onSuccess: () => toast.success('Page settings saved.'),
            onError: () => toast.error('Please check the form for errors.'),
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

    const addFeature = () => setData('about_features', [...data.about_features, { title: '', description: '' }]);
    const removeFeature = (index: number) => {
        const next = [...data.about_features];
        next.splice(index, 1);
        setData('about_features', next);
    };
    const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
        const next = [...data.about_features];
        next[index][field] = value;
        setData('about_features', next);
    };


    const TABS = [
        { id: 'auth', label: 'Register & Login' },
        { id: 'about', label: 'About Us' },
        { id: 'contact', label: 'Contact Us' },
        { id: 'story', label: 'Our Story' },
        { id: 'policies', label: 'Policies' },
        { id: 'faq', label: 'FAQ' },
        { id: 'pages', label: 'Custom Pages' },
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
            </div>

            {/* Tab bar — the single Save button at the bottom submits every tab's fields. */}
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

                {activeTab === 'about' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Us — Intro</CardTitle>
                            <CardDescription>The introductory text shown at the top of the About Us page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <RichTextEditor value={data.about_intro} onChange={(html) => setData('about_intro', html)} />
                                {errors.about_intro && <p className="text-sm text-red-500">{errors.about_intro}</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Feature Boxes</CardTitle>
                                <CardDescription>The highlight cards below the intro (e.g. Quality First, Fast Delivery).</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addFeature} className="flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Add Box
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.about_features.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-start border p-4 rounded-md bg-muted/20">
                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input value={item.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} placeholder="e.g. Quality First" />
                                                {/* @ts-ignore */}
                                                {errors[`about_features.${index}.title`] && <p className="text-sm text-red-500">{errors[`about_features.${index}.title`]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea value={item.description} onChange={(e) => updateFeature(index, 'description', e.target.value)} placeholder="Short description..." rows={2} />
                                                {/* @ts-ignore */}
                                                {errors[`about_features.${index}.description`] && <p className="text-sm text-red-500">{errors[`about_features.${index}.description`]}</p>}
                                            </div>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeFeature(index)} className="shrink-0 mt-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {data.about_features.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No feature boxes. Click "Add Box" to add one.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'contact' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Us Page</CardTitle>
                        <CardDescription>The intro line and contact details shown on the Contact Us page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_subtitle">Subtitle</Label>
                            <Textarea id="contact_subtitle" rows={2} value={data.contact_subtitle} onChange={(e) => setData('contact_subtitle', e.target.value)} placeholder="We'd love to hear from you..." />
                            {errors.contact_subtitle && <p className="text-sm text-red-500">{errors.contact_subtitle}</p>}
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="contact_location">Our Location</Label>
                                <Textarea id="contact_location" rows={3} value={data.contact_location} onChange={(e) => setData('contact_location', e.target.value)} placeholder={'123 E-commerce St.\nTech City'} />
                                <p className="text-muted-foreground text-xs">One line per row.</p>
                                {errors.contact_location && <p className="text-sm text-red-500">{errors.contact_location}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Phone Number</Label>
                                <Textarea id="contact_phone" rows={3} value={data.contact_phone} onChange={(e) => setData('contact_phone', e.target.value)} placeholder={'+880 1234 567890\nMon-Fri, 9am-6pm'} />
                                {errors.contact_phone && <p className="text-sm text-red-500">{errors.contact_phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Email Address</Label>
                                <Textarea id="contact_email" rows={3} value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} placeholder={'support@eshop.com\ncontact@eshop.com'} />
                                {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                )}

                {activeTab === 'story' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Our Story</CardTitle>
                        <CardDescription>Content for the "Our Story" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <RichTextEditor value={data.our_story} onChange={(html) => setData('our_story', html)} />
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
                            <RichTextEditor value={data.returns_refunds} onChange={(html) => setData('returns_refunds', html)} />
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
                            <RichTextEditor value={data.privacy_policy} onChange={(html) => setData('privacy_policy', html)} />
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
                            <RichTextEditor value={data.terms_conditions} onChange={(html) => setData('terms_conditions', html)} />
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
                            <RichTextEditor value={data.shipping_policy} onChange={(html) => setData('shipping_policy', html)} />
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
                            <RichTextEditor value={data.return_policy} onChange={(html) => setData('return_policy', html)} />
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
                            <RichTextEditor value={data.warranty_policy} onChange={(html) => setData('warranty_policy', html)} />
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

                {activeTab !== 'pages' && (
                    <div className="flex justify-end">
                        <Button onClick={submit} disabled={processing} size="lg">Save All Changes</Button>
                    </div>
                )}
            </form>

            {activeTab === 'pages' && <CustomPagesManager pages={customPages} />}
        </AdminLayout>
    );
}

function CustomPagesManager({ pages }: { pages: CustomPageRow[] }) {
    const emptyForm = { title: '', slug: '', content: '', is_active: true, show_in_footer: true, footer_section: 'company' };
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<typeof emptyForm>({ ...emptyForm });
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [showForm, setShowForm] = React.useState(false);

    const startNew = () => {
        setEditingId(null);
        clearErrors();
        setData({ ...emptyForm });
        setShowForm(true);
    };

    const startEdit = (p: CustomPageRow) => {
        setEditingId(p.id);
        clearErrors();
        setData({
            title: p.title,
            slug: p.slug,
            content: p.content || '',
            is_active: p.is_active,
            show_in_footer: p.show_in_footer,
            footer_section: p.footer_section || 'company',
        });
        setShowForm(true);
    };

    const save = () => {
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
                toast.success(editingId ? 'Page updated.' : 'Page created.');
                setEditingId(null);
            },
        };
        if (editingId) {
            put(`/admin/custom-pages/${editingId}`, opts);
        } else {
            post('/admin/custom-pages', opts);
        }
    };

    const remove = (p: CustomPageRow) => {
        if (confirm(`Delete the page "${p.title}"? This cannot be undone.`)) {
            router.delete(`/admin/custom-pages/${p.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Page deleted.'),
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Custom Pages</CardTitle>
                    <CardDescription>Create extra pages (e.g. Careers, Wholesale) shown at /page/&#123;slug&#125; and optionally in the footer.</CardDescription>
                </div>
                {!showForm && (
                    <Button type="button" variant="outline" size="sm" onClick={startNew} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add Page
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold">{editingId ? 'Edit Page' : 'New Page'}</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Careers" />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (optional)</Label>
                                <Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="auto-generated from title" />
                                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <div className="rounded-md border">
                                <RichTextEditor value={data.content} onChange={(html) => setData('content', html)} />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4" />
                                Active (visible on storefront)
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={data.show_in_footer} onChange={(e) => setData('show_in_footer', e.target.checked)} className="h-4 w-4" />
                                Show link in footer
                            </label>
                            {data.show_in_footer && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Label className="text-sm">Footer section</Label>
                                    <select
                                        value={data.footer_section}
                                        onChange={(e) => setData('footer_section', e.target.value)}
                                        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                                    >
                                        <option value="company">Company</option>
                                        <option value="shop">Shop</option>
                                        <option value="information">Information</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
                            <Button type="button" onClick={save} disabled={processing}>{editingId ? 'Update Page' : 'Create Page'}</Button>
                        </div>
                    </div>
                )}

                <div className="divide-y rounded-lg border">
                    {pages.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 p-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">{p.title}</span>
                                    {!p.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Hidden</span>}
                                    {p.show_in_footer && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary capitalize">Footer: {p.footer_section || 'company'}</span>}
                                </div>
                                <Link href={`/page/${p.slug}`} target="_blank" className="text-xs text-muted-foreground hover:underline">/page/{p.slug}</Link>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => remove(p)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {pages.length === 0 && (
                        <p className="p-6 text-center text-sm text-muted-foreground">No custom pages yet. Click "Add Page" to create one.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
