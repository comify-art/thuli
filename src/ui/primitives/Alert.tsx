import React from 'react';
import {
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Info,
    Shield,
    X
} from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info' | 'neutral';

export interface AlertProps {
    variant?: AlertVariant;
    title?: React.ReactNode;
    children: React.ReactNode;
    icon?: React.ReactNode;
    onDismiss?: () => void;
    action?: React.ReactNode;
    className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; text: string; iconColor: string; defaultIcon: typeof AlertCircle }> = {
    error: {
        container: 'bg-red-500/10 border-red-500/20 text-red-300',
        text: 'text-red-200/90',
        iconColor: 'text-red-400',
        defaultIcon: AlertCircle,
    },
    success: {
        container: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
        text: 'text-emerald-200/90',
        iconColor: 'text-emerald-400',
        defaultIcon: CheckCircle2,
    },
    warning: {
        container: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
        text: 'text-amber-200/90',
        iconColor: 'text-amber-400',
        defaultIcon: AlertTriangle,
    },
    info: {
        container: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
        text: 'text-blue-200/90',
        iconColor: 'text-blue-400',
        defaultIcon: Info,
    },
    neutral: {
        container: 'bg-white/[0.04] border-white/10 text-neutral-300',
        text: 'text-neutral-400',
        iconColor: 'text-neutral-400',
        defaultIcon: Shield,
    },
};

/**
 * Canonical Alert & Banner component for actionable notices, validation errors,
 * and operational status updates across dark-first interfaces.
 */
export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    icon,
    onDismiss,
    action,
    className = '',
}) => {
    const config = variantStyles[variant];
    const DefaultIconComponent = config.defaultIcon;

    return (
        <div
            role="alert"
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 transition-colors ${config.container} ${className}`}
        >
            <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
                {icon !== undefined ? icon : <DefaultIconComponent className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>

            <div className="flex-1 min-w-0 text-xs sm:text-sm">
                {title && (
                    <div className="font-semibold text-white tracking-tight mb-0.5">
                        {title}
                    </div>
                )}
                <div className={`leading-relaxed ${config.text}`}>
                    {children}
                </div>
            </div>

            {action && (
                <div className="shrink-0 self-center">
                    {action}
                </div>
            )}

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss alert"
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer -mr-1 -mt-1"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
