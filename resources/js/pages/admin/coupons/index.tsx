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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Ticket } from 'lucide-react';

export default function CouponsIndex({ coupons }: { coupons: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        min_cart_amount: '',
        valid_from: '',
        valid_until: '',
        max_uses: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingCoupon(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (coupon: any) => {
        setEditingCoupon(coupon);
        setData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            min_cart_amount: coupon.min_cart_amount ? coupon.min_cart_amount.toString() : '',
            valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
            max_uses: coupon.max_uses ? coupon.max_uses.toString() : '',
            is_active: coupon.is_active,
        });
        clearErrors();
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCoupon) {
            put(`/admin/coupons/${editingCoupon.id}`, { onSuccess: () => { setIsOpen(false); toast.success('Coupon updated successfully.'); } });
        } else {
            post('/admin/coupons', { onSuccess: () => { setIsOpen(false); toast.success('Coupon created successfully.'); } });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            router.delete(`/admin/coupons/${id}`, { onSuccess: () => toast.success('Coupon deleted successfully.') });
        }
    };

    const toggleStatus = (coupon: any) => {
        router.put(`/admin/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active }, { preserveScroll: true, onSuccess: () => toast.success('Coupon status updated.') });
    };

    return (
        <AdminLayout title="Coupons">
            <Head title="Manage Coupons" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Manage promotional codes and discounts.</p>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) reset();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" /> Add Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. SUMMER26"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    className="font-mono uppercase"
                                />
                                {errors.code && <p className="text-destructive text-sm">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Discount Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger id="type" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        placeholder={data.type === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                    />
                                    {errors.value && <p className="text-destructive text-sm">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_cart_amount">Min. Cart Amount (Optional)</Label>
                                <Input
                                    id="min_cart_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 100.00"
                                    value={data.min_cart_amount}
                                    onChange={(e) => setData('min_cart_amount', e.target.value)}
                                />
                                {errors.min_cart_amount && <p className="text-destructive text-sm">{errors.min_cart_amount}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="valid_from">Valid From (Optional)</Label>
                                    <Input id="valid_from" type="datetime-local" value={data.valid_from} onChange={(e) => setData('valid_from', e.target.value)} />
                                    {errors.valid_from && <p className="text-destructive text-sm">{errors.valid_from}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                                    <Input id="valid_until" type="datetime-local" value={data.valid_until} onChange={(e) => setData('valid_until', e.target.value)} />
                                    {errors.valid_until && <p className="text-destructive text-sm">{errors.valid_until}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                                <Input
                                    id="max_uses"
                                    type="number"
                                    placeholder="Total times this coupon can be used"
                                    value={data.max_uses}
                                    onChange={(e) => setData('max_uses', e.target.value)}
                                />
                                {errors.max_uses && <p className="text-destructive text-sm">{errors.max_uses}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
                                <Label htmlFor="is_active" className="cursor-pointer font-normal">Active Coupon</Label>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
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
                                <TableHead className="pl-6">Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Min Cart</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                                                <Ticket className="h-4 w-4" />
                                            </div>
                                            <span className="font-mono font-bold">{coupon.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {coupon.min_cart_amount ? `$${coupon.min_cart_amount}` : 'None'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{coupon.uses} used</div>
                                        {coupon.max_uses && <div className="text-muted-foreground text-xs">of {coupon.max_uses} limit</div>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : 'Always'}
                                        {' - '}
                                        {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Forever'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={coupon.is_active ? 'default' : 'secondary'}
                                            className="cursor-pointer"
                                            onClick={() => toggleStatus(coupon)}
                                        >
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(coupon)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-8 w-8"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {coupons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                                        No coupons found. Create your first coupon to get started.
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
