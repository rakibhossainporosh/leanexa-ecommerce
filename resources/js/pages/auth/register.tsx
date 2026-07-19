import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Check, X, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasswordStrength from '@/components/auth/password-strength';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import CustomerLayout from '@/layouts/customer-layout';

type Props = {
    passwordRules: string;
    content?: {
        heading?: string;
        subtitle?: string;
        benefits?: string[];
    };
};

// Icons cycle through this set by position; extra benefits reuse the last one.
const BENEFIT_ICONS = [Sparkles, Truck, ShieldCheck];

export default function Register({ passwordRules, content }: Props) {
    const { general_settings: settings } = usePage().props as any;
    const storeName = settings?.store_name || 'EShop';

    const heading = content?.heading || 'Create your account.';
    const subtitle = content?.subtitle || 'Join thousands of shoppers and unlock a faster, more personal way to buy.';
    const benefits = content?.benefits?.length
        ? content.benefits
        : ['Exclusive member pricing', 'Save addresses & track orders', 'Your data stays protected'];

    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [agreed, setAgreed] = useState(false);

    const confirmMatches = confirmation.length > 0 && confirmation === password;
    const confirmMismatch = confirmation.length > 0 && confirmation !== password;

    return (
        <CustomerLayout>
            <Head title="Create an account" />

            <div className="mesh-bg flex items-start justify-center px-4 py-4 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8 lg:py-10">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/5 lg:grid-cols-2">
                    {/* Brand panel */}
                    <div className="relative hidden flex-col justify-between overflow-hidden bg-shop-primary p-10 text-white lg:flex">
                        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-shop-primary/30 blur-3xl" />

                        <div className="relative flex items-center gap-2 text-lg font-bold tracking-tight">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            {storeName}
                        </div>

                        <div className="relative space-y-4">
                            <h2 className="text-3xl font-bold leading-tight">{heading}</h2>
                            <p className="max-w-sm text-sm text-white/80">{subtitle}</p>
                            <ul className="space-y-3 pt-2 text-sm text-white/90">
                                {benefits.map((benefit, i) => {
                                    const Icon = BENEFIT_ICONS[i] ?? BENEFIT_ICONS[BENEFIT_ICONS.length - 1];
                                    return (
                                        <li key={i} className="flex items-center gap-3"><Icon className="h-5 w-5 shrink-0" /> {benefit}</li>
                                    );
                                })}
                            </ul>
                        </div>

                        <p className="relative text-xs text-white/60">&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                    </div>

                    {/* Form panel */}
                    <div className="p-8 sm:p-10">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create account</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Sign up to manage your orders and more.</p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            name="name"
                                            placeholder="John Doe"
                                            className="h-11"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="email@example.com"
                                            className="h-11"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <PasswordInput
                                            id="password"
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Create a strong password"
                                            passwordrules={passwordRules}
                                            className="h-11"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <PasswordStrength password={password} />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirm password</Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Re-enter your password"
                                            passwordrules={passwordRules}
                                            className="h-11"
                                            onChange={(e) => setConfirmation(e.target.value)}
                                        />
                                        {confirmMatches && (
                                            <p className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-500">
                                                <Check className="h-3.5 w-3.5" /> Passwords match
                                            </p>
                                        )}
                                        {confirmMismatch && (
                                            <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                <X className="h-3.5 w-3.5" /> Passwords don't match yet
                                            </p>
                                        )}
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="terms"
                                            checked={agreed}
                                            onCheckedChange={(c) => setAgreed(c as boolean)}
                                            tabIndex={5}
                                            className="mt-0.5"
                                        />
                                        <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-snug text-muted-foreground">
                                            I agree to the{' '}
                                            <TextLink href="#" className="font-semibold text-shop hover:text-shop/80">Terms of Service</TextLink>{' '}
                                            and{' '}
                                            <TextLink href="#" className="font-semibold text-shop hover:text-shop/80">Privacy Policy</TextLink>.
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 w-full btn-shop text-base disabled:cursor-not-allowed disabled:opacity-60"
                                        tabIndex={6}
                                        disabled={processing || !agreed}
                                        data-test="register-user-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Create account
                                    </Button>

                                    <div className="text-center text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <TextLink href={login()} tabIndex={7} className="font-semibold text-shop hover:text-shop/80">
                                            Log in
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
