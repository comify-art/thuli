import React, { useState } from 'react';
import type { WhatsAppSyndicateCardProps } from './types';
import {
    formatDealGroupName,
    formatWhatsAppGroupUrl,
    createSyndicateCommitmentIntent
} from './linkBuilder';
import { CopyButton } from '../../ui/primitives/CopyButton';
import {
    MessageSquare,
    ExternalLink,
    QrCode,
    ShieldCheck,
    Send,
    UserCheck,
    CheckCircle2
} from 'lucide-react';

export const WhatsAppSyndicateCard: React.FC<WhatsAppSyndicateCardProps> = ({
    groupInviteUrl,
    startupName,
    startupSlug,
    pitchYear = new Date().getFullYear(),
    prefix = 'GA-Deal-',
    dealLeadName = 'Deal Lead',
    dealLeadPhone,
    dealLeadEmail,
    committedAmount,
    currency = 'USD',
    investorName = 'Committed Angel',
    batchYear,
    className = '',
    showQrDefault = false
}) => {
    const [showQr, setShowQr] = useState(showQrDefault);

    const canonicalGroupName = formatDealGroupName(
        startupSlug || startupName,
        pitchYear,
        prefix
    );

    const normalizedGroupUrl = formatWhatsAppGroupUrl(groupInviteUrl);

    const leadIntentUrl = createSyndicateCommitmentIntent({
        phoneNumber: dealLeadPhone,
        startupName,
        investorName,
        committedAmount: committedAmount || 3000,
        currency,
        batchYear,
        dealSlug: startupSlug || startupName,
        pitchYear,
        prefix
    });

    const qrCodeImageUrl = normalizedGroupUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(normalizedGroupUrl)}`
        : '';

    return (
        <div
            className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0A1612] via-[#0E1F1A] to-[#0A1612] border border-emerald-500/30 shadow-xl shadow-emerald-950/25 backdrop-blur-md space-y-4 text-left transition-all ${className}`}
        >
            {/* Header: WhatsApp Brand Indicator & Group Name */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <MessageSquare className="w-4 h-4 fill-emerald-500/20" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Private Syndicate Channel</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            {canonicalGroupName}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {normalizedGroupUrl && (
                        <CopyButton
                            text={normalizedGroupUrl}
                            showLabel={true}
                            label="Copy Link"
                            className="!py-1.5 !px-2.5 !text-xs !bg-emerald-950/60 !border-emerald-500/30 hover:!bg-emerald-900/60 !text-emerald-200"
                        />
                    )}
                </div>
            </div>

            {/* Committed Amount Confirmation Badge (if provided) */}
            {committedAmount !== undefined && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="text-emerald-200/80 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Verified Syndicate Allocation:</span>
                    </span>
                    <span className="font-bold text-emerald-300">
                        {currency === 'USD'
                            ? `$${committedAmount.toLocaleString()} USD`
                            : `₹${committedAmount.toLocaleString()} INR`}
                    </span>
                </div>
            )}

            {/* Description */}
            <p className="text-xs text-neutral-300 leading-relaxed">
                Connect directly with the founder, Deal Lead, and fellow committed investors for time-sensitive due diligence, legal SPV subscription packets, and bank wire settlement updates.
            </p>

            {/* Actions Grid */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {normalizedGroupUrl ? (
                    <a
                        href={normalizedGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Join Syndicate WhatsApp Group</span>
                        <ExternalLink className="w-3 h-3 opacity-75 ml-0.5" />
                    </a>
                ) : (
                    <div className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/80">
                        Group invite link being provisioned by Deal Lead. Reach out via WhatsApp below:
                    </div>
                )}

                <a
                    href={leadIntentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                    title={`Send pre-filled commitment verification to ${dealLeadName}`}
                >
                    <Send className="w-3 h-3 text-emerald-400" />
                    <span>Message Deal Lead</span>
                </a>

                {normalizedGroupUrl && (
                    <button
                        type="button"
                        onClick={() => setShowQr(prev => !prev)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                            showQr
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.08]'
                        }`}
                        title="Toggle Mobile QR Code"
                        aria-label="Toggle Mobile QR Code"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Optional Expandable QR Code Card */}
            {normalizedGroupUrl && showQr && (
                <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/15">
                    <div className="p-2 bg-white rounded-lg shadow-inner shrink-0">
                        <img
                            src={qrCodeImageUrl}
                            alt={`Scan QR code to join ${canonicalGroupName}`}
                            className="w-28 h-28 object-contain"
                            loading="lazy"
                        />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[11px] font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                            <QrCode className="w-3 h-3 text-emerald-400" />
                            <span>Scan with Phone Camera</span>
                        </span>
                        <p className="text-[11px] text-neutral-300 leading-snug">
                            Open your phone's camera or WhatsApp scanner to open <strong>{canonicalGroupName}</strong> immediately without typing on desktop.
                        </p>
                    </div>
                </div>
            )}

            {/* Footer Attribution / Lead Contact */}
            <div className="pt-2 text-[10px] text-neutral-400 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1 text-neutral-400">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>Deal Lead: <strong>{dealLeadName}</strong></span>
                </span>
                {dealLeadEmail && (
                    <span className="text-neutral-500">{dealLeadEmail}</span>
                )}
            </div>
        </div>
    );
};
