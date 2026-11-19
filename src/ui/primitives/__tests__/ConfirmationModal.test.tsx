import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmationModal
        isOpen={false}
        title="Confirm Removal"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
  });

  it('renders title, message, and action labels', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Record"
        message="This action is permanent."
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Record')).toBeInTheDocument();
    expect(screen.getByText('This action is permanent.')).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep')).toBeInTheDocument();
  });

  it('handles synchronous confirm and cancel events', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm Action"
        message="Please proceed."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm'));
    });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('manages asynchronous loading state during onConfirm execution', async () => {
    let resolvePromise: () => void = () => {};
    const asyncConfirm = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
    });

    render(
      <ConfirmationModal
        isOpen={true}
        title="Async Task"
        message="Running task"
        onConfirm={asyncConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Confirm'));
    expect(asyncConfirm).toHaveBeenCalledTimes(1);

    // Displays Processing... during unresolved promise
    expect(screen.getByText('Processing...')).toBeInTheDocument();

    // Resolves and restores
    resolvePromise();
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });
});
