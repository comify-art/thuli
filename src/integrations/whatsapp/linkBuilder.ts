import type {
    WhatsAppIntentParams,
    WhatsAppBroadcastParams,
    WhatsAppBroadcastSnippet
} from './types';
import { normalizeWhatsAppPhone } from '../../core/utils/phone';

// Re-export phone normalization for backward compatibility and convenience
export { normalizeToE164, isValidE164, formatDisplayPhone } from '../../core/utils/phone';

/**
 * Generates the canonical standardized syndicate group name: Deal-<company-name>
 * e.g., Deal-AcmeRobotics or Custom-Prefix-NovaDynamics
 */
export function formatDealGroupName(
    companyNameOrSlug: string,
    prefixOrYear?: string | number,
    optionalPrefix?: string
): string {
    let prefix = 'Deal-';
    if (typeof prefixOrYear === 'string') {
        prefix = prefixOrYear;
    } else if (typeof optionalPrefix === 'string') {
        prefix = optionalPrefix;
    }

    const sanitized = (companyNameOrSlug || 'Deal')
        .trim()
        .replace(/[^a-zA-Z0-9-]/g, '')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    return `${prefix}${sanitized}`;
}

/**
 * Validates and normalizes WhatsApp group invite links.
 * Accepts full URLs or invite codes.
 */
export function formatWhatsAppGroupUrl(inviteCodeOrUrl?: string): string {
    if (!inviteCodeOrUrl || !inviteCodeOrUrl.trim()) {
        return '';
    }
    const trimmed = inviteCodeOrUrl.trim();
    if (trimmed.startsWith('https://chat.whatsapp.com/')) {
        return trimmed;
    }
    if (trimmed.startsWith('http://chat.whatsapp.com/')) {
        return trimmed.replace('http://', 'https://');
    }
    const cleanCode = trimmed.replace(/^[/\s]+|[/\s]+$/g, '');
    return `https://chat.whatsapp.com/${cleanCode}`;
}

/**
 * Normalizes phone numbers to clean E.164-compatible digit strings for wa.me URLs.
 * (Delegates to centralized core/utils/phone implementation)
 */
export function normalizePhoneNumber(phone?: string): string {
    return normalizeWhatsAppPhone(phone);
}

/**
 * Generates a wa.me intent URL with pre-filled syndicate verification message.
 */
export function createSyndicateCommitmentIntent(params: WhatsAppIntentParams): string {
    const formattedAmount = params.currency === 'USD'
        ? `$${params.committedAmount.toLocaleString()} USD`
        : `₹${params.committedAmount.toLocaleString()} INR`;

    const groupName = params.dealSlug
        ? formatDealGroupName(params.dealSlug, params.pitchYear, params.prefix)
        : `${params.prefix || 'Deal-'}${params.startupName}`;

    const text = `Hi, I am ${params.investorName}${params.batchYear ? ` (${params.batchYear})` : ''}. ` +
        `I have submitted a commitment of ${formattedAmount} for ${params.startupName}. ` +
        `Please confirm my addition to the private syndicate group ${groupName}.`;

    const phoneDigits = normalizePhoneNumber(params.phoneNumber);
    const baseUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : `https://wa.me/`;

    return `${baseUrl}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates formatted broadcast snippets and wa.me deep links for syndicate lifecycle updates.
 */
export function createBroadcastIntent(params: WhatsAppBroadcastParams): WhatsAppBroadcastSnippet {
    const phoneDigits = normalizePhoneNumber(params.dealLeadPhone);
    const baseUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : `https://wa.me/`;

    if (params.type === 'daily_update') {
        const title = `Daily Active Deal Update`;
        const dateHeader = params.pitchDate
            ? (params.pitchDate instanceof Date ? params.pitchDate : new Date(params.pitchDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' update'
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' update';

        const dealsList = params.deals && params.deals.length > 0
            ? params.deals
            : [{
                startupName: params.startupName,
                dealSlug: params.dealSlug,
                dealRoomUrl: params.dealRoomUrl,
                totalCommittedUsd: params.totalCommittedUsd,
                totalCommittedInr: params.totalCommittedInr,
                totalCommitters: params.totalCommitters,
                targetThresholdUsd: params.targetThresholdUsd
            }];

        const dealLines = dealsList.map(deal => {
            const usd = deal.totalCommittedUsd || 0;
            const inr = deal.totalCommittedInr || 0;
            const target = deal.targetThresholdUsd || 50000;
            const blended = usd + Math.round(inr / 100);
            const pct = Math.min(100, Math.round((blended / target) * 100));
            const roomUrl = deal.dealRoomUrl || `https://portal.example.com/deal/${deal.dealSlug || deal.startupName.toLowerCase()}`;

            if (blended === 0) {
                return `$0 for ${roomUrl}`;
            }
            const investorsText = (deal.totalCommitters || 0) > 0 ? ` • ${deal.totalCommitters} investor${deal.totalCommitters === 1 ? '' : 's'}` : '';
            return `$${blended.toLocaleString()} / $${target.toLocaleString()} (${pct}%${investorsText}) for ${roomUrl}`;
        });

        const headline = dateHeader;
        const bodyLines = [
            dateHeader,
            `—-`,
            dealLines.join('\n\n')
        ];

        const body = bodyLines.join('\n');
        return {
            type: 'daily_update',
            title,
            headline,
            body,
            intentUrl: `${baseUrl}?text=${encodeURIComponent(body)}`
        };
    }

    if (params.type === 'pitch_announcement') {
        const title = `Upcoming Pitch Event Announcement`;
        const headline = `📅 *Syndicate Pitch Event: ${params.startupName}*`;
        const formattedDate = params.pitchDate
            ? (params.pitchDate instanceof Date ? params.pitchDate.toLocaleDateString() : String(params.pitchDate))
            : 'Upcoming';

        const bodyLines = [
            headline,
            ``,
            `You are invited to the upcoming syndicate pitch session with *${params.startupName}*:`,
            `• *Date*: ${formattedDate}`,
            params.pitchTime ? `• *Time*: ${params.pitchTime}` : ``,
            params.founderBio ? `• *Founder*: ${params.founderBio}` : ``,
            params.highlights && params.highlights.length > 0
                ? `• *Highlights*: ${params.highlights.join(' | ')}`
                : ``,
            ``,
            params.zoomUrl ? `🔗 *Zoom Session*: ${params.zoomUrl}` : ``,
            params.icsUrl ? `🗓️ *Add to Calendar (.ics)*: ${params.icsUrl}` : ``,
            params.dealRoomUrl ? `📄 *Pitch Deck & Due Diligence*: ${params.dealRoomUrl}` : ``,
            ``,
            `_Pre-pitch founder Q&A is open in the Deal Prep channel._`
        ].filter(Boolean);

        const body = bodyLines.join('\n');
        return {
            type: 'pitch_announcement',
            title,
            headline,
            body,
            intentUrl: `${baseUrl}?text=${encodeURIComponent(body)}`
        };
    }

    if (params.type === 'deal_prep') {
        const title = `Deal Prep Diligence Brief`;
        const headline = `🚀 Inbound: *${params.startupName}*`;
        const dealUrl = params.dealRoomUrl || (params.dealSlug ? `https://portal.example.com/deal/${params.dealSlug}` : '');

        const rawNotes = (params.notes || params.description || '').trim();
        let description = '';
        if (rawNotes) {
            const lines = rawNotes.split('\n').map(l => l.trim()).filter(Boolean);
            description = lines.slice(0, 2).join('\n');
        }

        const bodyLines = [
            headline,
            dealUrl ? ` see ${dealUrl}` : '',
            description || ''
        ].filter(Boolean);

        const body = bodyLines.join('\n');
        return {
            type: 'deal_prep',
            title,
            headline,
            body,
            intentUrl: `${baseUrl}?text=${encodeURIComponent(body)}`
        };
    }

    // Default: 'commitment_nudge'
    const title = `Commitment Closing Nudge (48h Alert)`;
    const headline = `⏳ *FINAL CALL: ${params.startupName} Syndicate Closing Soon*`;
    const days = params.daysRemaining !== undefined ? params.daysRemaining : 2;

    const bodyLines = [
        headline,
        ``,
        `Attention members: the non-binding commitment window for *${params.startupName}* closes in *${days <= 1 ? '24 HOURS' : `${days} DAYS`}*.`,
        ``,
        params.totalCommitters ? `• Current Committers: ${params.totalCommitters} investors` : ``,
        params.targetThresholdUsd ? `• Syndicate Target: $${params.targetThresholdUsd.toLocaleString()} USD` : ``,
        ``,
        `If you intend to participate or need founder diligence clarification, please finalize your allocation check now:`,
        params.dealRoomUrl ? `👉 *Submit Check*: ${params.dealRoomUrl}` : ``,
        ``,
        `_Minimum ticket: $3,000 USD or ₹3,00,000 INR. Committed investors receive wire transfer packets upon closure._`
    ].filter(Boolean);

    const body = bodyLines.join('\n');
    return {
        type: 'commitment_nudge',
        title,
        headline,
        body,
        intentUrl: `${baseUrl}?text=${encodeURIComponent(body)}`
    };
}

/**
 * Formats a quick broadcast snippet and wa.me deep link for Tier 2 "GA Deal Prep" group.
 */
export function createDealPrepBroadcastSnippet(params: {
    startupName: string;
    dealSlug?: string;
    sector?: string;
    targetRaiseUsd?: number;
    dealLeadName?: string;
    dealLeadPhone?: string;
    pitchDeckUrl?: string;
    dealRoomUrl?: string;
    notes?: string;
    description?: string;
}): WhatsAppBroadcastSnippet {
    return createBroadcastIntent({
        type: 'deal_prep',
        startupName: params.startupName,
        dealSlug: params.dealSlug,
        sector: params.sector,
        targetThresholdUsd: params.targetRaiseUsd,
        dealLeadName: params.dealLeadName,
        dealLeadPhone: params.dealLeadPhone,
        pitchDeckUrl: params.pitchDeckUrl,
        dealRoomUrl: params.dealRoomUrl,
        notes: params.notes,
        description: params.description,
    });
}

/**
 * Universal helper to build any WhatsApp intent link.
 */
export function generateWhatsAppDeepLink(urlOrPhone: string, text?: string): string {
    if (urlOrPhone.startsWith('https://chat.whatsapp.com/')) {
        return urlOrPhone;
    }
    const digits = normalizePhoneNumber(urlOrPhone);
    const base = digits ? `https://wa.me/${digits}` : `https://wa.me/`;
    if (!text) return base;
    return `${base}?text=${encodeURIComponent(text)}`;
}

