import { Form, Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CustomerLayout from '@/layouts/customer-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <CustomerLayout>
            <Head title="Forgot password" />

            <div className="mesh-bg flex items-start justify-center px-4 py-4 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8 lg:py-10">
                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 sm:p-10">
                    <div className="mb-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-shop-primary/10 text-shop">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            No worries — enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <Form {...email.form()} className="flex flex-col gap-5">
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
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="h-11"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full btn-shop text-base"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    Email password reset link
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="mt-6 space-x-1 text-center text-sm text-muted-foreground">
                        <span>Or, return to</span>
                        <TextLink href={login()} className="font-semibold text-shop hover:text-shop/80">
                            log in
                        </TextLink>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
