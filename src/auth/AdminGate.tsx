import { ReactNode } from 'react';
import { Lock, Loader2, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminGate, type GateUser } from './useAdminGate';

interface AdminGateProps {
    user: GateUser | null;
    loading: boolean;
    allowlist: string[];
    children: ReactNode;
    /**
     * Override the default access-denied UI. Receives the reason so the host
     * can tailor the message (e.g. "please sign in" vs "your account isn't
     * authorized").
     */
    deniedFallback?: (reason: 'no-user' | 'not-in-allowlist') => ReactNode;
    loadingFallback?: ReactNode;
    /**
     * Optional sign-out handler. When provided, the default denial UI shows
     * a "Sign out and try another account" button — important when a signed-in
     * user lands here but isn't on the allowlist (otherwise they're stuck).
     */
    onSignOut?: () => void | Promise<void>;
    /**
     * Where to send unauthenticated users. Default: /login.
     */
    loginPath?: string;
}

/**
 * Belt-and-braces admin gate wrapper. Use *inside* a protected route so the
 * component refuses to render even if the route config drifts. Composes
 * with `useAdminGate` — see [useAdminGate.ts](./useAdminGate.ts).
 */
export const AdminGate: React.FC<AdminGateProps> = ({
    user,
    loading,
    allowlist,
    children,
    deniedFallback,
    loadingFallback,
    onSignOut,
    loginPath = '/login',
}) => {
    const gate = useAdminGate(user, loading, allowlist);

    if (gate.loading) {
        return (
            <>
                {loadingFallback ?? (
                    <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                )}
            </>
        );
    }

    if (!gate.allowed) {
        const reason = gate.reason === 'no-user' ? 'no-user' : 'not-in-allowlist';
        if (deniedFallback) return <>{deniedFallback(reason)}</>;
        const firstName = friendlyFirstName(user);
        return (
            <div className="flex items-center justify-center min-h-[70vh] px-6">
                <div className="max-w-md w-full text-center bg-white/80 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm px-8 py-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        {reason === 'no-user' ? 'This area is for site admins' : `Sorry, ${firstName} — this account isn’t on the admin list`}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-6">
                        {reason === 'no-user'
                            ? 'Sign in with an authorized account to manage blog posts, media, and other admin tools.'
                            : 'You’re signed in, but this email isn’t one of the allowed admin accounts. You can sign out and try a different one, or head back to the public site.'}
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {reason === 'no-user' ? (
                            <Link
                                to={loginPath}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                            >
                                <LogIn className="w-4 h-4" /> Sign in
                            </Link>
                        ) : null}
                        {onSignOut ? (
                            <button
                                onClick={() => { void onSignOut(); }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                {reason === 'no-user' ? 'Sign out' : 'Try a different account'}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

/**
 * Best-effort first name for the denial copy. Prefers Firebase's
 * `displayName`, falls back to the local part of the email, then to
 * "there" so the sentence still reads naturally.
 */
function friendlyFirstName(user: GateUser | null): string {
    const display = user?.displayName?.trim();
    if (display) return display.split(/\s+/)[0];
    const email = user?.email;
    if (email) return email.split('@')[0];
    return 'there';
}
