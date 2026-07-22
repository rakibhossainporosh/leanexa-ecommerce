import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { useCurrency } from '@/hooks/use-currency';
import { ShoppingBag, FileText, Search } from 'lucide-react';

export default function SalesReportIndex({ summary, recent_transactions, filters }: { summary: any; recent_transactions: any[]; filters: any }) {
    // The controller reports every figure in the default currency, so formatPrice
    // converts them into whichever currency is selected — prefixing a symbol
    // without converting showed BDT figures labelled as dollars.
    const { formatPrice } = useCurrency();

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/sales-report', { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        router.get('/admin/sales-report');
    };

    return (
        <AdminLayout title="Sales Report">
            <Head title="Sales Report" />

            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <p className="text-muted-foreground text-sm">View your revenue and transaction history.</p>

                <form onSubmit={applyFilter} className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-3 shadow-sm">
                    <div className="space-y-1">
                        <Label htmlFor="start_date" className="text-xs">Start Date</Label>
                        <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-[140px] text-sm" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="end_date" className="text-xs">End Date</Label>
                        <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-[140px] text-sm" />
                    </div>
                    <Button type="submit" className="h-9" disabled={!startDate || !endDate}>
                        <Search className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    {(filters.start_date || filters.end_date) && (
                        <Button type="button" variant="outline" className="h-9" onClick={clearFilter}>
                            Clear
                        </Button>
                    )}
                </form>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatPrice(summary.total_revenue)}</div>
                        <p className="mt-1 text-xs opacity-80">From orders &amp; invoices</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.total_orders}</div>
                        <p className="text-muted-foreground mt-1 text-xs">Paid e-commerce orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.total_invoices}</div>
                        <p className="text-muted-foreground mt-1 text-xs">Paid custom invoices</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">ID / Ref</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="pr-6 text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_transactions.map((tx: any) => (
                                <TableRow key={tx.type + tx.id}>
                                    <TableCell className="pl-6 font-mono font-medium">{tx.identifier}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.type === 'Order' ? 'secondary' : 'default'}>{tx.type}</Badge>
                                    </TableCell>
                                    <TableCell>{tx.customer}</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(tx.date).toLocaleString()}</TableCell>
                                    <TableCell className="pr-6 text-right font-bold">{formatPrice(tx.amount)}</TableCell>
                                </TableRow>
                            ))}
                            {recent_transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                                        No paid transactions found in this period.
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
