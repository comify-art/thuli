import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AccessGateCard, RestrictedNotice } from '../AccessGateCard';

describe('AccessGateCard & RestrictedNotice Component', () => {
    it('renders with default title, badge, and message', () => {
        render(<AccessGateCard />);

        expect(screen.getByRole('alert')).toBeDefined();
        expect(screen.getByText('Restricted Content')).toBeDefined();
        expect(screen.getByText('Confidential')).toBeDefined();
        expect(screen.getByText(/restricted to authorized members/i)).toBeDefined();
    });

    it('renders metadata chips and custom title', () => {
        render(
            <AccessGateCard
                title="Cap Table Access"
                badgeLabel="Admin Only"
                metadata={[
                    { label: 'Round', value: 'Seed' },
                    { label: 'Target', value: '$500,000' },
                ]}
            />
        );

        expect(screen.getByText('Cap Table Access')).toBeDefined();
        expect(screen.getByText('Admin Only')).toBeDefined();
        expect(screen.getByText('Round:')).toBeDefined();
        expect(screen.getByText('Seed')).toBeDefined();
        expect(screen.getByText('Target:')).toBeDefined();
        expect(screen.getByText('$500,000')).toBeDefined();
    });

    it('triggers primary and secondary actions', () => {
        const onUpgrade = vi.fn();
        const onPolicy = vi.fn();

        render(
            <AccessGateCard
                title="Exclusive Deck"
                primaryAction={{
                    label: 'Request Access',
                    onClick: onUpgrade,
                }}
                secondaryAction={{
                    label: 'View Terms',
                    onClick: onPolicy,
                }}
            />
        );

        const primaryBtn = screen.getByRole('button', { name: /Request Access/i });
        fireEvent.click(primaryBtn);
        expect(onUpgrade).toHaveBeenCalledTimes(1);

        const secondaryBtn = screen.getByRole('button', { name: /View Terms/i });
        fireEvent.click(secondaryBtn);
        expect(onPolicy).toHaveBeenCalledTimes(1);
    });

    it('renders href links when onClick is omitted', () => {
        render(
            <AccessGateCard
                primaryAction={{
                    label: 'External Portal',
                    href: 'https://example.com/join',
                    external: true,
                }}
            />
        );

        const link = screen.getByRole('link', { name: /External Portal/i });
        expect(link.getAttribute('href')).toBe('https://example.com/join');
        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('is aliased as RestrictedNotice', () => {
        render(<RestrictedNotice title="Restricted via Alias" />);
        expect(screen.getByText('Restricted via Alias')).toBeDefined();
    });
});
