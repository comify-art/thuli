import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type DrawerPosition = 'right' | 'left';

export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    headerExtra?: React.ReactNode;
    footer?: React.ReactNode;
    position?: DrawerPosition;
    size?: DrawerSize;
    closeOnEsc?: boolean;
    closeOnBackdropClick?: boolean;
    className?: string;
    children: React.ReactNode;
}

const sizeClasses: Record<DrawerSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-full',
};

/**
 * Canonical slide-over Drawer component for deep item inspections,
 * administrative consoles, and extended detail views.
 */
export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    headerExtra,
    footer,
    position = 'right',
    size = 'md',
    closeOnEsc = true,
    closeOnBackdropClick = true,
    className = '',
    children,
}) => {
    // ESC key listener
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

    // Body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const isRight = position === 'right';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            className="fixed inset-0 z-50 flex overflow-hidden"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={closeOnBackdropClick ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Slide-over panel container */}
            <div
                className={`fixed inset-y-0 ${isRight ? 'right-0' : 'left-0'} flex max-w-full pointer-events-none z-10`}
            >
                <div
                    className={`w-screen ${sizeClasses[size]} pointer-events-auto bg-surface-card border-${isRight ? 'l' : 'r'} border-border-default shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 animate-in ${
                        isRight ? 'slide-in-from-right' : 'slide-in-from-left'
                    } ${className}`}
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-card/95 backdrop-blur-sm">
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                            {icon && (
                                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-border-subtle flex items-center justify-center shrink-0 text-brand-gold-400">
                                    {icon}
                                </div>
                            )}
                            <div className="min-w-0">
                                {title && (
                                    <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {headerExtra}
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close drawer"
                                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-left">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="p-4 sm:p-5 border-t border-border-subtle shrink-0 bg-surface-panel/95 backdrop-blur-sm flex items-center justify-end gap-3">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Drawer;
