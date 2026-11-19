import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    sessionCookie,
    getEffectiveCookieDomain,
    SESSION_COOKIE_NAME,
    DEFAULT_SESSION_EXPIRY_DAYS,
} from '../cookies';

describe('cookies utility', () => {
    let mockCookies = '';

    beforeEach(() => {
        mockCookies = '';
        Object.defineProperty(document, 'cookie', {
            get: () => mockCookies,
            set: (val: string) => {
                const [keyVal] = val.split(';');
                const [key] = keyVal.split('=');
                // Remove existing if present
                const parts = mockCookies.split('; ').filter(p => p && !p.startsWith(`${key}=`));
                if (!val.includes('expires=Thu, 01 Jan 1970')) {
                    parts.push(keyVal.trim());
                }
                mockCookies = parts.join('; ');
            },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getEffectiveCookieDomain', () => {
        it('returns undefined for localhost', () => {
            expect(getEffectiveCookieDomain('localhost')).toBeUndefined();
            expect(getEffectiveCookieDomain('127.0.0.1')).toBeUndefined();
        });

        it('returns .example.com when rootDomain is provided', () => {
            expect(getEffectiveCookieDomain('example.com', 'example.com')).toBe('.example.com');
            expect(getEffectiveCookieDomain('portal.example.com', 'example.com')).toBe('.example.com');
            expect(getEffectiveCookieDomain('staging.portal.example.com', 'example.com')).toBe('.example.com');
        });

        it('returns undefined for other domains', () => {
            expect(getEffectiveCookieDomain('example.com')).toBeUndefined();
        });
    });

    describe('sessionCookie operations', () => {
        it('sets and gets cookie value correctly', () => {
            sessionCookie.set('test_token', 'abc123xyz');
            expect(sessionCookie.get('test_token')).toBe('abc123xyz');
        });

        it('defaults to SESSION_COOKIE_NAME when name omitted', () => {
            sessionCookie.set(undefined, 'my-session-jwt');
            expect(sessionCookie.get()).toBe('my-session-jwt');
            expect(sessionCookie.get(SESSION_COOKIE_NAME)).toBe('my-session-jwt');
        });

        it('removes cookie correctly', () => {
            sessionCookie.set('temp_cookie', 'will_delete');
            expect(sessionCookie.get('temp_cookie')).toBe('will_delete');

            sessionCookie.remove('temp_cookie');
            expect(sessionCookie.get('temp_cookie')).toBeNull();
        });

        it('hasActiveSession reports true when app_session exists', () => {
            expect(sessionCookie.hasActiveSession()).toBe(false);
            sessionCookie.set(SESSION_COOKIE_NAME, 'valid-token');
            expect(sessionCookie.hasActiveSession()).toBe(true);
            sessionCookie.remove(SESSION_COOKIE_NAME);
            expect(sessionCookie.hasActiveSession()).toBe(false);
        });

        it('handles URL-encoded cookie names and values', () => {
            sessionCookie.set('user email', 'user+test@example.com');
            expect(sessionCookie.get('user email')).toBe('user+test@example.com');
        });
    });
});
