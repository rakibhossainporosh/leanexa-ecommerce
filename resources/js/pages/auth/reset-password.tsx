import { Form, Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CustomerLayout from '@/layouts/customer-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <CustomerLayout>
            <Head title="Reset password" />

            <div className="mesh-bg flex items-start justify-center px-4 py-4 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8 lg:py-10">
                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 sm:p-10">
                    <div className="mb-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-shop-primary/10 text-shop">
                            <LockKeyhole className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset password</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Please enter your new password below.</p>
                    </div>

                    <Form
                        {...update.form()}
                        transform={(data) => ({ ...data, token, email })}
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        value={email}
                                        className="h-11"
                                        readOnly
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">New password</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        className="h-11"
                                        autoFocus
                                        placeholder="Enter new password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        className="h-11"
                                        placeholder="Confirm new password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full btn-shop text-base"
                                    disabled={processing}
                                    data-test="reset-password-button"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    Reset password
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </CustomerLayout>
    );
}
