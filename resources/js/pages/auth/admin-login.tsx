import { useForm, usePage, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ShieldCheck, Lock } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function AdminLogin({ status }: Props) {
    const { general_settings: settings } = usePage().props as any;
    const storeName = settings?.store_name || 'EShop';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login', {
            onSuccess: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
            {/* Soft background accents */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#eef2ff,_#f8fafc)]" />
            <div className="absolute -top-24 left-1/3 -z-10 h-96 w-96 rounded-full bg-shop-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

            <Head title="Admin Login" />

            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
                    <div className="mb-8 flex flex-col items-center gap-3 text-center">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt={storeName} className="h-auto w-52 max-w-full object-contain" />
                        ) : (
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{storeName} Admin</h1>
                        )}
                        <h1 className="mt-1 text-lg text-slate-500">Welcome Admin</h1>
                        <p className="mt-1 text-sm text-slate-500">Sign in to access the control panel</p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-700">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="admin@example.com"
                                className="h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-shop-primary"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-700">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-shop-primary"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                tabIndex={3}
                                className="border-slate-300 data-[state=checked]:border-shop-primary data-[state=checked]:bg-shop-primary"
                            />
                            <Label htmlFor="remember" className="cursor-pointer text-sm text-slate-600">Remember me</Label>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 h-12 w-full bg-shop-primary text-base font-semibold text-white shadow-lg shadow-shop-primary/25 transition-colors hover:bg-shop-primary-hover"
                            tabIndex={4}
                            disabled={processing}
                        >
                            {processing ? <Spinner className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                            Log in to dashboard
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Designed &amp; Developed by{' '}
                    <a
                        href="https://onetech.com.bd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-slate-600 hover:underline"
                    >
                        ONETECH
                    </a>
                </p>
            </div>
        </div>
    );
}

AdminLogin.layout = {
    title: 'Admin Login',
    description: 'Login to access the admin panel.',
};
