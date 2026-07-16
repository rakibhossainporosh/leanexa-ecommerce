import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CreditCard, CheckCircle2, AlertCircle, Receipt, Building, Mail, Phone, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type InvoiceItem = { id: number; name: string; quantity: number; price: string; discount: string; total: string };

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'warning' => {
    if (status === 'paid') return 'default';
    if (status === 'partially_paid') return 'warning';
    if (status === 'pending') return 'secondary';
    return 'destructive';
};

const statusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
};

export default function InvoiceShow({ invoice, currencySymbol }: { invoice: any, currencySymbol: string }) {
    const props = usePage().props as any;
    const { flash = {}, general_settings } = props;
    
    const formatMoney = (amount: number | string) => {
        const num = Number(amount) || 0;
        return `${currencySymbol}${num.toFixed(2)}`;
    };

    const maxActiveAmount = Number(invoice.effective_payable_amount ?? invoice.due_amount);

    // Three admin-chosen modes:
    //  - Full Amount (allow_partial false)            -> customer pays the full due (locked)
    //  - Partial with a fixed "Payable Now" amount    -> customer pays exactly that (locked)
    //  - Partial with no fixed amount                 -> customer chooses any part of the due
    const hasFixedAmount = invoice.payable_amount != null && Number(invoice.payable_amount) > 0;
    const isAmountFixed = !invoice.allow_partial || hasFixedAmount;

    const [displayAmount, setDisplayAmount] = useState(() => maxActiveAmount.toFixed(2));

    const { data, setData, post, processing } = useForm({
        payment_amount: invoice.effective_payable_amount ?? invoice.due_amount,
    });
    const items: InvoiceItem[] = invoice.items ?? [];

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/invoice/${invoice.uuid}/pay`);
    };

    return (
        <div className="bg-slate-50/80 dark:bg-zinc-950 min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center">
            <Head title={`Invoice #${invoice.uuid.split('-')[0].toUpperCase()}`} />

            <div className="w-full max-w-3xl space-y-4">
                {flash.success && (
                    <div className="flex items-center rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 px-4 py-4 text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="mr-3 h-5 w-5" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-center rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-4 text-red-800 dark:text-red-300 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="mr-3 h-5 w-5" />
                        <span className="font-medium">{flash.error}</span>
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                    {/* Top Decorative Bar */}
                    <div className="h-2 w-full bg-shop-primary" />
                    
                    <div className="p-6 sm:p-8">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                            {/* Logo & Company Info */}
                            <div className="space-y-4">
                                {general_settings?.logo_url ? (
                                    <img 
                                        src={general_settings.logo_url} 
                                        alt={general_settings.store_name} 
                                        className="h-8 object-contain"
                                    />
                                ) : (
                                    <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-shop-primary flex items-center justify-center">
                                            <Building className="w-4 h-4 text-white" />
                                        </div>
                                        {general_settings?.store_name || 'My Store'}
                                    </div>
                                )}
                                
                                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 mt-4 max-w-xs">
                                    {general_settings?.store_address && (
                                        <p className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{general_settings.store_address}</span>
                                        </p>
                                    )}
                                    {general_settings?.store_phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 shrink-0" />
                                            <span>{general_settings.store_phone}</span>
                                        </p>
                                    )}
                                    {general_settings?.store_email && (
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 shrink-0" />
                                            <span>{general_settings.store_email}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Meta */}
                            <div className="flex flex-col md:items-end gap-2">
                                <h1 className="text-2xl font-light tracking-tight text-slate-900 dark:text-white uppercase mb-2">Invoice</h1>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 md:text-right">Invoice No:</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">#{invoice.uuid.split('-')[0].toUpperCase()}</span>
                                    
                                    <span className="text-slate-500 dark:text-slate-400 md:text-right">Date Issued:</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">{new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="mt-4">
                                    <Badge variant={statusVariant(invoice.status) as any} className="uppercase px-3 py-1 text-xs font-bold shadow-sm">
                                        {statusLabel(invoice.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-8 dark:bg-zinc-800" />

                        {/* Bill To Section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Billed To</h3>
                            <div className="rounded-xl bg-slate-50 dark:bg-zinc-950 p-5 border border-slate-100 dark:border-zinc-800/50">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{invoice.customer_name}</h2>
                                <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" /> {invoice.customer_email}
                                    </p>
                                    {invoice.customer_phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" /> {invoice.customer_phone}
                                        </p>
                                    )}
                                    {invoice.customer_address && (
                                        <p className="flex items-start gap-2 mt-2">
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> 
                                            <span className="leading-relaxed">{invoice.customer_address}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden mb-8">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold w-full">Item Description</th>
                                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Qty</th>
                                        <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Price</th>
                                        <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Discount</th>
                                        <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                    {items.map((it) => (
                                        <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-200">{it.name}</td>
                                            <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400">{it.quantity}</td>
                                            <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatMoney(it.price)}</td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                {Number(it.discount) > 0 ? (
                                                    <span className="text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md text-xs font-medium">
                                                        -{formatMoney(it.discount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap">{formatMoney(it.total)}</td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-slate-500" colSpan={5}>
                                                {invoice.description || 'No items listed in this invoice.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-start gap-6">
                            <div className="w-full md:w-1/2 flex-1">
                                {invoice.note && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50 flex gap-3">
                                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div className="text-sm leading-relaxed">
                                            <span className="font-semibold block mb-1">Additional Notes</span>
                                            {invoice.note}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-1/3 space-y-3 text-sm">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">{formatMoney(invoice.subtotal ?? invoice.amount)}</span>
                                </div>
                                {Number(invoice.discount) > 0 && (
                                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                        <span>Discount</span>
                                        <span className="font-medium text-red-500">-{formatMoney(invoice.discount)}</span>
                                    </div>
                                )}
                                <Separator className="my-3 dark:bg-zinc-800" />
                                <div className="flex justify-between items-center text-base">
                                    <span className="font-medium text-slate-900 dark:text-slate-200">Total</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(invoice.amount)}</span>
                                </div>
                                {Number(invoice.amount_paid) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-emerald-600 dark:text-emerald-500">Amount Paid</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-500">-{formatMoney(invoice.amount_paid)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-slate-100 dark:border-zinc-800">
                                    <span className="font-bold text-lg text-slate-900 dark:text-slate-200">Amount Due</span>
                                    <span className={`font-black text-2xl ${invoice.status === 'paid' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                        {formatMoney(invoice.due_amount)}
                                    </span>
                                </div>
                                {invoice.effective_payable_amount < invoice.due_amount && invoice.status !== 'paid' && (
                                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-slate-200 dark:border-zinc-800">
                                        <span className="font-bold text-base text-shop-primary">Payable Now</span>
                                        <span className="font-black text-xl text-shop-primary">
                                            {formatMoney(invoice.effective_payable_amount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Payment Section */}
                    <div className="bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-2 mb-1">
                                    <Receipt className="w-4 h-4 text-slate-400" />
                                    Secure Online Payment
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Powered by SSLCommerz. All transactions are encrypted and secure.
                                </p>
                                {invoice.status !== 'paid' && !isAmountFixed && (
                                    <p className="mt-1 text-xs font-medium text-shop-primary">
                                        Pay the full amount or any part of it (up to {formatMoney(maxActiveAmount)}).
                                    </p>
                                )}
                            </div>

                            {invoice.status !== 'paid' ? (
                                <form onSubmit={handlePay} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-48">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                                            {currencySymbol}
                                        </span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            max={maxActiveAmount.toFixed(2)}
                                            step="0.01"
                                            required
                                            readOnly={isAmountFixed}
                                            value={displayAmount}
                                            onChange={(e) => {
                                                setDisplayAmount(e.target.value);
                                                const num = parseFloat(e.target.value);
                                                setData('payment_amount', isNaN(num) ? 0 : num);
                                            }}
                                            className={`w-full h-11 pl-8 pr-4 rounded-lg border border-slate-300 dark:border-zinc-700 text-sm font-medium focus:ring-2 focus:ring-shop-primary/20 focus:border-shop-primary outline-none transition-all shadow-sm text-slate-700 dark:text-slate-300 ${
                                                isAmountFixed
                                                    ? 'bg-slate-50 dark:bg-zinc-800/50 cursor-not-allowed'
                                                    : 'bg-white dark:bg-zinc-900'
                                            }`}
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={processing || data.payment_amount <= 0 || data.payment_amount > ((invoice.effective_payable_amount ?? invoice.due_amount) + 1)} 
                                        size="lg" 
                                        className="w-full sm:w-auto h-11 px-8 bg-shop-primary hover:bg-shop-primary-hover text-white shadow-lg shadow-shop-primary/25 rounded-lg font-bold tracking-wide transition-all active:scale-95"
                                    >
                                        <CreditCard className="mr-2 h-5 w-5" /> 
                                        Pay Now
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Payment Completed
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
