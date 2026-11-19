import React, { useState } from 'react';
import type {
    WhatsAppBroadcastConsoleProps,
    WhatsAppBroadcastType
} from './types';
import {
    createBroadcastIntent,
    formatDealGroupName,
    formatWhatsAppGroupUrl
} from './linkBuilder';
import { CopyButton } from '../../ui/primitives/CopyButton';
import {
    MessageSquare,
    TrendingUp,
    Calendar,
    Clock,
    FileText,
    ExternalLink,
    Send,
    Sparkles,
    Shield
} from 'lucide-react';

export const WhatsAppBroadcastConsole: React.FC<WhatsAppBroadcastConsoleProps> = ({
    event,
    className = ''
}) => {
    const [selectedTab, setSelectedTab] = useState<WhatsAppBroadcastType>('daily_update');

    const startupName = event.companyName;
    const dealSlug = event.slug || event.companyName;
    const pitchYear = event.pitchDate
        ? (event.pitchDate instanceof Date ? event.pitchDate.getFullYear() : new Date(event.pitchDate).getFullYear())
        : new Date().getFullYear();

    const canonicalGroup = formatDealGroupName(dealSlug, pitchYear);
    const normalizedGroupUrl = formatWhatsAppGroupUrl(event.commitmentConfig?.whatsappGroupUrl);

    // Calculate days remaining if deadline exists
    let daysRemaining: number | undefined;
    if (event.commitmentConfig?.deadline) {
        const deadlineDate = new Date(event.commitmentConfig.deadline);
        const diffMs = deadlineDate.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const currentSnippet = createBroadcastIntent({
        type: selectedTab,
        startupName,
        dealSlug,
        pitchDate: event.pitchDate,
        pitchTime: event.pitchTime,
        dealRoomUrl: event.dealShareUrl,
        totalCommittedUsd: event.commitmentConfig?.totalCommittedUsd,
        totalCommittedInr: event.commitmentConfig?.totalCommittedInr,
        totalCommitters: event.commitmentConfig?.totalCommitters,
        targetThresholdUsd: event.commitmentConfig?.targetThresholdUsd,
        daysRemaining,
        whatsappGroupUrl: normalizedGroupUrl,
        dealLeadName: event.dealLead,
        dealLeadPhone: event.dealLeadPhone,
        sector: event.sector,
        pitchDeckUrl: event.pitchDeckUrl
    });

    const tabs: Array<{ id: WhatsAppBroadcastType; label: string; icon: React.ReactNode }> = [
        {
            id: 'daily_update',
            label: 'Daily Progress',
            icon: <TrendingUp className="w-3.5 h-3.5" />
        },
        {
            id: 'deal_prep',
            label: 'Deal Prep',
            icon: <FileText className="w-3.5 h-3.5" />
        },
        {
            id: 'pitch_announcement',
            label: 'Pitch Invite',
            icon: <Calendar className="w-3.5 h-3.5" />
        },
        {
            id: 'commitment_nudge',
            label: 'Closing Nudge',
            icon: <Clock className="w-3.5 h-3.5" />
        }
    ];

    return (
        <div className={`p-5 sm:p-6 rounded-2xl bg-surface-panel/90 border border-emerald-500/25 shadow-xl space-y-5 text-left ${className}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Syndicate Communications</span>
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Broadcast Dispatch Manager</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
                            {canonicalGroup}
                        </span>
                    </h4>
                </div>

                <div className="flex items-center gap-2">
                    <CopyButton
                        text={canonicalGroup}
                        showLabel={true}
                        label="Copy Group Name"
                        className="!py-1.5 !px-2.5 !text-xs !bg-white/[0.04] !border-white/10 hover:!bg-white/[0.08] !text-neutral-300"
                    />
                </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedTab === tab.id
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                                : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Message Preview Box */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Formatted Broadcast Snippet:</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                        WhatsApp Markdown Ready
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-emerald-100 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all max-h-60 overflow-y-auto">
                    {currentSnippet.body}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Out-of-band broadcast to GA Members / Deal Prep lists</span>
                </div>

                <div className="flex items-center gap-2">
                    <CopyButton
                        text={currentSnippet.body}
                        showLabel={true}
                        label="Copy Snippet"
                        className="!py-2 !px-3.5 !text-xs !bg-white/[0.04] !border-white/10 hover:!bg-white/[0.08] !text-white"
                    />

                    <a
                        href={currentSnippet.intentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Open in WhatsApp</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                    </a>
                </div>
            </div>
        </div>
    );
};
