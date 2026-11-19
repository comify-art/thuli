import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfileMenu } from '../UserProfileMenu';

describe('UserProfileMenu component', () => {
    const mockUser = {
        uid: 'user_123',
        displayName: 'Murali V',
        email: 'alex@example.com',
    };

    it('renders user trigger with monogram initial and display name', () => {
        render(
            <UserProfileMenu
                user={mockUser}
                claims={{ role: 'member' }}
            />
        );

        expect(screen.getByText('Murali V')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('toggles dropdown menu on click', () => {
        render(
            <UserProfileMenu
                user={mockUser}
                claims={{ role: 'admin' }}
                portalUrl="http://localhost:5184/portal"
            />
        );

        // Initially menu is closed
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();

        // Click trigger button
        fireEvent.click(screen.getByRole('button', { name: /Murali V/i }));

        // Menu is open
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.queryByText('alex@example.com')).not.toBeInTheDocument();
        expect(screen.getByText('Administrator')).toBeInTheDocument();
        expect(screen.getByText('Open Member Portal')).toBeInTheDocument();

        // Click again to close
        fireEvent.click(screen.getByRole('button', { name: /Murali V/i }));
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls onLogout when Sign Out is clicked', () => {
        const onLogout = vi.fn();
        render(
            <UserProfileMenu
                user={mockUser}
                claims={{ role: 'member' }}
                onLogout={onLogout}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /Murali V/i }));
        const signOutBtn = screen.getByRole('menuitem', { name: /Sign Out/i });
        fireEvent.click(signOutBtn);

        expect(onLogout).toHaveBeenCalledTimes(1);
    });
});
