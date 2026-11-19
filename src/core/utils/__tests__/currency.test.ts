import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatCompactCurrency,
    convertCurrency,
    formatBlendedTotal,
} from '../currency';

describe('Universal Currency Formatters', () => {
    describe('formatCurrency', () => {
        it('formats USD currency correctly', () => {
            expect(formatCurrency(50000, 'USD')).toBe('$50,000');
            expect(formatCurrency(0, 'USD')).toBe('$0');
            expect(formatCurrency(1234.56, 'USD', { decimals: 2 })).toBe('$1,234.56');
        });

        it('formats INR currency using Indian numbering system', () => {
            const formatted = formatCurrency(500000, 'INR');
            expect(formatted).toBe('₹5,00,000');
        });

        it('respects includeSymbol flag', () => {
            expect(formatCurrency(50000, 'USD', { includeSymbol: false })).toBe('50,000');
        });
    });

    describe('formatCompactCurrency', () => {
        it('formats international currency in K, M, B', () => {
            expect(formatCompactCurrency(500, 'USD')).toBe('$500');
            expect(formatCompactCurrency(50000, 'USD')).toBe('$50K');
            expect(formatCompactCurrency(1500000, 'USD')).toBe('$1.5M');
            expect(formatCompactCurrency(2000000, 'USD')).toBe('$2M');
            expect(formatCompactCurrency(1000000000, 'USD')).toBe('$1B');
        });

        it('formats Indian currency in Lakhs and Cr', () => {
            expect(formatCompactCurrency(50000, 'INR')).toBe('₹50,000');
            expect(formatCompactCurrency(500000, 'INR')).toBe('₹5 Lakhs');
            expect(formatCompactCurrency(2500000, 'INR')).toBe('₹25 Lakhs');
            expect(formatCompactCurrency(15000000, 'INR')).toBe('₹1.5 Cr');
            expect(formatCompactCurrency(20000000, 'INR')).toBe('₹2 Cr');
        });

        it('handles negative amounts cleanly', () => {
            expect(formatCompactCurrency(-50000, 'USD')).toBe('-$50K');
        });
    });

    describe('convertCurrency', () => {
        it('multiplies and divides according to direction', () => {
            expect(convertCurrency(500, 100, 'multiply')).toBe(50000);
            expect(convertCurrency(50000, 100, 'divide')).toBe(500);
        });

        it('handles invalid numbers safely', () => {
            expect(convertCurrency(NaN, 100)).toBe(0);
            expect(convertCurrency(500, 0, 'divide')).toBe(0);
        });
    });

    describe('formatBlendedTotal', () => {
        it('computes and formats blended USD/INR amounts', () => {
            // $100,000 USD + ₹2,000,000 INR @ 100 = $100,000 + $20,000 = $120,000
            expect(formatBlendedTotal(100000, 2000000, 100)).toBe('~$120,000');
        });
    });
});
