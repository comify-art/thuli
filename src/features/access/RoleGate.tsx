import React from 'react';
import { useAuthSession } from './useAuthSession';
import { LockedPitchRecordingBanner } from './LockedPitchRecordingBanner';

export type AllowedUserRole = 'admin' | 'member' | 'associate_member' | 'founder' | string;

export interface RoleGateProps {
    /**
     * Minimum role required for access.
     * Hierarchy:
     * - 'admin': requires admin
     * - 'member' or 'associate_member': allows admin, member, or associate_member (excludes founder and guests)
     */
    minRole?: 'admin' | 'member' | 'associate_member';
    /**
     * Explicit list of allowed roles (overrides minRole check if provided).
     */
    allowedRoles?: AllowedUserRole[];
    /**
     * Caller role provided explicitly (optional).
     */
    userRole?: string | null;
    /**
     * Token claims object provided explicitly (optional).
     */
    claims?: Record<string, unknown> | null;
    /**
     * Protected content rendered if caller satisfies role check.
     */
    children: React.ReactNode;
    /**
     * Fallback rendered if caller is unauthorized (ignored if showLockedBanner is true).
     */
    fallback?: React.ReactNode;
    /**
     * When true and caller is unauthorized, renders LockedPitchRecordingBanner.
     */
    showLockedBanner?: boolean;
    bannerTitle?: string;
    bannerMessage?: string;
    sessionTitle?: string;
    sessionDate?: string;
    onUpgradeClick?: () => void;
    onPolicyClick?: () => void;
    upgradeUrl?: string;
    policyUrl?: string;
}

/**
 * Validates whether a given role string satisfies authorization rules.
 */
export function isRoleAuthorized(
    role: string | null | undefined,
    minRole: 'admin' | 'member' | 'associate_member' = 'member',
    allowedRoles?: AllowedUserRole[]
): boolean {
    if (!role) return false;
    const normalizedRole = role.toLowerCase().trim();

    if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles.some((r) => r.toLowerCase().trim() === normalizedRole);
    }

    if (minRole === 'admin') {
        return normalizedRole === 'admin';
    }

    // minRole 'member' or 'associate_member' permits admin, member, or associate_member
    // strictly excluding 'founder', 'guest', or unverified roles
    if (minRole === 'member' || minRole === 'associate_member') {
        return (
            normalizedRole === 'admin' ||
            normalizedRole === 'member' ||
            normalizedRole === 'associate_member'
        );
    }

    return false;
}

/**
 * Access gating component for role-sensitive content, such as startup pitch recordings.
 */
export const RoleGate: React.FC<RoleGateProps> = ({
    minRole = 'member',
    allowedRoles,
    userRole,
    claims,
    children,
    fallback,
    showLockedBanner = false,
    bannerTitle,
    bannerMessage,
    sessionTitle,
    sessionDate,
    onUpgradeClick,
    onPolicyClick,
    upgradeUrl,
    policyUrl,
}) => {
    // Optionally resolve role from session hook if not explicitly passed
    const session = useAuthSession();

    const resolvedRole = (
        userRole ||
        (claims?.role as string) ||
        (claims?.admin ? 'admin' : undefined) ||
        (claims?.member ? 'member' : undefined) ||
        (session.claims?.role as string) ||
        (session.claims?.admin ? 'admin' : undefined) ||
        (session.claims?.member ? 'member' : undefined) ||
        null
    );

    const authorized = isRoleAuthorized(resolvedRole, minRole, allowedRoles);

    if (authorized) {
        return <>{children}</>;
    }

    if (showLockedBanner) {
        return (
            <LockedPitchRecordingBanner
                title={bannerTitle}
                message={bannerMessage}
                sessionTitle={sessionTitle}
                sessionDate={sessionDate}
                onUpgradeClick={onUpgradeClick}
                onPolicyClick={onPolicyClick}
                upgradeUrl={upgradeUrl}
                policyUrl={policyUrl}
            />
        );
    }

    return fallback !== undefined ? <>{fallback}</> : null;
};

