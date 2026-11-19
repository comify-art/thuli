/**
 * Domain-Agnostic Cookie & Session Management Utilities.
 */

export const SESSION_COOKIE_NAME = 'app_session';
export const DEFAULT_SESSION_EXPIRY_DAYS = 7;

export interface CookieOptions {
    days?: number;
    path?: string;
    domain?: string;
    rootDomain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Calculates the effective cookie domain based on the active browser hostname.
 * - In local dev (localhost / 127.0.0.1): returns undefined to prevent browser rejection.
 * - When `rootDomain` is provided and `hostname` ends with it: returns `.${rootDomain}` for cross-subdomain sharing.
 */
export function getEffectiveCookieDomain(hostname?: string, rootDomain?: string): string | undefined {
    if (typeof window === 'undefined' && !hostname) {
        return undefined;
    }

    const host = hostname || window.location.hostname;

    if (!host || host === 'localhost' || host === '127.0.0.1') {
        return undefined;
    }

    if (rootDomain && (host === rootDomain || host.endsWith(`.${rootDomain}`))) {
        return `.${rootDomain}`;
    }

    return undefined;
}

/**
 * Core cookie operations with configurable cross-subdomain defaults.
 */
export const sessionCookie = {
    /**
     * Retrieves a cookie value by name.
     */
    get(name: string = SESSION_COOKIE_NAME): string | null {
        if (typeof document === 'undefined') {
            return null;
        }

        const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
    },

    /**
     * Sets a cookie with security and domain defaults.
     */
    set(name: string = SESSION_COOKIE_NAME, value: string, options: CookieOptions = {}): void {
        if (typeof document === 'undefined') {
            return;
        }

        const days = options.days ?? DEFAULT_SESSION_EXPIRY_DAYS;
        const path = options.path ?? '/';
        const domain = options.domain !== undefined ? options.domain : getEffectiveCookieDomain(undefined, options.rootDomain);
        const secure = options.secure ?? (typeof window !== 'undefined' && window.location.protocol === 'https:');
        const sameSite = options.sameSite ?? (domain ? 'lax' : 'strict');

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            cookieString += `; expires=${date.toUTCString()}`;
        }

        if (domain) {
            cookieString += `; domain=${domain}`;
        }

        if (secure) {
            cookieString += '; secure';
        }

        cookieString += `; samesite=${sameSite}`;

        document.cookie = cookieString;
    },

    /**
     * Removes a cookie across all effective domains and paths.
     */
    remove(name: string = SESSION_COOKIE_NAME, options: CookieOptions = {}): void {
        if (typeof document === 'undefined') {
            return;
        }

        const domain = options.domain !== undefined ? options.domain : getEffectiveCookieDomain(undefined, options.rootDomain);
        const path = options.path ?? '/';

        let deleteString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

        if (domain) {
            deleteString += `; domain=${domain}`;
        }

        document.cookie = deleteString;
    },

    /**
     * Convenience method checking whether an active session cookie exists.
     */
    hasActiveSession(name: string = SESSION_COOKIE_NAME): boolean {
        return !!this.get(name);
    },
};
