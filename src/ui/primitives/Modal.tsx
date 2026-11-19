import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  size?: ModalSize;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full m-4 h-[calc(100vh-2rem)]',
};

/**
 * Standardized Thuli Modal Primitive
 * Enforces dark-first theme tokens (bg-[var(--surface-modal)], border-[var(--border-default)], text-white).
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  icon,
  children,
  actions,
  size = 'md',
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerSubtitle = subtitle || description;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${sizeClasses[size]} bg-[var(--surface-modal)] border border-[var(--border-default)] rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-white font-sans ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border-subtle bg-white/[0.02]">
          <div className="flex items-start gap-3">
            {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {title}
              </h2>
              {headerSubtitle && (
                <p className="text-xs text-neutral-400 font-medium tracking-tight mt-1">
                  {headerSubtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-neutral-200">
          {children}
        </div>

        {/* Optional Actions Footer */}
        {actions && (
          <div className="p-4 sm:p-5 border-t border-border-subtle bg-neutral-950/40 flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
