export interface WhatsAppIntentParams {
    phoneNumber?: string; // Deal Lead phone in E.164 format (e.g. +14155552671)
    startupName: string;
    investorName: string;
    committedAmount: number;
    currency: 'USD' | 'INR';
    batchYear?: string;
    dealSlug?: string;
    pitchYear?: number;
    prefix?: string; // Optional prefix override (defaults to "GA-Deal-")
}

export type WhatsAppBroadcastType = 'daily_update' | 'pitch_announcement' | 'commitment_nudge' | 'deal_prep';

export interface WhatsAppDealSummary {
    startupName: string;
    roundName?: string;
    dealSlug?: string;
    dealRoomUrl?: string;
    totalCommittedUsd?: number;
    totalCommittedInr?: number;
    totalCommitters?: number;
    targetThresholdUsd?: number;
    sector?: string;
}

export interface WhatsAppBroadcastParams {
    type: WhatsAppBroadcastType;
    startupName: string;
    roundName?: string;
    dealSlug?: string;
    deals?: WhatsAppDealSummary[];
    pitchDate?: string | Date;
    pitchTime?: string;
    zoomUrl?: string;
    icsUrl?: string;
    dealRoomUrl?: string;
    totalCommittedUsd?: number;
    totalCommittedInr?: number;
    totalCommitters?: number;
    targetThresholdUsd?: number;
    daysRemaining?: number;
    founderBio?: string;
    highlights?: string[];
    whatsappGroupUrl?: string;
    dealLeadName?: string;
    dealLeadPhone?: string;
    sector?: string;
    pitchDeckUrl?: string;
    notes?: string;
    description?: string;
    prefix?: string;
}

export interface WhatsAppBroadcastSnippet {
    type: WhatsAppBroadcastType;
    title: string;
    headline: string;
    body: string;
    intentUrl: string;
}

export interface WhatsAppSyndicateCardProps {
    groupInviteUrl?: string;
    startupName: string;
    startupSlug?: string;
    pitchYear?: number;
    prefix?: string; // Defaults to "GA-Deal-"
    dealLeadName?: string;
    dealLeadPhone?: string;
    dealLeadEmail?: string;
    committedAmount?: number;
    currency?: 'USD' | 'INR';
    investorName?: string;
    batchYear?: string;
    className?: string;
    showQrDefault?: boolean;
}

export interface WhatsAppBroadcastConsoleProps {
    event: {
        companyName: string;
        slug?: string;
        pitchDate?: string | Date;
        pitchTime?: string;
        dealLead?: string;
        dealLeadPhone?: string;
        dealShareUrl?: string;
        sector?: string;
        pitchDeckUrl?: string;
        commitmentConfig?: {
            totalCommittedUsd?: number;
            totalCommittedInr?: number;
            totalCommitters?: number;
            targetThresholdUsd?: number;
            deadline?: string | Date;
            whatsappGroupUrl?: string;
        };
    };
    className?: string;
}

