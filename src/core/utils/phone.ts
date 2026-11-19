/**
 * Phone number normalization utilities for E.164 and WhatsApp intents.
 * ITU-T E.164 Standard: +<country_code><subscriber_number> (max 15 digits).
 */

/**
 * Normalizes phone numbers to standard E.164 format with leading '+'
 * e.g.:
 *  - "+1 (415) 555-2671" -> "+14155552671"
 *  - "+91 98400 12345"   -> "+919840012345"
 *  - "0014155552671"     -> "+14155552671"
 *  - "9840012345" (10d)  -> "+919840012345" (with default country code)
 */
export function normalizeToE164(
    phone?: string | null,
    defaultCountryCode: string = '91'
): string {
    if (!phone) return '';
    const trimmed = String(phone).trim();
    if (!trimmed) return '';

    // Check if it already has an explicit international indicator
    const hasPlus = trimmed.startsWith('+');
    const hasDoubleZero = trimmed.startsWith('00');

    // Extract digits only
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';

    if (hasPlus) {
        return `+${digits}`;
    }

    if (hasDoubleZero) {
        return `+${digits.replace(/^00/, '')}`;
    }

    // Common Indian mobile format with leading 0 (e.g. 09840012345)
    if (digits.length === 11 && digits.startsWith('0')) {
        return `+${defaultCountryCode}${digits.slice(1)}`;
    }

    // 10 digits without country code (e.g. 9840012345 or 4155552671)
    if (digits.length === 10) {
        return `+${defaultCountryCode}${digits}`;
    }

    // 11 digits starting with 1 (US number without +)
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }

    // 12 digits starting with 91 (India number without +)
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }

    // Fallback: prefix with +
    return `+${digits}`;
}

/**
 * Normalizes phone numbers to clean E.164 digits without '+' specifically for WhatsApp wa.me/ intents.
 * e.g. "+1 (415) 555-2671" -> "14155552671"
 *      "+91 98400 12345"   -> "919840012345"
 */
export function normalizeWhatsAppPhone(
    phone?: string | null,
    defaultCountryCode: string = '91'
): string {
    const e164 = normalizeToE164(phone, defaultCountryCode);
    return e164.replace(/\D/g, '');
}

/**
 * Validates whether a phone number strictly matches the E.164 specification.
 * Minimum 7 digits (small nations) up to 15 digits total, starting with '+[1-9]'.
 */
export function isValidE164(phone?: string | null): boolean {
    if (!phone) return false;
    return /^\+[1-9]\d{6,14}$/.test(phone.trim());
}

/**
 * Formats a phone number for clean human presentation in tables and profile drawers.
 * e.g. "+14155552671" -> "+1 (415) 555-2671"
 *      "+919840012345" -> "+91 98400 12345"
 */
export function formatDisplayPhone(phone?: string | null): string {
    if (!phone) return '—';
    const trimmed = phone.trim();
    if (!trimmed || trimmed === 'N/A') return '—';

    const e164 = normalizeToE164(trimmed);
    if (!e164) return trimmed;

    // US/Canada: +1 followed by 10 digits
    if (/^\+1\d{10}$/.test(e164)) {
        const area = e164.slice(2, 5);
        const prefix = e164.slice(5, 8);
        const line = e164.slice(8, 12);
        return `+1 (${area}) ${prefix}-${line}`;
    }

    // India: +91 followed by 10 digits (split 5 and 5)
    if (/^\+91\d{10}$/.test(e164)) {
        const p1 = e164.slice(3, 8);
        const p2 = e164.slice(8, 13);
        return `+91 ${p1} ${p2}`;
    }

    // UK: +44 followed by 10 digits
    if (/^\+44\d{10}$/.test(e164)) {
        const p1 = e164.slice(3, 7);
        const p2 = e164.slice(7, 13);
        return `+44 ${p1} ${p2}`;
    }

    // Generic international display
    return e164;
}

