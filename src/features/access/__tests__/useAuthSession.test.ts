import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthSession } from '../useAuthSession';
import { sessionCookie, SESSION_COOKIE_NAME } from '../../../core/utils/cookies';

describe('useAuthSession hook', () => {
    let mockCookies = '';

    beforeEach(() => {
        mockCookies = '';
        Object.defineProperty(document, 'cookie', {
            get: () => mockCookies,
            set: (val: string) => {
                const [keyVal] = val.split(';');
                const [key] = keyVal.split('=');
                const parts = mockCookies.split('; ').filter((p) => p && !p.startsWith(`${key}=`));
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

    describe('Cookie-Only Mode (e.g. Landing App)', () => {
        it('returns unauthenticated state when no cookie is set', () => {
            const { result } = renderHook(() => useAuthSession());

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.hasCookieSession).toBe(false);
            expect(result.current.user).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });

        it('detects active cookie and sets authenticated state', () => {
            // Fake JWT: header.payload.signature
            // Payload: { "sub": "uid123", "email": "alex@example.com", "name": "Alex", "role": "member" }
            const fakePayload = btoa(JSON.stringify({
                sub: 'uid123',
                email: 'alex@example.com',
                name: 'Alex',
                role: 'member',
            }));
            const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${fakePayload}.mockSignature`;

            sessionCookie.set(SESSION_COOKIE_NAME, fakeJwt);

            const { result } = renderHook(() => useAuthSession());

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.hasCookieSession).toBe(true);
            expect(result.current.token).toBe(fakeJwt);
            expect(result.current.user?.email).toBe('alex@example.com');
            expect(result.current.user?.displayName).toBe('Alex');
            expect(result.current.claims?.role).toBe('member');
        });

        it('clears session on logout()', async () => {
            sessionCookie.set(SESSION_COOKIE_NAME, 'sample-token');
            const { result } = renderHook(() => useAuthSession());

            expect(result.current.isAuthenticated).toBe(true);

            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.token).toBeNull();
            expect(sessionCookie.get(SESSION_COOKIE_NAME)).toBeNull();
        });
    });

    describe('Firebase Auth Mode (e.g. Members App)', () => {
        it('synchronizes onIdTokenChanged and updates cookie', async () => {
            let tokenCallback: (user: any) => void = () => {};
            let authCallback: (user: any) => void = () => {};

            const mockAuth = {
                onIdTokenChanged: vi.fn((cb) => {
                    tokenCallback = cb;
                    return vi.fn();
                }),
                onAuthStateChanged: vi.fn((cb) => {
                    authCallback = cb;
                    return vi.fn();
                }),
                signOut: vi.fn().mockResolvedValue(undefined),
            };

            const { result } = renderHook(() => useAuthSession({ auth: mockAuth }));

            expect(mockAuth.onIdTokenChanged).toHaveBeenCalled();
            expect(mockAuth.onAuthStateChanged).toHaveBeenCalled();

            // Simulate user sign-in
            const fakeUser = {
                uid: 'user_456',
                email: 'founder@example.com',
                displayName: 'Founder',
                getIdTokenResult: vi.fn().mockResolvedValue({
                    token: 'fresh-id-token-xyz',
                    claims: { role: 'member', admin: false },
                }),
            };

            await act(async () => {
                await tokenCallback(fakeUser);
                authCallback(fakeUser);
            });

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user?.uid).toBe('user_456');
            expect(result.current.token).toBe('fresh-id-token-xyz');
            expect(result.current.claims?.role).toBe('member');
            expect(sessionCookie.get(SESSION_COOKIE_NAME)).toBe('fresh-id-token-xyz');

            // Simulate logout
            await act(async () => {
                await result.current.logout();
            });

            expect(mockAuth.signOut).toHaveBeenCalled();
            expect(result.current.isAuthenticated).toBe(false);
            expect(sessionCookie.get(SESSION_COOKIE_NAME)).toBeNull();
        });
    });
});
