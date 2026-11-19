import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Folder } from 'lucide-react';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  it('renders title, description, and icon', () => {
    render(
      <EmptyState
        icon={Folder}
        title="No Folders Found"
        description="Create your first folder to begin."
      />
    );

    expect(screen.getByText('No Folders Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first folder to begin.')).toBeInTheDocument();
  });

  it('handles action clicks when provided', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Folder}
        title="Empty List"
        action={{
          label: 'Add Item',
          onClick: handleAction
        }}
      />
    );

    const button = screen.getByText('Add Item');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
