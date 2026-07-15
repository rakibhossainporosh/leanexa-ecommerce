import { Form, Head, usePage } from '@inertiajs/react';
import { ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import CustomerLayout from '@/layouts/customer-layout';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { general_settings: settings } = usePage().props as any;
    const storeName = settings?.store_name || 'EShop';

    return (
        <CustomerLayout>
            <Head title="Log in" />

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
                            <h2 className="text-3xl font-bold leading-tight">Welcome back to your store.</h2>
                            <p className="max-w-sm text-sm text-white/80">
                                Track orders, manage your wishlist and check out faster — all in one place.
                            </p>
                            <ul className="space-y-3 pt-2 text-sm text-white/90">
                                <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 shrink-0" /> Secure, encrypted checkout</li>
                                <li className="flex items-center gap-3"><Truck className="h-5 w-5 shrink-0" /> Real-time order tracking</li>
                                <li className="flex items-center gap-3"><Sparkles className="h-5 w-5 shrink-0" /> Members-only deals</li>
                            </ul>
                        </div>

                        <p className="relative text-xs text-white/60">&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                    </div>

                    {/* Form panel */}
                    <div className="p-8 sm:p-10">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access your account.</p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-5">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="h-11"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="ml-auto text-xs font-semibold text-shop hover:text-shop/80"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className="h-11"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox id="remember" name="remember" tabIndex={3} />
                                        <Label htmlFor="remember" className="cursor-pointer text-sm font-medium">Remember me</Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 w-full btn-shop text-base"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Sign in
                                    </Button>

                                    <div className="text-center text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} tabIndex={5} className="font-semibold text-shop hover:text-shop/80">
                                            Sign up now
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
