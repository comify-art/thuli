import type { ElementType, ReactNode } from 'react';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  subtext?: ReactNode;
  icon?: ElementType;
  badgeColor?: 'brand' | 'brand-gold' | 'emerald' | 'blue' | 'amber';
  indicatorDot?: boolean;
  indicatorDotPulse?: boolean;
  action?: ReactNode;
  className?: string;
}

const colorMap = {
  brand: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
  'brand-gold': 'bg-brand-gold-500/10 border-brand-gold-500/20 text-brand-gold-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
};

export const KpiCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  badgeColor = 'brand',
  indicatorDot,
  indicatorDotPulse,
  action,
  className = ''
}: KpiCardProps) => {
  return (
    <div
      className={`p-3.5 sm:p-5 md:p-6 rounded-2xl md:rounded-[24px] bg-surface-panel/90 border border-border-subtle hover:border-border-default shadow-lg shadow-black/30 backdrop-blur-xl flex flex-col justify-between transition-all ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 truncate">
            {label}
          </span>
          {Icon && (
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 ${colorMap[badgeColor]}`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          )}
          {indicatorDot && (
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                indicatorDotPulse ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          )}
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
          {value}
        </div>
      </div>

      {(subtext || action) && (
        <div className="mt-0.5 sm:mt-1">
          {subtext && (
            <span className="text-[10px] sm:text-xs text-neutral-500 block truncate">
              {subtext}
            </span>
          )}
          {action}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
