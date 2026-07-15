import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

export default function CustomersIndex({ customers }: { customers: any }) {
    return (
        <AdminLayout title="Customers">
            <Head title="Customers" />

            <p className="text-muted-foreground mb-6 text-sm">View and manage your registered customers.</p>

            <Card>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="pr-6">Joined Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers?.data?.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{customer.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{customer.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                                    <TableCell className="text-muted-foreground pr-6">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!customers?.data || customers.data.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                <Users className="text-muted-foreground h-8 w-8" />
                                            </div>
                                            <p className="font-medium">No customers found</p>
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
