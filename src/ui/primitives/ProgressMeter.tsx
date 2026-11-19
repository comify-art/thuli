import React from 'react';

export type ProgressMeterColor = 'emerald' | 'gold' | 'brand' | 'blue';

export interface ProgressMeterProps {
    target: number;
    current: number;
    label?: React.ReactNode;
    unit?: string;
    percentage?: number;
    met?: boolean;
    statusText?: React.ReactNode;
    subtext?: React.ReactNode;
    color?: ProgressMeterColor;
    animated?: boolean;
    className?: string;
}

const colorBarStyles: Record<ProgressMeterColor, string> = {
    emerald: 'bg-emerald-500',
    gold: 'bg-brand-gold-500',
    brand: 'bg-brand-600',
    blue: 'bg-blue-500',
};

/**
 * Universal linear progress meter for threshold goals, funding targets,
 * and completion quotas across dark-first interfaces.
 */
export const ProgressMeter: React.FC<ProgressMeterProps> = ({
    target,
    current,
    label,
    unit = '$',
    percentage: customPercentage,
    met: customMet,
    statusText,
    subtext,
    color,
    animated = true,
    className = '',
}) => {
    const computedPercent = target > 0 ? Math.round((current / target) * 100) : 0;
    const percent = customPercentage !== undefined ? customPercentage : computedPercent;
    const isMet = customMet !== undefined ? customMet : (current >= target && target > 0);

    const activeColor = color || (isMet ? 'emerald' : 'gold');

    const formatAmount = (num: number) => {
        if (num >= 1000) {
            return `${unit}${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
        }
        return `${unit}${num.toLocaleString()}`;
    };

    return (
        <div className={`p-4 rounded-2xl bg-white/[0.02] border border-border-subtle space-y-1 ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    {label || `Goal (${formatAmount(target)})`}
                </span>
                <span className={`text-xs font-bold ${isMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {percent}% {isMet ? 'MET' : ''}
                </span>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-2 mt-2 overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div
                    className={`h-full rounded-full ${colorBarStyles[activeColor]} ${
                        animated ? 'transition-all duration-500' : ''
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                <span>
                    {statusText !== undefined
                        ? statusText
                        : isMet
                        ? 'Threshold achieved'
                        : `${formatAmount(Math.max(0, target - current))} needed`}
                </span>
                {subtext && <span>{subtext}</span>}
            </div>
        </div>
    );
};

export default ProgressMeter;
