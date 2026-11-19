/**
 * Universal Currency & Compact Notation Utilities
 * 
 * Supports both International standard notation ($1.5M, $500K)
 * and South Asian numbering systems (₹1.5 Cr, ₹50 Lakhs) with
 * zero domain leakage.
 */

export interface CurrencyFormatOptions {
    decimals?: number;
    includeSymbol?: boolean;
    locale?: string;
}

export interface CompactCurrencyOptions {
    system?: 'auto' | 'international' | 'indian';
    decimals?: number;
}

const DEFAULT_CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    SGD: 'S$',
};

/**
 * Standardized currency formatter backed by Intl.NumberFormat.
 * 
 * @example
 * formatCurrency(50000, 'USD') // '$50,000'
 * formatCurrency(500000, 'INR') // '₹5,00,000'
 */
export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    options: CurrencyFormatOptions = {}
): string {
    const {
        decimals = 0,
        includeSymbol = true,
        locale = currency.toUpperCase() === 'INR' ? 'en-IN' : 'en-US',
    } = options;

    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const symbol = DEFAULT_CURRENCY_SYMBOLS[currency.toUpperCase()] || `${currency.toUpperCase()} `;

    try {
        const formattedNumber = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(safeAmount);

        return includeSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
    } catch {
        // Fallback if locale is unsupported in older runtime environments
        const fallbackNum = decimals > 0 ? safeAmount.toFixed(decimals) : Math.round(safeAmount).toLocaleString();
        return includeSymbol ? `${symbol}${fallbackNum}` : fallbackNum;
    }
}

/**
 * Compact currency representation supporting both international (K/M/B)
 * and Indian (Lakhs/Cr) numbering conventions.
 * 
 * @example
 * formatCompactCurrency(1500000, 'USD') // '$1.5M'
 * formatCompactCurrency(5000000, 'INR') // '₹50 Lakhs'
 * formatCompactCurrency(120000000, 'INR') // '₹12 Cr'
 */
export function formatCompactCurrency(
    amount: number,
    currency: string = 'USD',
    options: CompactCurrencyOptions = {}
): string {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const curUpper = currency.toUpperCase();
    const symbol = DEFAULT_CURRENCY_SYMBOLS[curUpper] || `${curUpper} `;
    const system = options.system || (curUpper === 'INR' ? 'indian' : 'international');

    if (system === 'indian') {
        const absVal = Math.abs(safeAmount);
        const sign = safeAmount < 0 ? '-' : '';

        // >= 1 Crore (10,000,000)
        if (absVal >= 10000000) {
            const cr = absVal / 10000000;
            const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(options.decimals ?? 1);
            return `${sign}${symbol}${formatted} Cr`;
        }

        // >= 1 Lakh (100,000)
        if (absVal >= 100000) {
            const lakhs = absVal / 100000;
            const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(options.decimals ?? 1);
            return `${sign}${symbol}${formatted} Lakhs`;
        }

        // Standard under 1 Lakh
        return `${sign}${formatCurrency(absVal, curUpper)}`;
    }

    // International System (K, M, B)
    const absVal = Math.abs(safeAmount);
    const sign = safeAmount < 0 ? '-' : '';

    if (absVal >= 1000000000) {
        const b = absVal / 1000000000;
        const formatted = b % 1 === 0 ? b.toFixed(0) : b.toFixed(options.decimals ?? 1);
        return `${sign}${symbol}${formatted}B`;
    }

    if (absVal >= 1000000) {
        const m = absVal / 1000000;
        const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(options.decimals ?? 1);
        return `${sign}${symbol}${formatted}M`;
    }

    if (absVal >= 1000) {
        const k = absVal / 1000;
        const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(options.decimals ?? 1);
        return `${sign}${symbol}${formatted}K`;
    }

    return `${sign}${formatCurrency(absVal, curUpper)}`;
}

/**
 * Currency conversion helper.
 */
export function convertCurrency(
    amount: number,
    rate: number,
    direction: 'multiply' | 'divide' = 'multiply'
): number {
    if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate === 0) return 0;
    return direction === 'multiply' ? amount * rate : amount / rate;
}

/**
 * Calculates and formats a blended total across two currencies (e.g. USD primary, INR secondary).
 * 
 * @example
 * formatBlendedTotal(100000, 2000000, 100) // '~120,000'
 */
export function formatBlendedTotal(
    primaryAmount: number,
    secondaryAmount: number,
    rate: number = 100,
    primaryCurrency: string = 'USD'
): string {
    const convertedSecondary = convertCurrency(secondaryAmount, rate, 'divide');
    const total = Math.round(primaryAmount + convertedSecondary);
    return `~${formatCurrency(total, primaryCurrency)}`;
}
