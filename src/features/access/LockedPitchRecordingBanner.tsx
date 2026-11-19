import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AccessGateCard } from './AccessGateCard';

export interface LockedPitchRecordingBannerProps {
    title?: string;
    message?: string;
    sessionTitle?: string;
    sessionDate?: string;
    onUpgradeClick?: () => void;
    onPolicyClick?: () => void;
    upgradeUrl?: string;
    policyUrl?: string;
    className?: string;
}

/**
 * Branded Locked Recording Banner presented to guests, non-members, and founders
 * when attempting to access confidential startup pitch recordings.
 * Backed by canonical <AccessGateCard>.
 */
export const LockedPitchRecordingBanner: React.FC<LockedPitchRecordingBannerProps> = ({
    title = 'Members Only Recording',
    message = 'This startup pitch recording and associated pitch summary are strictly confidential to verified members.',
    sessionTitle,
    sessionDate,
    onUpgradeClick,
    onPolicyClick,
    upgradeUrl = '/join?plan=member',
    policyUrl = '/ethics',
    className = '',
}) => {
    return (
        <AccessGateCard
            title={title}
            message={message}
            badgeLabel="Confidential"
            badgeSubtext={sessionDate ? `Session: ${sessionDate}` : undefined}
            subtitle={sessionTitle ? `Pitch Topic: ${sessionTitle}` : undefined}
            variant="gold"
            role="alert"
            className={className}
            primaryAction={{
                label: 'Upgrade to Full Membership',
                onClick: onUpgradeClick,
                href: upgradeUrl,
                external: true,
            }}
            secondaryAction={{
                label: 'Diligence Policy & Ethics',
                onClick: onPolicyClick,
                href: policyUrl,
                external: true,
                icon: onPolicyClick ? null : <ExternalLink className="w-3 h-3 text-neutral-500" />,
            }}
        />
    );
};

export default LockedPitchRecordingBanner;
