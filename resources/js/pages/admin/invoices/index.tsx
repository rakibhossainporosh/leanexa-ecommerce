import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, FileText, CheckCircle2, Search, X, PackagePlus, Pencil } from 'lucide-react';

type LineItem = {
    product_id: number | null;
    name: string;
    quantity: number;
    price: number;
    discount: number;
};

type SearchResult = { id: number; name: string; price: string; discount_price: string | null };

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'paid') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
};

const money = (n: number, symbol: string = '$') => `${symbol}${n.toFixed(2)}`;

export default function InvoicesIndex({ invoices, currencies }: { invoices: any, currencies: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);
    const { activeCurrency } = usePage().props as any;
    
    // Find default currency
    const defaultCurrency = currencies?.find(c => c.is_default) || currencies?.[0];
    const initialCurrency = defaultCurrency?.code || 'BDT';
    const initialRate = defaultCurrency ? Number(defaultCurrency.exchange_rate) : 1;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        customer_address: string;
        note: string;
        payable_amount: string;
        allow_partial: boolean;
        currency_code: string;
        exchange_rate: string;
        items: LineItem[];
    }>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        note: '',
        payable_amount: '',
        allow_partial: false,
        currency_code: initialCurrency,
        exchange_rate: initialRate.toString(),
        items: [],
    });

    const selectedCurrencyObj = currencies?.find(c => c.code === data.currency_code) || defaultCurrency;
    const selectedCurrencySymbol = selectedCurrencyObj?.symbol || '৳';
    
    const getCurrencySymbol = (code: string | null | undefined) => {
        if (!code) return defaultCurrency?.symbol || '৳';
        const c = currencies?.find(x => x.code === code);
        return c?.symbol || defaultCurrency?.symbol || '৳';
    };

    const [paymentType, setPaymentType] = useState<'full'|'partial'>('full');

    // ---- Product search ----
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (search.trim().length < 1) {
            setResults([]);
            return;
        }
        setSearching(true);
        const t = setTimeout(() => {
            fetch(`/admin/invoices-search-products?q=${encodeURIComponent(search)}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then((r) => r.json())
                .then((d: SearchResult[]) => {
                    setResults(d);
                    setShowResults(true);
                })
                .catch(() => setResults([]))
                .finally(() => setSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    // Close dropdown on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const addProduct = (p: SearchResult) => {
        const basePrice = p.discount_price && parseFloat(p.discount_price) > 0 ? parseFloat(p.discount_price) : parseFloat(p.price);
        
        // Convert base price to selected currency
        const defaultRate = defaultCurrency ? parseFloat(defaultCurrency.exchange_rate) || 1 : 1;
        const currentRate = parseFloat(data.exchange_rate) || 1;
        const convertedPrice = (basePrice / defaultRate) * currentRate;

        setData('items', [...data.items, { product_id: p.id, name: p.name, quantity: 1, price: Number(convertedPrice.toFixed(2)), discount: 0 }]);
        setSearch('');
        setResults([]);
        setShowResults(false);
    };

    const addBlankItem = () => {
        setData('items', [...data.items, { product_id: null, name: '', quantity: 1, price: 0, discount: 0 }]);
    };

    const updateItem = (index: number, patch: Partial<LineItem>) => {
        const next = data.items.map((it, i) => (i === index ? { ...it, ...patch } : it));
        setData('items', next);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    // ---- Totals (display only; server recomputes) ----
    const subtotal = data.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const totalDiscount = data.items.reduce((s, it) => s + Math.min(it.discount, it.price * it.quantity), 0);
    const grandTotal = subtotal - totalDiscount;

    const resetAll = () => {
        reset();
        clearErrors();
        setSearch('');
        setResults([]);
        setEditingInvoice(null);
    };

    const openEdit = (invoice: any) => {
        setEditingInvoice(invoice);
        setData({
            customer_name: invoice.customer_name ?? '',
            customer_email: invoice.customer_email ?? '',
            customer_phone: invoice.customer_phone ?? '',
            customer_address: invoice.customer_address ?? '',
            note: invoice.note ?? '',
            payable_amount: invoice.payable_amount ?? '',
            allow_partial: Boolean(invoice.allow_partial),
            currency_code: invoice.currency_code ?? initialCurrency,
            exchange_rate: invoice.exchange_rate ? invoice.exchange_rate.toString() : initialRate.toString(),
            items: (invoice.items ?? []).map((it: any) => ({
                product_id: it.product_id ?? null,
                name: it.name,
                quantity: Number(it.quantity),
                price: Number(it.price),
                discount: Number(it.discount),
            })),
        });
        setPaymentType(invoice.allow_partial ? 'partial' : 'full');
        clearErrors();
        setSearch('');
        setResults([]);
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            onSuccess: () => {
                setIsOpen(false);
                resetAll();
            },
        };
        if (editingInvoice) {
            put(`/admin/invoices/${editingInvoice.id}`, opts);
        } else {
            post('/admin/invoices', opts);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            router.delete(`/admin/invoices/${id}`);
        }
    };

    const copyToClipboard = (uuid: string, id: number) => {
        const url = `${window.location.origin}/invoice/${uuid}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <AdminLayout title="Custom Invoices">
            <Head title="Manage Custom Invoices" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-sm">Generate itemized payment links for custom orders.</p>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) resetAll();
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={() => resetAll()}>
                            <Plus className="mr-2 h-4 w-4" /> Create Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
                        <DialogHeader>
                            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Custom Invoice'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-6 pt-2">
                            {/* Customer details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Customer Details</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Name</Label>
                                        <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} placeholder="John Doe" />
                                        {errors.customer_name && <p className="text-destructive text-sm">{errors.customer_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone</Label>
                                        <Input
                                            id="customer_phone"
                                            type="tel"
                                            inputMode="tel"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value.replace(/[^0-9+\s\-()]/g, ''))}
                                            placeholder="+880 1712 345678"
                                        />
                                        <p className="text-muted-foreground text-xs">Digits only (7–15). Required — the payment gateway needs it.</p>
                                        {errors.customer_phone && <p className="text-destructive text-sm">{errors.customer_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Email</Label>
                                        <Input id="customer_email" type="email" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} placeholder="john@example.com" />
                                        {errors.customer_email && <p className="text-destructive text-sm">{errors.customer_email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_address">Address</Label>
                                        <Input id="customer_address" value={data.customer_address} onChange={(e) => setData('customer_address', e.target.value)} placeholder="123 Street, City" />
                                        {errors.customer_address && <p className="text-destructive text-sm">{errors.customer_address}</p>}
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Note (Optional)</Label>
                                        <Textarea id="note" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Any note for the customer..." />
                                        {errors.note && <p className="text-destructive text-sm">{errors.note}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency_code">Invoice Currency</Label>
                                        <select
                                            id="currency_code"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.currency_code}
                                            onChange={(e) => {
                                                const code = e.target.value;
                                                const selected = currencies?.find(c => c.code === code) || defaultCurrency;
                                                const newRate = selected ? parseFloat(selected.exchange_rate) : 1;
                                                const oldRate = parseFloat(data.exchange_rate) || 1;
                                                
                                                const updatedItems = data.items.map(item => ({
                                                    ...item,
                                                    price: Number(((item.price / oldRate) * newRate).toFixed(2)),
                                                    discount: Number(((item.discount / oldRate) * newRate).toFixed(2))
                                                }));

                                                setData({
                                                    ...data,
                                                    currency_code: code,
                                                    exchange_rate: newRate.toString(),
                                                    items: updatedItems
                                                });
                                            }}
                                        >
                                            {currencies?.map((currency) => (
                                                <option key={currency.code} value={currency.code}>
                                                    {currency.code} ({currency.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Items</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addBlankItem} className="h-8 text-xs">
                                        <PackagePlus className="mr-1 h-3.5 w-3.5" /> Custom line
                                    </Button>
                                </div>

                                {/* Product search */}
                                <div ref={searchBoxRef} className="relative">
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onFocus={() => results.length && setShowResults(true)}
                                            placeholder="Search products by name or SKU..."
                                            className="pl-9"
                                        />
                                    </div>
                                    {showResults && (search.trim().length > 0) && (
                                        <div className="bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-md">
                                            {searching && <div className="text-muted-foreground px-3 py-2 text-sm">Searching…</div>}
                                            {!searching && results.length === 0 && (
                                                <div className="text-muted-foreground px-3 py-2 text-sm">No products found.</div>
                                            )}
                                            {results.map((p) => (
                                                <button
                                                    type="button"
                                                    key={p.id}
                                                    onClick={() => addProduct(p)}
                                                    className="hover:bg-accent flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                                                >
                                                    <span>{p.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {money(p.discount_price && parseFloat(p.discount_price) > 0 ? parseFloat(p.discount_price) : parseFloat(p.price), selectedCurrencySymbol)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {typeof errors.items === 'string' && <p className="text-destructive text-sm">{errors.items}</p>}

                                {/* Line items table */}
                                {data.items.length > 0 ? (
                                    <div className="overflow-hidden rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium">Product</th>
                                                    <th className="w-20 px-2 py-2 text-left font-medium">Qty</th>
                                                    <th className="w-28 px-2 py-2 text-left font-medium">Price</th>
                                                    <th className="w-28 px-2 py-2 text-left font-medium">Discount</th>
                                                    <th className="w-24 px-2 py-2 text-right font-medium">Total</th>
                                                    <th className="w-10 px-2 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {data.items.map((it, i) => {
                                                    const lineGross = it.price * it.quantity;
                                                    const lineTotal = lineGross - Math.min(it.discount, lineGross);
                                                    return (
                                                        <tr key={i}>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    value={it.name}
                                                                    onChange={(e) => updateItem(i, { name: e.target.value })}
                                                                    placeholder="Item name"
                                                                    className="h-8"
                                                                />
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    value={it.quantity}
                                                                    onChange={(e) => updateItem(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                                                    className="h-8"
                                                                />
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={it.price}
                                                                    onChange={(e) => updateItem(i, { price: parseFloat(e.target.value) || 0 })}
                                                                    className="h-8"
                                                                />
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={it.discount}
                                                                    onChange={(e) => updateItem(i, { discount: parseFloat(e.target.value) || 0 })}
                                                                    className="h-8"
                                                                />
                                                            </td>
                                                            <td className="px-2 py-2 text-right font-medium">{money(lineTotal, selectedCurrencySymbol)}</td>
                                                            <td className="px-2 py-2 text-right">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive h-8 w-8"
                                                                    onClick={() => removeItem(i)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground rounded-md border border-dashed py-8 text-center text-sm">
                                        Search a product or add a custom line to get started.
                                    </div>
                                )}

                                {/* Totals */}
                                {data.items.length > 0 && (
                                    <div className="ml-auto w-full max-w-xs space-y-3 text-sm">
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>{money(subtotal, selectedCurrencySymbol)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Discount</span>
                                                <span className="text-destructive">-{money(totalDiscount, selectedCurrencySymbol)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1 text-base font-bold">
                                                <span>Total</span>
                                                <span>{money(grandTotal, selectedCurrencySymbol)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-3 border-t">
                                            <Label className="mb-2 block">Payment Request Type</Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="payment_type" 
                                                        checked={paymentType === 'full'} 
                                                        onChange={() => {
                                                            setPaymentType('full');
                                                            setData('payable_amount', '');
                                                            setData('allow_partial', false);
                                                        }}
                                                    />
                                                    <span className="text-sm">Full Amount</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="payment_type" 
                                                        checked={paymentType === 'partial'}
                                                        onChange={() => {
                                                            setPaymentType('partial');
                                                            setData('allow_partial', true);
                                                        }}
                                                    />
                                                    <span className="text-sm">Partial/Fixed</span>
                                                </label>
                                            </div>
                                            
                                            {paymentType === 'partial' && (
                                                <div className="mt-3">
                                                    <Label htmlFor="payable_amount">Payable Now Amount</Label>
                                                    <Input 
                                                        id="payable_amount" 
                                                        type="number" 
                                                        min="0"
                                                        step="0.01"
                                                        value={data.payable_amount} 
                                                        onChange={e => setData('payable_amount', e.target.value)} 
                                                        placeholder="e.g. 500"
                                                        className="mt-1 h-8"
                                                    />
                                                    {errors.payable_amount && <p className="text-destructive text-xs mt-1">{errors.payable_amount}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing || data.items.length === 0}>
                                    {editingInvoice ? 'Update Invoice' : 'Generate Invoice Link'}
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
                                <TableHead className="pl-6">Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices?.data?.map((invoice: any) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="pl-6">
                                        <div className="font-medium">{invoice.customer_name}</div>
                                        <div className="text-muted-foreground text-xs">{invoice.customer_email}</div>
                                        {invoice.customer_phone && <div className="text-muted-foreground text-xs">{invoice.customer_phone}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate" title={invoice.description}>
                                            {invoice.description || '-'}
                                        </div>
                                        <div className="text-muted-foreground text-xs">{invoice.items?.length ?? 0} item(s)</div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{getCurrencySymbol(invoice.currency_code)}{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(invoice.status)} className="capitalize">
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            {invoice.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEdit(invoice)}
                                                    title="Edit Invoice"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => copyToClipboard(invoice.uuid, invoice.id)}
                                                title="Copy Payment Link"
                                            >
                                                {copiedId === invoice.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="h-8 w-8"
                                                title="View/Download Invoice PDF"
                                            >
                                                <a href={`/admin/invoices/${invoice.id}/pdf`} target="_blank">
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-8 w-8"
                                                onClick={() => handleDelete(invoice.id)}
                                                title="Delete Invoice"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!invoices?.data || invoices.data.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                                <FileText className="text-muted-foreground h-8 w-8" />
                                            </div>
                                            <p className="font-medium">No invoices found</p>
                                            <p className="text-muted-foreground mt-1 text-sm">Generate a payment link for a custom order.</p>
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
