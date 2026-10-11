import { useMemo } from 'react';

/**
 * Minimal shape this hook cares about — compatible with `firebase/auth`'s
 * `User` type but without depending on it, so the hook works with any auth
 * backend a consumer plugs in. `displayName` is used by the default denial
 * UI to greet the user by name when available.
 */
export interface GateUser {
    email: string | null;
    displayName?: string | null;
}

export type GateReason = 'loading' | 'no-user' | 'not-in-allowlist' | 'allowed';

export interface AdminGate {
    allowed: boolean;
    loading: boolean;
    user: GateUser | null;
    reason: GateReason;
}

/**
 * Pure-logic admin gate. Given the current user, a loading flag, and an
 * email allowlist, returns a structured verdict. Host apps decide how to
 * render the denial (custom AccessDenied, toast, redirect, etc.).
 *
 * Emails are compared case-insensitively. Users with `email === null`
 * (e.g. phone-only accounts) never pass.
 */
export function useAdminGate(
    user: GateUser | null,
    loading: boolean,
    allowlist: string[],
): AdminGate {
    return useMemo(() => {
        if (loading) {
            return { allowed: false, loading: true, user, reason: 'loading' as const };
        }
        if (!user || !user.email) {
            return { allowed: false, loading: false, user, reason: 'no-user' as const };
        }
        const normalized = new Set(allowlist.map((e) => e.toLowerCase().trim()));
        if (!normalized.has(user.email.toLowerCase().trim())) {
            return { allowed: false, loading: false, user, reason: 'not-in-allowlist' as const };
        }
        return { allowed: true, loading: false, user, reason: 'allowed' as const };
    }, [user, loading, allowlist]);
}
