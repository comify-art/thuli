import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatsAppBroadcastConsole } from '../WhatsAppBroadcastConsole';

describe('WhatsAppBroadcastConsole', () => {
    const mockEvent = {
        companyName: 'Trell Technologies',
        slug: 'trell',
        pitchDate: '2026-11-20',
        pitchTime: '6:30 PM IST',
        dealLead: 'Karthik Lead',
        dealLeadPhone: '+919840011111',
        dealShareUrl: 'https://portal.example.com/deal/trell',
        commitmentConfig: {
            totalCommittedUsd: 35000,
            totalCommittedInr: 1500000,
            totalCommitters: 7,
            targetThresholdUsd: 50000,
            deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            whatsappGroupUrl: 'https://chat.whatsapp.com/TRELLGROUP'
        }
    };

    it('renders header, group badge, and default daily progress template', () => {
        render(<WhatsAppBroadcastConsole event={mockEvent} />);

        expect(screen.getByText('Broadcast Dispatch Manager')).toBeDefined();
        expect(screen.getAllByText(/Deal-Trell/).length).toBeGreaterThan(0);
        expect(screen.getByText('Daily Progress')).toBeDefined();
        expect(screen.getByText('Pitch Invite')).toBeDefined();
        expect(screen.getByText('Closing Nudge')).toBeDefined();

        // Check daily progress snippet content
        expect(screen.getByText(/update/i)).toBeDefined();
        expect(screen.getByText(/\$50,000 \/ \$50,000/)).toBeDefined();
        expect(screen.getByText(/https:\/\/portal\.example\.com\/deal\/trell/)).toBeDefined();
    });

    it('switches to pitch invite template when tab clicked', () => {
        render(<WhatsAppBroadcastConsole event={mockEvent} />);

        const pitchTab = screen.getByText('Pitch Invite');
        fireEvent.click(pitchTab);

        expect(screen.getByText(/Syndicate Pitch Event: Trell Technologies/)).toBeDefined();
        expect(screen.getByText(/Date/)).toBeDefined();
        expect(screen.getByText(/Time/)).toBeDefined();
    });

    it('switches to closing nudge template when tab clicked', () => {
        render(<WhatsAppBroadcastConsole event={mockEvent} />);

        const nudgeTab = screen.getByText('Closing Nudge');
        fireEvent.click(nudgeTab);

        expect(screen.getByText(/FINAL CALL: Trell Technologies Syndicate Closing Soon/)).toBeDefined();
        expect(screen.getByText(/Submit Check/)).toBeDefined();
    });

    it('renders "Open in WhatsApp" external link with encoded intent', () => {
        render(<WhatsAppBroadcastConsole event={mockEvent} />);

        const waLink = screen.getByText('Open in WhatsApp').closest('a');
        expect(waLink).toBeDefined();
        expect(waLink?.getAttribute('href')).toContain('https://wa.me/919840011111?text=');
        expect(waLink?.getAttribute('target')).toBe('_blank');
    });
});
