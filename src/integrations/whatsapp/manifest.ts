/**
 * Canonical Manifest of Preset WhatsApp Groups for Syndicate Ecosystem
 *
 * Defines the 3-Tier communication channel topology:
 * - Tier 1: Network Members (Network-wide Announcements)
 * - Tier 2: Deal Prep (Pre-Pitch & Incoming Deal Diligence)
 * - Tier 3: Company Syndicate Channels (Deal-<company-name>)
 */

export type WhatsAppChannelTier = 1 | 2 | 3;

export type WhatsAppPostingMode =
    | 'announcement_only'
    | 'open_discussion'
    | 'committed_syndicate_only';

export type WhatsAppGroupLifecycle =
    | 'permanent'
    | 'standing'
    | 'per_company';

export interface WhatsAppPresetGroupDefinition {
    id: string;
    key: 'MEMBERS' | 'DEAL_PREP' | 'COMPANY_SYNDICATE';
    name: string;
    tier: WhatsAppChannelTier;
    tierTitle: string;
    description: string;
    audience: string;
    postingMode: WhatsAppPostingMode;
    lifecycle: WhatsAppGroupLifecycle;
    isDynamic?: boolean;
    namePattern?: string;
    defaultInviteUrl?: string;
    allowedBroadcastTypes: Array<'daily_update' | 'pitch_announcement' | 'deal_prep' | 'commitment_nudge'>;
}

export const WHATSAPP_GROUPS_MANIFEST: Record<'MEMBERS' | 'DEAL_PREP' | 'COMPANY_SYNDICATE', WhatsAppPresetGroupDefinition> = {
    MEMBERS: {
        id: 'network_members',
        key: 'MEMBERS',
        name: 'Network Members',
        tier: 1,
        tierTitle: 'Tier 1: Network Announcements',
        description: 'Global announcements for upcoming pitches, community milestones, funding deadlines, and daily active deal tallies.',
        audience: 'All verified members (members, associates, admins).',
        postingMode: 'announcement_only',
        lifecycle: 'permanent',
        allowedBroadcastTypes: ['daily_update', 'pitch_announcement'],
    },
    DEAL_PREP: {
        id: 'deal_prep',
        key: 'DEAL_PREP',
        name: 'Deal Prep',
        tier: 2,
        tierTitle: 'Tier 2: Diligence & Dealflow Prep',
        description: 'Incoming staged deals, pre-pitch deck reviews, preliminary founder Q&A, founder backgrounders, and pre-event diligence discussion.',
        audience: 'Investors evaluating upcoming pipeline deals, diligence leads, and presenting founders.',
        postingMode: 'open_discussion',
        lifecycle: 'standing',
        allowedBroadcastTypes: ['deal_prep', 'pitch_announcement'],
    },
    COMPANY_SYNDICATE: {
        id: 'deal_syndicate',
        key: 'COMPANY_SYNDICATE',
        name: 'Deal-<company-name>',
        tier: 3,
        tierTitle: 'Tier 3: Company Syndicate Channel',
        description: 'Confidential SPV closing channel for term sheet review, wire instructions, allocation tracking, and post-commitment execution.',
        audience: 'Investors who have committed minimum ticket ($3k USD / ₹3L INR) to the company.',
        postingMode: 'committed_syndicate_only',
        lifecycle: 'per_company',
        isDynamic: true,
        namePattern: 'Deal-<company-name>',
        allowedBroadcastTypes: ['commitment_nudge'],
    },
};

/**
 * Returns an array of all preset groups in the manifest.
 */
export function getAllPresetWhatsAppGroups(): WhatsAppPresetGroupDefinition[] {
    return Object.values(WHATSAPP_GROUPS_MANIFEST);
}

/**
 * Finds a preset WhatsApp group definition by channel tier (1, 2, or 3).
 */
export function getWhatsAppGroupByTier(tier: WhatsAppChannelTier): WhatsAppPresetGroupDefinition | undefined {
    return getAllPresetWhatsAppGroups().find(group => group.tier === tier);
}

/**
 * Finds a preset WhatsApp group definition by its unique identifier.
 */
export function getWhatsAppGroupById(id: string): WhatsAppPresetGroupDefinition | undefined {
    return getAllPresetWhatsAppGroups().find(group => group.id === id);
}

/**
 * Resolves the display group name for a given tier.
 * For Tier 3, formats with the company name (e.g. Deal-AcmeRobotics).
 */
export function resolveWhatsAppGroupName(tier: WhatsAppChannelTier, companyName?: string): string {
    const group = getWhatsAppGroupByTier(tier);
    if (!group) return '';

    if (group.isDynamic && companyName) {
        const sanitized = companyName
            .trim()
            .replace(/[^a-zA-Z0-9-]/g, '')
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
        return `Deal-${sanitized}`;
    }

    return group.name;
}

