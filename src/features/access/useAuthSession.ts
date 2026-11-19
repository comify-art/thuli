import { useState, useEffect, useCallback } from 'react';
import { sessionCookie, SESSION_COOKIE_NAME } from '../../core/utils/cookies';

export type UserRole = 'admin' | 'member' | 'associate_member' | string;

export interface MinimalAuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    getIdTokenResult?: () => Promise<{ token: string; claims: Record<string, unknown> }>;
}

export interface AuthSessionClaims {
    role?: UserRole;
    admin?: boolean;
    member?: boolean;
    [key: string]: unknown;
}

export interface AuthSessionState {
    user: MinimalAuthUser | null;
    claims: AuthSessionClaims | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasCookieSession: boolean;
    logout: () => Promise<void>;
}

export interface UseAuthSessionOptions {
    /**
     * Optional Firebase Auth instance (e.g. from firebase/auth).
     * If not provided, useAuthSession operates in cookie-only mode (ideal for landing-app).
     */
    auth?: any;
    /**
     * Optional custom cookie name (defaults to 'app_session').
     */
    cookieName?: string;
}

/**
 * Safely parses the unverified payload of a JWT for optimistic UI rendering.
 */
function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Unified authentication session hook for React frontends.
 * Synchronizes Firebase Auth state and cross-subdomain session cookies.
 */
export function useAuthSession(options: UseAuthSessionOptions = {}): AuthSessionState {
    const { auth, cookieName = SESSION_COOKIE_NAME } = options;

    const [user, setUser] = useState<MinimalAuthUser | null>(null);
    const [claims, setClaims] = useState<AuthSessionClaims | null>(null);
    const [token, setToken] = useState<string | null>(() => sessionCookie.get(cookieName));
    const [isLoading, setIsLoading] = useState<boolean>(!!auth);

    const hasCookieSession = !!token;

    // Synchronize with Firebase Auth if provided
    useEffect(() => {
        if (!auth) {
            // Cookie-only mode: inspect existing cookie
            const existingToken = sessionCookie.get(cookieName);
            if (existingToken) {
                setToken(existingToken);
                const payload = parseJwtPayload(existingToken);
                if (payload) {
                    setUser({
                        uid: (payload.user_id || payload.sub || '') as string,
                        email: (payload.email || null) as string | null,
                        displayName: (payload.name || null) as string | null,
                    });
                    setClaims(payload as AuthSessionClaims);
                }
            } else {
                setUser(null);
                setClaims(null);
                setToken(null);
            }
            setIsLoading(false);
            return;
        }

        // Firebase Auth mode
        let isMounted = true;

        const unsubscribeToken = typeof auth.onIdTokenChanged === 'function'
            ? auth.onIdTokenChanged(async (firebaseUser: any) => {
                if (!isMounted) return;

                if (firebaseUser) {
                    try {
                        const tokenResult = await firebaseUser.getIdTokenResult();
                        if (!isMounted) return;

                        const rawToken = tokenResult.token;
                        setToken(rawToken);
                        setClaims(tokenResult.claims || {});
                        sessionCookie.set(cookieName, rawToken);
                    } catch {
                        // Token fetch failed
                    }
                } else {
                    setToken(null);
                    setClaims(null);
                    sessionCookie.remove(cookieName);
                }
            })
            : undefined;

        const unsubscribeAuth = typeof auth.onAuthStateChanged === 'function'
            ? auth.onAuthStateChanged((firebaseUser: any) => {
                if (!isMounted) return;
                setUser(firebaseUser ? {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                } : null);
                setIsLoading(false);
            })
            : undefined;

        return () => {
            isMounted = false;
            if (unsubscribeToken) unsubscribeToken();
            if (unsubscribeAuth) unsubscribeAuth();
        };
    }, [auth, cookieName]);

    const logout = useCallback(async () => {
        sessionCookie.remove(cookieName);
        setToken(null);
        setUser(null);
        setClaims(null);

        if (auth && typeof auth.signOut === 'function') {
            try {
                await auth.signOut();
            } catch {
                // Ignore signOut failure
            }
        }
    }, [auth, cookieName]);

    return {
        user,
        claims,
        token,
        isAuthenticated: !!user || hasCookieSession,
        isLoading,
        hasCookieSession,
        logout,
    };
}
