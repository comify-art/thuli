import React from 'react';

export interface FormFieldProps {
    label: React.ReactNode;
    icon?: React.ReactNode;
    required?: boolean;
    optionalLabel?: string;
    error?: string;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * Canonical form field wrapper rendering a consistent label, optional icon,
 * required/optional badge, input slot, and validation error message.
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    icon,
    required = false,
    optionalLabel,
    error,
    hint,
    className = '',
    children,
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-medium text-neutral-300 tracking-tight flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                    {icon}
                    <span>
                        {label}
                        {required && <span className="text-red-400 ml-0.5">*</span>}
                    </span>
                </span>
                {optionalLabel && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                        {optionalLabel}
                    </span>
                )}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
            {!error && hint && <p className="text-[11px] text-neutral-500 mt-1">{hint}</p>}
        </div>
    );
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    ({ hasError = false, className = '', ...props }, ref) => (
        <input
            ref={ref}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border ${
                hasError ? 'border-red-500' : 'border-neutral-700/80'
            } text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 ${className}`}
            {...props}
        />
    )
);
TextInput.displayName = 'TextInput';

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
    ({ hasError = false, className = '', children, ...props }, ref) => (
        <select
            ref={ref}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-[#18181b] border ${
                hasError ? 'border-red-500' : 'border-neutral-700/80'
            } text-white focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </select>
    )
);
SelectInput.displayName = 'SelectInput';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ hasError = false, className = '', ...props }, ref) => (
        <textarea
            ref={ref}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border ${
                hasError ? 'border-red-500' : 'border-neutral-700/80'
            } text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 resize-y min-h-[80px] ${className}`}
            {...props}
        />
    )
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    hasError?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, hasError = false, className = '', disabled, ...props }, ref) => (
        <label className={`flex items-start gap-2.5 text-xs text-neutral-300 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
            <input
                ref={ref}
                type="checkbox"
                disabled={disabled}
                className={`mt-0.5 rounded border ${
                    hasError ? 'border-red-500' : 'border-neutral-700/80'
                } bg-white/[0.04] text-brand-500 focus:ring-brand-400 h-4 w-4 shrink-0 transition-colors cursor-pointer`}
                {...props}
            />
            {(label || description) && (
                <div className="flex-1 min-w-0">
                    {label && <span className="font-medium text-neutral-200">{label}</span>}
                    {description && <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{description}</p>}
                </div>
            )}
        </label>
    )
);
Checkbox.displayName = 'Checkbox';

export interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className = '',
}) => {
    const isSm = size === 'sm';

    return (
        <label className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
            {(label || description) && (
                <div className="flex-1 min-w-0 pr-2">
                    {label && <span className="text-xs sm:text-sm font-medium text-neutral-200 block">{label}</span>}
                    {description && <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{description}</p>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    checked ? 'bg-brand-600' : 'bg-neutral-700'
                } ${isSm ? 'h-5 w-9' : 'h-6 w-11'}`}
            >
                <span
                    className={`pointer-events-none inline-block rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out ${
                        isSm
                            ? `${checked ? 'translate-x-4' : 'translate-x-0'} h-4 w-4`
                            : `${checked ? 'translate-x-5' : 'translate-x-0'} h-5 w-5`
                    }`}
                />
            </button>
        </label>
    );
};

