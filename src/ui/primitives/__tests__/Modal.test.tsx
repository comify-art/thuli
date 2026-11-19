import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders title, subtitle, and content when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Account Details"
        subtitle="Manage your profile settings"
      >
        <p>Form inputs here</p>
      </Modal>
    );

    expect(screen.getByText('Account Details')).toBeInTheDocument();
    expect(screen.getByText('Manage your profile settings')).toBeInTheDocument();
    expect(screen.getByText('Form inputs here')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Closable Modal">
        <p>Content</p>
      </Modal>
    );

    const closeButtons = screen.getAllByRole('button');
    // Thuli Modal close button has an X icon
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders actions when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Action Modal"
        actions={<button>Submit Payload</button>}
      >
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('Submit Payload')).toBeInTheDocument();
  });
});
