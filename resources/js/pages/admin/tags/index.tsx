import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Tags as TagsIcon } from 'lucide-react';

export default function TagsIndex({ tags }: { tags: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<any>(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ name: '' });

    const openCreateModal = () => {
        setEditingTag(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (tag: any) => {
        setEditingTag(tag);
        setData({
            name: tag.name,
        });
        clearErrors();
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTag) {
            put(`/admin/tags/${editingTag.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                },
            });
        } else {
            post('/admin/tags', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            router.delete(`/admin/tags/${id}`);
        }
    };

    return (
        <AdminLayout title="Tags">
            <Head title="Manage Tags" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Group your products with keywords.</p>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) reset();
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" /> Add Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Summer Sale"
                                />
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>{editingTag ? 'Update Tag' : 'Save Tag'}</Button>
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
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags.map((tag) => (
                                <TableRow key={tag.id} className="group">
                                    <TableCell className="pl-6">
                                        <Badge variant="secondary">{tag.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(tag)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-8 w-8"
                                                onClick={() => handleDelete(tag.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tags.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                <TagsIcon className="text-muted-foreground h-8 w-8" />
                                            </div>
                                            <p className="font-medium">No tags found</p>
                                            <p className="text-muted-foreground mt-1 text-sm">Get started by creating a new tag.</p>
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
