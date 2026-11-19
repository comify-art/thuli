import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoleGate, isRoleAuthorized } from '../RoleGate';
import { LockedPitchRecordingBanner } from '../LockedPitchRecordingBanner';

describe('isRoleAuthorized helper', () => {
    it('authorizes admin, member, and associate_member for minRole="member"', () => {
        expect(isRoleAuthorized('admin', 'member')).toBe(true);
        expect(isRoleAuthorized('member', 'member')).toBe(true);
        expect(isRoleAuthorized('associate_member', 'member')).toBe(true);
    });

    it('denies founders, guests, and unknown roles for minRole="member"', () => {
        expect(isRoleAuthorized('founder', 'member')).toBe(false);
        expect(isRoleAuthorized('guest', 'member')).toBe(false);
        expect(isRoleAuthorized('', 'member')).toBe(false);
        expect(isRoleAuthorized(null, 'member')).toBe(false);
        expect(isRoleAuthorized(undefined, 'member')).toBe(false);
    });

    it('requires admin when minRole="admin"', () => {
        expect(isRoleAuthorized('admin', 'admin')).toBe(true);
        expect(isRoleAuthorized('member', 'admin')).toBe(false);
        expect(isRoleAuthorized('associate_member', 'admin')).toBe(false);
        expect(isRoleAuthorized('founder', 'admin')).toBe(false);
    });

    it('respects explicit allowedRoles list', () => {
        expect(isRoleAuthorized('founder', 'member', ['founder', 'admin'])).toBe(true);
        expect(isRoleAuthorized('member', 'member', ['founder', 'admin'])).toBe(false);
    });
});

describe('RoleGate component', () => {
    it('renders children when caller role is authorized', () => {
        render(
            <RoleGate minRole="member" userRole="member">
                <div data-testid="protected-content">Confidential Recording</div>
            </RoleGate>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Confidential Recording')).toBeInTheDocument();
    });

    it('renders fallback when caller is unauthorized and showLockedBanner is false', () => {
        render(
            <RoleGate
                minRole="member"
                userRole="founder"
                fallback={<div data-testid="fallback-notice">Access Restricted</div>}
            >
                <div data-testid="protected-content">Confidential Recording</div>
            </RoleGate>
        );

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback-notice')).toBeInTheDocument();
    });

    it('renders LockedPitchRecordingBanner when unauthorized and showLockedBanner is true', () => {
        render(
            <RoleGate
                minRole="member"
                userRole="founder"
                showLockedBanner={true}
                bannerTitle="Pitch Archive (Members Only)"
            >
                <div data-testid="protected-content">Confidential Recording</div>
            </RoleGate>
        );

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Pitch Archive (Members Only)')).toBeInTheDocument();
    });
});

describe('LockedPitchRecordingBanner component', () => {
    it('renders banner with default title, description, and action links', () => {
        render(
            <LockedPitchRecordingBanner
                sessionTitle="AI Robotics Series Seed"
                sessionDate="Nov 15, 2026"
            />
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Members Only Recording')).toBeInTheDocument();
        expect(screen.getByText('Pitch Topic: AI Robotics Series Seed')).toBeInTheDocument();
        expect(screen.getByText('Session: Nov 15, 2026')).toBeInTheDocument();
        expect(screen.getByText('Upgrade to Full Membership')).toBeInTheDocument();
    });

    it('triggers onUpgradeClick when Upgrade button is clicked', () => {
        const handleUpgrade = vi.fn();
        render(<LockedPitchRecordingBanner onUpgradeClick={handleUpgrade} />);

        const upgradeBtn = screen.getByRole('button', { name: /Upgrade to Full Membership/i });
        fireEvent.click(upgradeBtn);
        expect(handleUpgrade).toHaveBeenCalledTimes(1);
    });

    it('triggers onPolicyClick when Policy button is clicked', () => {
        const handlePolicy = vi.fn();
        render(<LockedPitchRecordingBanner onPolicyClick={handlePolicy} />);

        const policyBtn = screen.getByRole('button', { name: /Diligence Policy & Ethics/i });
        fireEvent.click(policyBtn);
        expect(handlePolicy).toHaveBeenCalledTimes(1);
    });
});

