import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  showCancel?: boolean;
  isLoading?: boolean;
}

/**
 * Standardized Thuli Confirmation Modal Primitive
 * Built on native Modal using dark-first theme tokens.
 */
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
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const busy = isLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onCancel}
      title={title}
      size="sm"
      actions={
        <>
          {showCancel && !busy && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy}
            className={isDangerous ? 'btn-danger' : 'btn-primary'}
          >
            {busy ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {isDangerous && (
          <div className="shrink-0 p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <p className="text-sm text-neutral-300 leading-relaxed pt-0.5">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
