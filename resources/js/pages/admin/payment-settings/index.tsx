import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { CreditCard, Save } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';

type PaymentSettings = {
    store_id: string;
    store_password: string;
    is_sandbox: boolean;
};

export default function PaymentSettings({ settings }: { settings: PaymentSettings }) {
    const { data, setData, put, processing, errors } = useForm({
        store_id: settings?.store_id || '',
        store_password: settings?.store_password || '',
        is_sandbox: settings?.is_sandbox ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/payment-settings', {
            onSuccess: () => toast.success('Payment settings updated successfully!'),
        });
    };

    return (
        <AdminLayout>
            <Head title="Payment Settings" />
            
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
                    <p className="text-muted-foreground">Configure SSLCommerz credentials and payment modes.</p>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                SSLCommerz Configuration
                            </CardTitle>
                            <CardDescription>
                                Enter your SSLCommerz merchant details. Sandbox mode should be enabled for testing purposes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="store_id">Store ID</Label>
                                <Input
                                    id="store_id"
                                    value={data.store_id}
                                    onChange={(e) => setData('store_id', e.target.value)}
                                    placeholder="e.g. testbox"
                                />
                                <InputError message={errors.store_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="store_password">Store Password</Label>
                                <Input
                                    id="store_password"
                                    type="password"
                                    value={data.store_password}
                                    onChange={(e) => setData('store_password', e.target.value)}
                                    placeholder="Enter your store password"
                                />
                                <InputError message={errors.store_password} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Sandbox Mode (Test Mode)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable this for testing transactions with dummy cards.
                                    </p>
                                </div>
                                <Checkbox
                                    id="is_sandbox"
                                    checked={data.is_sandbox}
                                    onCheckedChange={(checked) => setData('is_sandbox', checked as boolean)}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="gap-2">
                                    <Save className="h-4 w-4" /> Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
