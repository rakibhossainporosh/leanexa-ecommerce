import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Plus, Trash2, Coins, CircleCheckBig, CircleDashed, Pencil } from 'lucide-react';

export default function CurrenciesIndex({ currencies }: { currencies: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<any>(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        symbol: '',
        exchange_rate: '1.0000',
        is_default: false,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const onSuccess = () => {
            setIsOpen(false);
            toast.success(editingCurrency ? 'Currency updated successfully.' : 'Currency created successfully.');
            setEditingCurrency(null);
            reset();
            clearErrors();
        };

        if (editingCurrency) {
            put(`/admin/currencies/${editingCurrency.id}`, { onSuccess });
        } else {
            post('/admin/currencies', { onSuccess });
        }
    };

    const openCreate = () => {
        setEditingCurrency(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEdit = (currency: any) => {
        setEditingCurrency(currency);
        setData({
            code: currency.code,
            symbol: currency.symbol,
            exchange_rate: currency.exchange_rate,
            is_default: currency.is_default,
            is_active: currency.is_active,
        });
        clearErrors();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this currency?')) {
            router.delete(`/admin/currencies/${id}`, { onSuccess: () => toast.success('Currency deleted successfully.') });
        }
    };

    return (
        <AdminLayout title="Currencies">
            <Head title="Manage Currencies" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Manage supported currencies and their exchange rates.</p>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) {
                        setEditingCurrency(null);
                        reset();
                        clearErrors();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Add Currency
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingCurrency ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Currency Code</Label>
                                    <Input id="code" placeholder="e.g. USD" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())} maxLength={3} />
                                    {errors.code && <p className="text-destructive text-sm">{errors.code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Symbol</Label>
                                    <Input id="symbol" placeholder="e.g. $" value={data.symbol} onChange={(e) => setData('symbol', e.target.value)} />
                                    {errors.symbol && <p className="text-destructive text-sm">{errors.symbol}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exchange_rate">Exchange Rate (Base = 1.0000)</Label>
                                <Input id="exchange_rate" type="number" step="0.0001" value={data.exchange_rate} onChange={(e) => setData('exchange_rate', e.target.value)} />
                                {errors.exchange_rate && <p className="text-destructive text-sm">{errors.exchange_rate}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_default" checked={data.is_default} onCheckedChange={(checked) => setData('is_default', checked as boolean)} />
                                <Label htmlFor="is_default" className="font-normal">Set as Default Currency</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
                                <Label htmlFor="is_active" className="font-normal">Active (Visible to users)</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>{editingCurrency ? 'Update Currency' : 'Save Currency'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Currency</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currencies.map((currency) => (
                                <TableRow key={currency.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted flex h-11 w-11 items-center justify-center rounded-md text-lg font-bold">
                                                {currency.symbol}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    {currency.code}
                                                    {currency.is_default && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    Updated {new Date(currency.updated_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="bg-muted rounded px-2 py-1 font-mono text-sm">{currency.exchange_rate}</code>
                                    </TableCell>
                                    <TableCell>
                                        {currency.is_active ? (
                                            <span className="flex items-center text-sm font-medium text-emerald-600">
                                                <CircleCheckBig className="mr-1.5 h-4 w-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground flex items-center text-sm font-medium">
                                                <CircleDashed className="mr-1.5 h-4 w-4" /> Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-primary hover:text-primary h-8 w-8"
                                                onClick={() => openEdit(currency)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!currency.is_default && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive h-8 w-8"
                                                    onClick={() => handleDelete(currency.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {currencies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                <Coins className="text-muted-foreground h-8 w-8" />
                                            </div>
                                            <p className="font-medium">No currencies found</p>
                                            <p className="text-muted-foreground mt-1 text-sm">Get started by adding a base currency.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
