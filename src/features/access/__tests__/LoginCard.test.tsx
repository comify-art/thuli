import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginCard } from '../LoginCard';

describe('LoginCard', () => {
    it('submits email and password via onEmailSubmit', async () => {
        const onEmailSubmit = vi.fn().mockResolvedValue(undefined);
        render(<LoginCard onEmailSubmit={onEmailSubmit} />);

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } });
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

        await waitFor(() => {
            expect(onEmailSubmit).toHaveBeenCalledWith('user@example.com', 'secret123');
        });
    });

    it('triggers onGoogleSignIn and displays error if submission rejects', async () => {
        const onGoogleSignIn = vi.fn().mockRejectedValue(new Error('Popup closed'));
        render(<LoginCard onGoogleSignIn={onGoogleSignIn} />);

        fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Popup closed');
        });
    });
});
