import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
    showCancel?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDangerous = false,
    showCancel = true,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#161b22] border border-gray-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start">
                        {isDangerous && (
                            <div className="flex-shrink-0 bg-red-900/30 p-2 rounded-full mr-4">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0d1117] px-6 py-4 flex justify-end space-x-3 border-t border-gray-800">
                    {showCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-md text-sm font-bold text-white shadow-sm transition-colors ${isDangerous
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-[var(--accent-color)] text-black hover:opacity-90'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
