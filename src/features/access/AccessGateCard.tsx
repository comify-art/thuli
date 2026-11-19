import React from 'react';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export type AccessGateVariant = 'gold' | 'brand' | 'neutral' | 'danger' | 'info';

export interface AccessGateAction {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    external?: boolean;
}

export interface AccessGateMetadata {
    label: string;
    value: string;
}

export interface AccessGateCardProps {
    title?: string;
    subtitle?: React.ReactNode;
    message?: React.ReactNode;
    badgeLabel?: string;
    badgeSubtext?: React.ReactNode;
    icon?: React.ReactNode;
    metadata?: AccessGateMetadata[];
    primaryAction?: AccessGateAction;
    secondaryAction?: AccessGateAction;
    variant?: AccessGateVariant;
    role?: string;
    className?: string;
    children?: React.ReactNode;
}

const variantStyles: Record<
    AccessGateVariant,
    {
        border: string;
        bg: string;
        glow: string;
        badgeBg: string;
        badgeBorder: string;
        badgeText: string;
        iconBg: string;
        iconBorder: string;
        iconText: string;
        subtitleText: string;
        primaryBtn: string;
    }
> = {
    gold: {
        border: 'border-brand-gold-500/20',
        bg: 'bg-brand-950/40',
        glow: 'bg-brand-gold-500/10',
        badgeBg: 'bg-brand-gold-500/15',
        badgeBorder: 'border-brand-gold-500/30',
        badgeText: 'text-brand-gold-300',
        iconBg: 'bg-brand-gold-500/10',
        iconBorder: 'border-brand-gold-500/30',
        iconText: 'text-brand-gold-400',
        subtitleText: 'text-brand-gold-200',
        primaryBtn: 'bg-brand-gold-500 hover:bg-brand-gold-400 text-neutral-950 shadow-brand-gold-500/20',
    },
    brand: {
        border: 'border-brand-500/20',
        bg: 'bg-brand-950/40',
        glow: 'bg-brand-500/10',
        badgeBg: 'bg-brand-500/15',
        badgeBorder: 'border-brand-500/30',
        badgeText: 'text-brand-300',
        iconBg: 'bg-brand-500/10',
        iconBorder: 'border-brand-500/30',
        iconText: 'text-brand-400',
        subtitleText: 'text-brand-200',
        primaryBtn: 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20',
    },
    neutral: {
        border: 'border-neutral-800',
        bg: 'bg-neutral-900/60',
        glow: 'bg-neutral-700/10',
        badgeBg: 'bg-white/5',
        badgeBorder: 'border-white/10',
        badgeText: 'text-neutral-300',
        iconBg: 'bg-white/5',
        iconBorder: 'border-white/10',
        iconText: 'text-neutral-400',
        subtitleText: 'text-neutral-300',
        primaryBtn: 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-neutral-900/20',
    },
    danger: {
        border: 'border-rose-500/20',
        bg: 'bg-rose-950/40',
        glow: 'bg-rose-500/10',
        badgeBg: 'bg-rose-500/15',
        badgeBorder: 'border-rose-500/30',
        badgeText: 'text-rose-300',
        iconBg: 'bg-rose-500/10',
        iconBorder: 'border-rose-500/30',
        iconText: 'text-rose-400',
        subtitleText: 'text-rose-200',
        primaryBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
    },
    info: {
        border: 'border-blue-500/20',
        bg: 'bg-blue-950/40',
        glow: 'bg-blue-500/10',
        badgeBg: 'bg-blue-500/15',
        badgeBorder: 'border-blue-500/30',
        badgeText: 'text-blue-300',
        iconBg: 'bg-blue-500/10',
        iconBorder: 'border-blue-500/30',
        iconText: 'text-blue-400',
        subtitleText: 'text-blue-200',
        primaryBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    },
};

/**
 * Universal turnkey role-gated access boundary card with lock/shield iconography,
 * metadata chips, and configurable primary and secondary action CTAs.
 */
export const AccessGateCard: React.FC<AccessGateCardProps> = ({
    title = 'Restricted Content',
    subtitle,
    message = 'This information is restricted to authorized members.',
    badgeLabel = 'Confidential',
    badgeSubtext,
    icon,
    metadata,
    primaryAction,
    secondaryAction,
    variant = 'gold',
    role = 'alert',
    className = '',
    children,
}) => {
    const v = variantStyles[variant] || variantStyles.gold;

    const renderAction = (action: AccessGateAction, isPrimary: boolean) => {
        const defaultIcon = isPrimary ? (
            <ArrowRight className="w-3.5 h-3.5" />
        ) : null;
        const actionIcon = action.icon !== undefined ? action.icon : defaultIcon;

        const baseClass = isPrimary
            ? `px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-md ${v.primaryBtn}`
            : 'px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors';

        if (action.onClick) {
            return (
                <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={`${baseClass} cursor-pointer`}
                >
                    <span>{action.label}</span>
                    {actionIcon}
                </button>
            );
        }

        if (action.href) {
            return (
                <a
                    key={action.label}
                    href={action.href}
                    target={action.external !== false ? '_blank' : undefined}
                    rel={action.external !== false ? 'noopener noreferrer' : undefined}
                    className={baseClass}
                >
                    <span>{action.label}</span>
                    {actionIcon}
                </a>
            );
        }

        return null;
    };

    return (
        <div
            role={role}
            aria-label={title}
            className={`relative overflow-hidden rounded-2xl border ${v.border} ${v.bg} p-5 sm:p-6 backdrop-blur-md shadow-xl text-neutral-200 ${className}`}
        >
            {/* Ambient background glow */}
            <div
                className={`absolute -top-16 -right-16 w-40 h-40 ${v.glow} rounded-full blur-3xl pointer-events-none`}
            />

            <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Shield Icon container */}
                <div
                    className={`shrink-0 w-12 h-12 rounded-xl ${v.iconBg} border ${v.iconBorder} flex items-center justify-center ${v.iconText} shadow-inner`}
                >
                    {icon || <Lock className="w-6 h-6" />}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {badgeLabel && (
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${v.badgeBg} border ${v.badgeBorder} ${v.badgeText}`}
                            >
                                <ShieldCheck className="w-3 h-3" />
                                {badgeLabel}
                            </span>
                        )}
                        {badgeSubtext && (
                            <span className="text-xs text-neutral-400">
                                {badgeSubtext}
                            </span>
                        )}
                        {metadata &&
                            metadata.map((item) => (
                                <span
                                    key={item.label}
                                    className="text-xs text-neutral-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5"
                                >
                                    <span className="text-neutral-500 mr-1">{item.label}:</span>
                                    {item.value}
                                </span>
                            ))}
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-wide">
                        {title}
                    </h3>

                    {subtitle && (
                        <p className={`text-xs sm:text-sm font-medium ${v.subtitleText}`}>
                            {subtitle}
                        </p>
                    )}

                    {typeof message === 'string' ? (
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                            {message}
                        </p>
                    ) : (
                        message
                    )}

                    {children}

                    {/* Action buttons */}
                    {(primaryAction || secondaryAction) && (
                        <div className="pt-3 flex flex-wrap items-center gap-3">
                            {primaryAction && renderAction(primaryAction, true)}
                            {secondaryAction && renderAction(secondaryAction, false)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RestrictedNotice = AccessGateCard;

export default AccessGateCard;
