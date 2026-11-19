import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CopyButton } from '../CopyButton';

describe('CopyButton Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders with default copy icon and title', () => {
    render(<CopyButton text="https://test.link" title="Copy Test Link" />);
    const button = screen.getByTitle('Copy Test Link');
    expect(button).toBeInTheDocument();
  });

  it('copies text to clipboard on click and displays feedback', async () => {
    render(<CopyButton text="sample-token-123" showLabel label="Copy Token" />);
    const button = screen.getByRole('button');
    expect(screen.getByText('Copy Token')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('sample-token-123');
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Fast-forward 2 seconds to verify restoration
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Copy Token')).toBeInTheDocument();
  });
});
