import { describe, it, expect } from 'vitest';
import {
    formatDealGroupName,
    formatWhatsAppGroupUrl,
    normalizePhoneNumber,
    createSyndicateCommitmentIntent,
    createBroadcastIntent,
    createDealPrepBroadcastSnippet,
    generateWhatsAppDeepLink
} from '../linkBuilder';

describe('WhatsApp linkBuilder', () => {
    describe('formatDealGroupName', () => {
        it('generates canonical Deal-<company-name> name', () => {
            const groupName = formatDealGroupName('trell');
            expect(groupName).toBe('Deal-Trell');
        });

        it('handles hyphenated names properly', () => {
            const groupName = formatDealGroupName('hyper-verge');
            expect(groupName).toBe('Deal-HyperVerge');
        });

        it('supports custom prefix override for domain neutrality', () => {
            const groupName = formatDealGroupName('finbox', 'Syndicate-');
            expect(groupName).toBe('Syndicate-Finbox');
        });
    });

    describe('formatWhatsAppGroupUrl', () => {
        it('normalizes bare invite code to full URL', () => {
            expect(formatWhatsAppGroupUrl('ABC123xyz')).toBe('https://chat.whatsapp.com/ABC123xyz');
        });

        it('preserves existing https URL', () => {
            expect(formatWhatsAppGroupUrl('https://chat.whatsapp.com/DEF456uvw')).toBe('https://chat.whatsapp.com/DEF456uvw');
        });

        it('returns empty string for empty input', () => {
            expect(formatWhatsAppGroupUrl('')).toBe('');
            expect(formatWhatsAppGroupUrl(undefined)).toBe('');
        });
    });

    describe('normalizePhoneNumber', () => {
        it('strips non-digits from phone number', () => {
            expect(normalizePhoneNumber('+1 (415) 555-2671')).toBe('14155552671');
            expect(normalizePhoneNumber('+91 98400 12345')).toBe('919840012345');
        });
    });

    describe('createSyndicateCommitmentIntent', () => {
        it('generates wa.me intent with USD formatting and investor name', () => {
            const url = createSyndicateCommitmentIntent({
                phoneNumber: '+14155552671',
                startupName: 'Trell',
                investorName: 'Murali Krishnan',
                committedAmount: 5000,
                currency: 'USD',
                batchYear: "ECE '98",
                dealSlug: 'trell',
                pitchYear: 2025
            });

            expect(url).toContain('https://wa.me/14155552671?text=');
            expect(url).toContain(encodeURIComponent('Murali Krishnan (ECE \'98)'));
            expect(url).toContain(encodeURIComponent('$5,000 USD'));
            expect(url).toContain(encodeURIComponent('Deal-Trell'));
        });

        it('generates wa.me intent with INR formatting and fallback without phone', () => {
            const url = createSyndicateCommitmentIntent({
                startupName: 'Agnikul',
                investorName: 'Alex Rivera',
                committedAmount: 500000,
                currency: 'INR'
            });

            expect(url.startsWith('https://wa.me/?text=')).toBe(true);
            expect(url).toContain(encodeURIComponent('₹500,000 INR'));
            expect(url).toContain(encodeURIComponent('Deal-Agnikul'));
        });
    });

    describe('createBroadcastIntent', () => {
        it('creates daily_update snippet with progress percentage and combined $$ amount', () => {
            const snippet = createBroadcastIntent({
                type: 'daily_update',
                startupName: 'Trell',
                dealSlug: 'trell',
                totalCommittedUsd: 25000,
                totalCommittedInr: 1000000,
                totalCommitters: 6,
                targetThresholdUsd: 50000,
                dealRoomUrl: 'https://portal.example.com/deal/trell'
            });

            expect(snippet.type).toBe('daily_update');
            expect(snippet.body).toContain('update');
            expect(snippet.body).toContain('—-');
            expect(snippet.body).toContain('$35,000 / $50,000 (70% • 6 investors) for https://portal.example.com/deal/trell');
            expect(snippet.intentUrl).toContain('https://wa.me/?text=');
        });

        it('creates daily_update snippet with clean $0 format when no commitments exist', () => {
            const snippet = createBroadcastIntent({
                type: 'daily_update',
                startupName: 'Velmeni',
                dealSlug: 'velmeni',
                totalCommittedUsd: 0,
                totalCommittedInr: 0,
                dealRoomUrl: 'https://portal.example.com/deal/velmeni'
            });

            expect(snippet.body).toContain('$0 for https://portal.example.com/deal/velmeni');
        });

        it('creates multi-deal daily_update snippet with separate items per deal', () => {
            const snippet = createBroadcastIntent({
                type: 'daily_update',
                startupName: 'All Deals',
                deals: [
                    {
                        startupName: 'Velmeni',
                        dealSlug: 'velmeni',
                        dealRoomUrl: 'https://portal.example.com/deal/velmeni',
                        totalCommittedUsd: 0,
                        totalCommittedInr: 0
                    },
                    {
                        startupName: 'Turi',
                        dealSlug: 'turi',
                        dealRoomUrl: 'https://portal.example.com/deal/turi',
                        totalCommittedUsd: 0,
                        totalCommittedInr: 0
                    }
                ]
            });

            expect(snippet.body).toContain('$0 for https://portal.example.com/deal/velmeni');
            expect(snippet.body).toContain('$0 for https://portal.example.com/deal/turi');
        });

        it('creates pitch_announcement snippet with event details', () => {
            const snippet = createBroadcastIntent({
                type: 'pitch_announcement',
                startupName: 'FinBox',
                pitchDate: '2026-11-15',
                pitchTime: '6:00 PM IST',
                zoomUrl: 'https://zoom.us/j/123456789',
                dealRoomUrl: 'https://portal.example.com/deal/finbox'
            });

            expect(snippet.type).toBe('pitch_announcement');
            expect(snippet.body).toContain('*Syndicate Pitch Event: FinBox*');
            expect(snippet.body).toContain('2026-11-15');
            expect(snippet.body).toContain('6:00 PM IST');
            expect(snippet.body).toContain('https://zoom.us/j/123456789');
        });

        it('creates commitment_nudge snippet with deadline urgency', () => {
            const snippet = createBroadcastIntent({
                type: 'commitment_nudge',
                startupName: 'Acme Robotics',
                daysRemaining: 2,
                totalCommitters: 8,
                targetThresholdUsd: 50000,
                dealRoomUrl: 'https://portal.example.com/deal/acme'
            });

            expect(snippet.type).toBe('commitment_nudge');
            expect(snippet.body).toContain('*FINAL CALL: Acme Robotics Syndicate Closing Soon*');
            expect(snippet.body).toContain('2 DAYS');
            expect(snippet.body).toContain('8 investors');
        });

        it('creates simplified deal_prep snippet for Tier 2 diligence discussion', () => {
            const snippet = createDealPrepBroadcastSnippet({
                startupName: 'Acme Robotics',
                dealSlug: 'acme-robotics',
                dealLeadPhone: '+1 (555) 019-2834',
                dealRoomUrl: 'https://portal.example.com/deal/acme-robotics',
                notes: 'Autonomous navigation system for warehouse logistics.\nSeeking $500k seed funding.',
            });

            expect(snippet.type).toBe('deal_prep');
            expect(snippet.body).toContain('🚀 Inbound: *Acme Robotics*');
            expect(snippet.body).toContain(' see https://portal.example.com/deal/acme-robotics');
            expect(snippet.body).toContain('Autonomous navigation system for warehouse logistics.\nSeeking $500k seed funding.');
            expect(snippet.intentUrl).toContain('https://wa.me/15550192834?text=');
        });
    });

    describe('generateWhatsAppDeepLink', () => {
        it('handles chat.whatsapp.com URL directly', () => {
            const link = generateWhatsAppDeepLink('https://chat.whatsapp.com/XYZ123');
            expect(link).toBe('https://chat.whatsapp.com/XYZ123');
        });

        it('handles phone number with prefilled text', () => {
            const link = generateWhatsAppDeepLink('+14155551234', 'Hello world');
            expect(link).toBe('https://wa.me/14155551234?text=Hello%20world');
        });
    });
});
