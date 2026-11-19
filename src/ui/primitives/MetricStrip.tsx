import React from 'react';

export type MetricItemColor = 'default' | 'amber' | 'emerald' | 'blue' | 'rose' | 'gold';

export interface MetricStripItem {
    id?: string;
    label: React.ReactNode;
    value: React.ReactNode;
    subtext?: React.ReactNode;
    color?: MetricItemColor;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface MetricStripProps {
    items: MetricStripItem[];
    divider?: React.ReactNode;
    className?: string;
}

const colorValueStyles: Record<MetricItemColor, string> = {
    default: 'text-white',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    blue: 'text-blue-300',
    rose: 'text-rose-300',
    gold: 'text-brand-gold-300',
};

const colorLabelStyles: Record<MetricItemColor, string> = {
    default: 'text-neutral-400',
    amber: 'text-amber-400/90',
    emerald: 'text-emerald-400/90',
    blue: 'text-blue-400/90',
    rose: 'text-rose-400/90',
    gold: 'text-brand-gold-400/90',
};

/**
 * Compact, low-profile horizontal metric row for high-density administrative
 * tables and deal console status headers.
 */
export const MetricStrip: React.FC<MetricStripProps> = ({
    items,
    divider = '•',
    className = '',
}) => {
    return (
        <div
            className={`px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-border-subtle flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm ${className}`}
        >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {items.map((item, index) => {
                    const color = item.color || 'default';
                    const Icon = item.icon;

                    return (
                        <React.Fragment key={item.id || index}>
                            {index > 0 && divider && (
                                <span className="text-white/20 hidden sm:inline select-none" aria-hidden="true">
                                    {divider}
                                </span>
                            )}
                            <div className="flex items-baseline gap-1.5 min-w-fit">
                                {Icon && <Icon className="w-3.5 h-3.5 self-center text-neutral-400 shrink-0" />}
                                <span className={`text-xs font-semibold uppercase tracking-wider ${colorLabelStyles[color]}`}>
                                    {item.label}:
                                </span>
                                <span className={`font-bold text-base sm:text-lg tracking-tight ${colorValueStyles[color]}`}>
                                    {item.value}
                                </span>
                                {item.subtext && (
                                    <span className="text-xs text-neutral-400 font-normal">
                                        {item.subtext}
                                    </span>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default MetricStrip;
