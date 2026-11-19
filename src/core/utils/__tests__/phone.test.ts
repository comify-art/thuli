import { describe, it, expect } from 'vitest';
import {
    normalizeToE164,
    normalizeWhatsAppPhone,
    isValidE164,
    formatDisplayPhone
} from '../phone';

describe('Phone Normalization Utilities', () => {
    describe('normalizeToE164', () => {
        it('preserves valid E.164 numbers', () => {
            expect(normalizeToE164('+14155552671')).toBe('+14155552671');
            expect(normalizeToE164('+919840012345')).toBe('+919840012345');
        });

        it('cleans formatted US numbers with +', () => {
            expect(normalizeToE164('+1 (415) 555-2671')).toBe('+14155552671');
            expect(normalizeToE164('+1-415-555-2671')).toBe('+14155552671');
        });

        it('cleans formatted Indian numbers with +', () => {
            expect(normalizeToE164('+91 98400 12345')).toBe('+919840012345');
            expect(normalizeToE164('+91-98400-12345')).toBe('+919840012345');
        });

        it('handles international 00 prefix', () => {
            expect(normalizeToE164('0014155552671')).toBe('+14155552671');
            expect(normalizeToE164('00919840012345')).toBe('+919840012345');
        });

        it('applies default country code for 10-digit numbers', () => {
            // Default is 91 (India)
            expect(normalizeToE164('9840012345')).toBe('+919840012345');
            // Overridden to 1 (US)
            expect(normalizeToE164('4155552671', '1')).toBe('+14155552671');
        });

        it('handles Indian mobile with leading 0 (09840012345)', () => {
            expect(normalizeToE164('09840012345')).toBe('+919840012345');
        });

        it('handles 11-digit US number without + (14155552671)', () => {
            expect(normalizeToE164('14155552671')).toBe('+14155552671');
        });

        it('handles 12-digit India number without + (919840012345)', () => {
            expect(normalizeToE164('919840012345')).toBe('+919840012345');
        });

        it('returns empty string for null, undefined, or empty string', () => {
            expect(normalizeToE164('')).toBe('');
            expect(normalizeToE164(null)).toBe('');
            expect(normalizeToE164(undefined)).toBe('');
            expect(normalizeToE164('   ')).toBe('');
        });
    });

    describe('normalizeWhatsAppPhone', () => {
        it('returns digits only without leading +', () => {
            expect(normalizeWhatsAppPhone('+1 (415) 555-2671')).toBe('14155552671');
            expect(normalizeWhatsAppPhone('+91 98400 12345')).toBe('919840012345');
            expect(normalizeWhatsAppPhone('9840012345')).toBe('919840012345');
        });

        it('returns empty string for empty input', () => {
            expect(normalizeWhatsAppPhone('')).toBe('');
            expect(normalizeWhatsAppPhone(undefined)).toBe('');
        });
    });

    describe('isValidE164', () => {
        it('validates true E.164 numbers', () => {
            expect(isValidE164('+14155552671')).toBe(true);
            expect(isValidE164('+919840012345')).toBe(true);
            expect(isValidE164('+442071838750')).toBe(true);
        });

        it('rejects invalid numbers without + or with special characters', () => {
            expect(isValidE164('14155552671')).toBe(false);
            expect(isValidE164('9840012345')).toBe(false);
            expect(isValidE164('+1 (415) 555-2671')).toBe(false);
            expect(isValidE164('')).toBe(false);
            expect(isValidE164(null)).toBe(false);
        });
    });

    describe('formatDisplayPhone', () => {
        it('formats US numbers with readable area codes', () => {
            expect(formatDisplayPhone('+14155552671')).toBe('+1 (415) 555-2671');
        });

        it('formats Indian numbers with 5-5 split', () => {
            expect(formatDisplayPhone('+919840012345')).toBe('+91 98400 12345');
        });

        it('formats UK numbers', () => {
            expect(formatDisplayPhone('+442071838750')).toBe('+44 2071 838750');
        });

        it('returns placeholder for missing phone', () => {
            expect(formatDisplayPhone('')).toBe('—');
            expect(formatDisplayPhone(null)).toBe('—');
            expect(formatDisplayPhone('N/A')).toBe('—');
        });
    });
});

