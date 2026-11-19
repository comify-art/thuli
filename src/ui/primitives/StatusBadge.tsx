import React from 'react';
import type { ReactNode } from 'react';

export type SemanticBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'primary';

export type LiteralBadgeVariant =
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'rose'
  | 'neutral'
  | 'brand';

export type BadgeVariant = LiteralBadgeVariant | SemanticBadgeVariant;

export interface StatusBadgeProps {
  variant?: BadgeVariant;
  label?: ReactNode;
  children?: ReactNode;
  dot?: boolean;
  dotPulse?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

const variantStyles: Record<LiteralBadgeVariant, { container: string; dot: string }> = {
  emerald: {
    container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  amber: {
    container: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  blue: {
    container: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  purple: {
    container: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
  },
  rose: {
    container: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
  },
  neutral: {
    container: 'bg-white/5 text-neutral-300 border-white/10',
    dot: 'bg-neutral-400',
  },
  brand: {
    container: 'bg-brand-500/10 text-brand-gold-400 border-brand-500/20',
    dot: 'bg-brand-gold-400',
  },
};

const variantAliases: Record<SemanticBadgeVariant, LiteralBadgeVariant> = {
  success: 'emerald',
  warning: 'amber',
  danger: 'rose',
  error: 'rose',
  info: 'blue',
  primary: 'brand',
};

/**
 * Standardized status badge / pill component.
 * Ensures consistent semantic intent colors, contrast, typography, and borders across the platform.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  label,
  children,
  dot = false,
  dotPulse = false,
  size = 'xs',
  className = '',
}) => {
  const resolvedKey: LiteralBadgeVariant =
    (variantAliases as Record<string, LiteralBadgeVariant>)[variant] ||
    (variant as LiteralBadgeVariant);
  const styles = variantStyles[resolvedKey] || variantStyles.neutral;
  const content = label !== undefined ? label : children;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-2'
      : 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border tracking-wide whitespace-nowrap ${styles.container} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${
            dotPulse ? 'animate-pulse' : ''
          } shrink-0`}
        />
      )}
      {content}
    </span>
  );
};

/**
 * Helper to determine badge variant based on standard status or deal stage string.
 */
export function getStatusBadgeVariant(status?: string): BadgeVariant {
  if (!status) return 'neutral';
  const s = status.toLowerCase().replace(/[-_\s]/g, '');

  // Completed / Active / Closed deal / Signed / Sideloaded
  if (
    [
      'active',
      'approved',
      'paid',
      'completed',
      'scheduled',
      'live',
      'closed',
      'signed',
      'sideloaded',
      'verified',
    ].includes(s)
  ) {
    return 'emerald';
  }
  // Pending / Registration / Syndicate Open / Staged / Prep
  if (
    [
      'pending',
      'pendingpayment',
      'registered',
      'invited',
      'syndicateopen',
      'staged',
      'prep',
      'inprep',
    ].includes(s)
  ) {
    return 'amber';
  }
  // Suspended / Cancelled / Inactive / Declined / Rejected / Failed
  if (
    [
      'suspended',
      'rejected',
      'cancelled',
      'inactive',
      'failed',
      'declined',
    ].includes(s)
  ) {
    return 'rose';
  }
  // In Review / Due Diligence / Open for Commit / Pitch Invited
  if (
    [
      'inreview',
      'openforcommit',
      'processing',
      'duediligence',
      'pitchinvited',
    ].includes(s)
  ) {
    return 'blue';
  }
  // Leadership / Admin
  if (['admin', 'director', 'lead'].includes(s)) {
    return 'purple';
  }
  // Submitted / Applied / Active Founder
  if (['submitted', 'applied', 'new'].includes(s)) {
    return 'brand';
  }
  return 'neutral';
}

export default StatusBadge;
