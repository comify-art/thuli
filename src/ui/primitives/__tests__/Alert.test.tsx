import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Alert } from '../Alert';

describe('Alert Primitive', () => {
    it('renders with default info variant', () => {
        render(<Alert>System notification</Alert>);
        const alert = screen.getByRole('alert');
        expect(alert).toBeDefined();
        expect(screen.getByText('System notification')).toBeDefined();
    });

    it('renders title and children correctly', () => {
        render(
            <Alert title="Attention Required" variant="warning">
                Please review your profile details.
            </Alert>
        );
        expect(screen.getByText('Attention Required')).toBeDefined();
        expect(screen.getByText('Please review your profile details.')).toBeDefined();
    });

    it('renders different variants with appropriate classes', () => {
        const { rerender } = render(<Alert variant="error">Critical failure</Alert>);
        expect(screen.getByRole('alert').className).toContain('bg-red-500/10');

        rerender(<Alert variant="success">Operation completed</Alert>);
        expect(screen.getByRole('alert').className).toContain('bg-emerald-500/10');

        rerender(<Alert variant="warning">Approaching quota</Alert>);
        expect(screen.getByRole('alert').className).toContain('bg-amber-500/10');
    });

    it('handles onDismiss callback', () => {
        const onDismiss = vi.fn();
        render(<Alert onDismiss={onDismiss}>Dismissible notice</Alert>);

        const button = screen.getByLabelText('Dismiss alert');
        fireEvent.click(button);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders custom action node', () => {
        render(
            <Alert action={<button type="button">Retry Action</button>}>
                Network timeout occurred
            </Alert>
        );
        expect(screen.getByText('Retry Action')).toBeDefined();
    });
});
