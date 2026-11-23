import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export interface LoginCardProps {
    title?: string;
    subtitle?: string;
    onEmailSubmit?: (email: string, password: string) => Promise<void> | void;
    onGoogleSignIn?: () => Promise<void> | void;
    emailPlaceholder?: string;
    submitLabel?: string;
    googleLabel?: string;
    defaultErrorMessage?: string;
    error?: string | null;
    loading?: boolean;
    footer?: React.ReactNode;
    className?: string;
}

/**
 * Dark-first sign-in card supporting email/password and Google OAuth callbacks.
 * Keeps Firebase Auth SDK calls in the host app via `onEmailSubmit` and `onGoogleSignIn`.
 */
export const LoginCard: React.FC<LoginCardProps> = ({
    title = 'Member Login',
    subtitle,
    onEmailSubmit,
    onGoogleSignIn,
    emailPlaceholder = 'you@example.com',
    submitLabel = 'Log In',
    googleLabel = 'Sign in with Google',
    defaultErrorMessage = 'Failed to sign in. Please check your credentials.',
    error: controlledError,
    loading: controlledLoading,
    footer,
    className = '',
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [internalError, setInternalError] = useState('');
    const [internalLoading, setInternalLoading] = useState(false);

    const isLoading = controlledLoading ?? internalLoading;
    const displayError = controlledError !== undefined ? controlledError : internalError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onEmailSubmit) return;
        setInternalError('');
        setInternalLoading(true);
        try {
            await onEmailSubmit(email, password);
        } catch (err) {
            setInternalError(err instanceof Error && err.message ? err.message : defaultErrorMessage);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleGoogle = async () => {
        if (!onGoogleSignIn) return;
        setInternalError('');
        setInternalLoading(true);
        try {
            await onGoogleSignIn();
        } catch (err) {
            setInternalError(err instanceof Error && err.message ? err.message : 'Failed to sign in with Google.');
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <div className={`max-w-md w-full mx-auto ${className}`}>
            <div className="bg-[var(--surface-card)] rounded-xl p-8 shadow-sm border border-[var(--border-default)]">
                <div className="w-16 h-16 bg-amber-900/30 text-[var(--accent-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white text-center mb-2">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-slate-400 text-center mb-6">{subtitle}</p>
                )}
                {!subtitle && <div className="mb-4" />}

                {displayError && (
                    <div
                        role="alert"
                        className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm mb-6 text-center"
                    >
                        {displayError}
                    </div>
                )}

                {onEmailSubmit && (
                    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                        <div>
                            <label htmlFor="thuli-login-email" className="block text-sm font-medium text-slate-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="thuli-login-email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-input)] text-white focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                                placeholder={emailPlaceholder}
                            />
                        </div>
                        <div>
                            <label htmlFor="thuli-login-password" className="block text-sm font-medium text-slate-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="thuli-login-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-input)] text-white focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : submitLabel}
                        </button>
                    </form>
                )}

                {onGoogleSignIn && (
                    <div className={onEmailSubmit ? 'mt-4' : ''}>
                        {onEmailSubmit && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--border-default)]" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-[var(--surface-card)] text-slate-400">Or continue with</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => void handleGoogle()}
                            disabled={isLoading}
                            className="mt-4 w-full py-3 bg-[var(--surface-input)] text-slate-200 border border-[var(--border-default)] rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            {googleLabel}
                        </button>
                    </div>
                )}

                {footer && (
                    <div className="mt-6 text-center text-sm text-slate-400">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
