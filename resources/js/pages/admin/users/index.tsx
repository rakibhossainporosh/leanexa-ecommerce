import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Plus, Trash2, Pencil, ShieldCheck, Search } from 'lucide-react';

type UserRow = { id: number; name: string; email: string; role: string | null; created_at: string | null };
type Paginated<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

export default function UsersIndex({
    users,
    roles,
    filters,
}: {
    users: Paginated<UserRow>;
    roles: string[];
    filters: { search: string };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<UserRow | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const defaultRole = roles.includes('Admin') ? 'Admin' : (roles[0] ?? '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: defaultRole,
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEdit = (u: UserRow) => {
        setEditing(u);
        setData({ name: u.name, email: u.email, password: '', password_confirmation: '', role: u.role ?? defaultRole });
        clearErrors();
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => setIsOpen(false), preserveScroll: true };
        if (editing) {
            put(`/admin/users/${editing.id}`, opts);
        } else {
            post('/admin/users', opts);
        }
    };

    const remove = (u: UserRow) => {
        if (confirm(`Delete ${u.name}? This cannot be undone.`)) {
            router.delete(`/admin/users/${u.id}`, { preserveScroll: true });
        }
    };

    const applyFilters = (next: { search?: string }) => {
        router.get(
            '/admin/users',
            { search: next.search ?? search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AdminLayout title="Admin Users">
            <Head title="Manage Admin Users" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Manage admin users who have access to this panel.</p>

                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Admin</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{editing ? 'New Password (optional)' : 'Password'}</Label>
                                <PasswordInput id="password" autoComplete="new-password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <PasswordInput id="password_confirmation" autoComplete="new-password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>{editing ? 'Update Admin' : 'Create Admin'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="mb-4">
                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilters({ search }); }}
                    className="relative max-w-md"
                >
                    <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </form>
            </div>

            <Card>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                                                {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{u.name}</span>
                                                <ShieldCheck className="text-primary h-4 w-4" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => remove(u)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">No admin users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {users.links.length > 3 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1">
                    {users.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
