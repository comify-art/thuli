import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge, getStatusBadgeVariant } from '../StatusBadge';

describe('getStatusBadgeVariant', () => {
  it('returns emerald for active and positive states', () => {
    expect(getStatusBadgeVariant('active')).toBe('emerald');
    expect(getStatusBadgeVariant('approved')).toBe('emerald');
    expect(getStatusBadgeVariant('paid')).toBe('emerald');
    expect(getStatusBadgeVariant('completed')).toBe('emerald');
    expect(getStatusBadgeVariant('scheduled')).toBe('emerald');
    expect(getStatusBadgeVariant('live')).toBe('emerald');
    expect(getStatusBadgeVariant('closed')).toBe('emerald');
    expect(getStatusBadgeVariant('side-loaded')).toBe('emerald');
    expect(getStatusBadgeVariant('signed')).toBe('emerald');
  });

  it('returns amber for pending and open syndicate states', () => {
    expect(getStatusBadgeVariant('pending')).toBe('amber');
    expect(getStatusBadgeVariant('pending_payment')).toBe('amber');
    expect(getStatusBadgeVariant('registered')).toBe('amber');
    expect(getStatusBadgeVariant('invited')).toBe('amber');
    expect(getStatusBadgeVariant('syndicate_open')).toBe('amber');
    expect(getStatusBadgeVariant('staged')).toBe('amber');
    expect(getStatusBadgeVariant('prep')).toBe('amber');
  });

  it('returns blue for in-review and diligence states', () => {
    expect(getStatusBadgeVariant('in_review')).toBe('blue');
    expect(getStatusBadgeVariant('due_diligence')).toBe('blue');
    expect(getStatusBadgeVariant('open_for_commit')).toBe('blue');
    expect(getStatusBadgeVariant('processing')).toBe('blue');
    expect(getStatusBadgeVariant('pitch_invited')).toBe('blue');
  });

  it('returns purple for leadership roles', () => {
    expect(getStatusBadgeVariant('admin')).toBe('purple');
    expect(getStatusBadgeVariant('director')).toBe('purple');
    expect(getStatusBadgeVariant('lead')).toBe('purple');
  });

  it('returns rose for destructive, inactive, or cancelled states', () => {
    expect(getStatusBadgeVariant('suspended')).toBe('rose');
    expect(getStatusBadgeVariant('rejected')).toBe('rose');
    expect(getStatusBadgeVariant('cancelled')).toBe('rose');
    expect(getStatusBadgeVariant('inactive')).toBe('rose');
    expect(getStatusBadgeVariant('failed')).toBe('rose');
    expect(getStatusBadgeVariant('declined')).toBe('rose');
  });

  it('returns brand for submitted states', () => {
    expect(getStatusBadgeVariant('submitted')).toBe('brand');
    expect(getStatusBadgeVariant('applied')).toBe('brand');
  });

  it('returns neutral for undefined or unrecognized status', () => {
    expect(getStatusBadgeVariant(undefined)).toBe('neutral');
    expect(getStatusBadgeVariant('unknown_state')).toBe('neutral');
  });
});

describe('StatusBadge Component', () => {
  it('renders badge label correctly', () => {
    render(<StatusBadge variant="brand" label="Active Pitch" />);
    expect(screen.getByText('Active Pitch')).toBeInTheDocument();
  });

  it('supports semantic variant aliases (success, warning, danger, info, primary)', () => {
    const { rerender } = render(<StatusBadge variant="success">Passed</StatusBadge>);
    expect(screen.getByText('Passed').className).toContain('text-emerald-400');

    rerender(<StatusBadge variant="warning">Caution</StatusBadge>);
    expect(screen.getByText('Caution').className).toContain('text-amber-400');

    rerender(<StatusBadge variant="danger">Blocked</StatusBadge>);
    expect(screen.getByText('Blocked').className).toContain('text-rose-400');

    rerender(<StatusBadge variant="info">Note</StatusBadge>);
    expect(screen.getByText('Note').className).toContain('text-blue-400');

    rerender(<StatusBadge variant="primary">Featured</StatusBadge>);
    expect(screen.getByText('Featured').className).toContain('text-brand-gold-400');
  });

  it('renders children if label is not provided', () => {
    render(<StatusBadge variant="emerald">Live Deal</StatusBadge>);
    expect(screen.getByText('Live Deal')).toBeInTheDocument();
  });

  it('renders status dot when dot is true', () => {
    const { container } = render(<StatusBadge variant="amber" dot>Pending</StatusBadge>);
    const dotElement = container.querySelector('.rounded-full.bg-amber-400');
    expect(dotElement).toBeInTheDocument();
  });

  it('adds animate-pulse class when dotPulse is true', () => {
    const { container } = render(<StatusBadge variant="emerald" dot dotPulse>Live</StatusBadge>);
    const dotElement = container.querySelector('.animate-pulse');
    expect(dotElement).toBeInTheDocument();
  });
});
