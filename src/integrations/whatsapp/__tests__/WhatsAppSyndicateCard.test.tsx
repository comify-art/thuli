import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatsAppSyndicateCard } from '../WhatsAppSyndicateCard';

describe('WhatsAppSyndicateCard', () => {
    it('renders canonical group name and primary join button when invite link is provided', () => {
        render(
            <WhatsAppSyndicateCard
                groupInviteUrl="https://chat.whatsapp.com/TEST123CODE"
                startupName="Trell"
                startupSlug="trell"
                pitchYear={2025}
                dealLeadName="Murali Lead"
                dealLeadPhone="+14155551234"
                committedAmount={10000}
                currency="USD"
                investorName="Jane Doe"
            />
        );

        expect(screen.getByText('GA-Deal-Trell')).toBeDefined();
        expect(screen.getByText('Private Syndicate Channel')).toBeDefined();
        expect(screen.getByText('Join Syndicate WhatsApp Group')).toBeDefined();

        const joinLink = screen.getByText('Join Syndicate WhatsApp Group').closest('a');
        expect(joinLink?.getAttribute('href')).toBe('https://chat.whatsapp.com/TEST123CODE');
        expect(joinLink?.getAttribute('target')).toBe('_blank');

        // Check allocation badge
        expect(screen.getByText('Verified Syndicate Allocation:')).toBeDefined();
        expect(screen.getByText('$10,000 USD')).toBeDefined();

        // Check Deal Lead message link
        const messageLeadLink = screen.getByText('Message Deal Lead').closest('a');
        expect(messageLeadLink?.getAttribute('href')).toContain('https://wa.me/14155551234');
    });

    it('renders INR currency allocation correctly', () => {
        render(
            <WhatsAppSyndicateCard
                groupInviteUrl="https://chat.whatsapp.com/INR123"
                startupName="Agnikul"
                committedAmount={500000}
                currency="INR"
            />
        );

        expect(screen.getByText('₹500,000 INR')).toBeDefined();
    });

    it('toggles QR code display on button click', () => {
        render(
            <WhatsAppSyndicateCard
                groupInviteUrl="https://chat.whatsapp.com/QRTEST"
                startupName="FinBox"
            />
        );

        // QR code should not be visible initially
        expect(screen.queryByAltText(/Scan QR code to join/)).toBeNull();

        // Click QR button
        const qrButton = screen.getByLabelText('Toggle Mobile QR Code');
        fireEvent.click(qrButton);

        // QR image should now be in the document
        const qrImg = screen.getByAltText(/Scan QR code to join/);
        expect(qrImg).toBeDefined();
        expect(qrImg.getAttribute('src')).toContain('api.qrserver.com');
    });

    it('handles missing invite link gracefully with fallback guidance', () => {
        render(
            <WhatsAppSyndicateCard
                startupName="Early Deal"
                dealLeadName="Arun Lead"
            />
        );

        expect(screen.getByText(/Group invite link being provisioned by Deal Lead/)).toBeDefined();
        expect(screen.getByText('Message Deal Lead')).toBeDefined();
    });
});

