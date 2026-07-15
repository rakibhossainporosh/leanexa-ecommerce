import { usePage } from '@inertiajs/react';

export function useCurrency() {
    const { activeCurrency, currencies } = usePage().props as any;

    const formatPrice = (amount: number | string | null | undefined) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount ?? 0;
        
        if (!activeCurrency) {
            return `${numAmount % 1 === 0 ? numAmount.toFixed(0) : numAmount.toFixed(2)}$`;
        }
        
        const defaultCurrency = currencies?.find((c: any) => c.is_default);
        const defaultRate = defaultCurrency ? (parseFloat(defaultCurrency.exchange_rate) || 1) : 1;
        const activeRate = parseFloat(activeCurrency.exchange_rate) || 1;
        
        // The price in the database is saved in the default currency
        const converted = (numAmount / defaultRate) * activeRate;
        const symbol = activeCurrency.symbol || '$';
        
        return `${converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2)}${symbol}`;
    };

    const convertToActive = (amount: number) => {
        const defaultCurrency = currencies?.find((c: any) => c.is_default);
        const defaultRate = defaultCurrency ? (parseFloat(defaultCurrency.exchange_rate) || 1) : 1;
        const activeRate = parseFloat(activeCurrency?.exchange_rate || '1');
        return (amount / defaultRate) * activeRate;
    };

    const convertToDefault = (amount: number) => {
        const defaultCurrency = currencies?.find((c: any) => c.is_default);
        const defaultRate = defaultCurrency ? (parseFloat(defaultCurrency.exchange_rate) || 1) : 1;
        const activeRate = parseFloat(activeCurrency?.exchange_rate || '1');
        return (amount / activeRate) * defaultRate;
    };

    return { formatPrice, activeCurrency, convertToActive, convertToDefault };
}
