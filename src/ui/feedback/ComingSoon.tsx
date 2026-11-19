import React from 'react';
import { Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../primitives/PageHeader';
import { StatusBadge } from '../primitives/StatusBadge';

export interface ComingSoonProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  variant?: 'portal' | 'standalone';
  className?: string;
}

/**
 * Unified ComingSoon Teaser Component
 * Container 2: UI (Feedback)
 * Serves both public landing pages (standalone card) and member portal views.
 */
export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  badge,
  showHomeButton,
  showBackButton = true,
  variant,
  className = ''
}) => {
  const navigate = useNavigate();

  // If variant is not explicitly provided, detect based on showHomeButton
  const isStandalone = variant === 'standalone' || (variant === undefined && showHomeButton === true);

  if (isStandalone) {
    return (
      <div className={`pt-24 pb-20 bg-slate-900/40 min-h-[70vh] flex items-center justify-center ${className}`}>
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border border-amber-500/20 text-brand-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h1>
          <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
            {description || 'This feature is currently under active development. Check back soon for updates.'}
          </p>
          {(showHomeButton !== false) && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-gold-500 hover:bg-brand-gold-400 text-black rounded-full font-semibold transition-colors shadow-lg shadow-brand-gold-500/20"
            >
              <ArrowLeft size={18} /> Back to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 font-sans overflow-visible pb-12 ${className}`}>
      <PageHeader
        title={title}
        subtitle={description || 'Feature modules currently in development for syndicate operations.'}
        badge={
          badge || (
            <StatusBadge variant="brand" dot>
              In Development
            </StatusBadge>
          )
        }
        actions={
          showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary !h-9 !px-3 !text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
          )
        }
      />

      <div className="p-10 sm:p-14 rounded-2xl bg-surface-card border border-border-subtle flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 flex items-center justify-center mb-5">
          <Sparkles className="w-7 h-7 text-brand-gold-400" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
          {title} is on the roadmap
        </h2>

        <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
          {description || 'We are currently building this feature. Check back soon for updates.'}
        </p>

        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="btn-primary !px-5 !py-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Previous Page</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;
