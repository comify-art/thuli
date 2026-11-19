import React, { useState, useRef, useEffect } from 'react';
import type { MinimalAuthUser, AuthSessionClaims } from './useAuthSession';
import { ExternalLink, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

export interface UserProfileMenuProps {
    user: MinimalAuthUser | null;
    claims?: AuthSessionClaims | null;
    portalUrl?: string;
    onLogout?: () => Promise<void> | void;
    className?: string;
}

interface RoleStyleInfo {
    label: string;
    badgeClass: string;
    iconClass: string;
}

const getRoleDetails = (r: string): RoleStyleInfo => {
    switch (r.toLowerCase()) {
        case 'admin':
            return {
                label: 'Administrator',
                badgeClass: 'bg-amber-500/12 text-amber-400 border-amber-500/30',
                iconClass: 'text-amber-500',
            };
        case 'associate_member':
            return {
                label: 'Associate Member',
                badgeClass: 'bg-blue-500/12 text-blue-300 border-blue-500/30',
                iconClass: 'text-blue-400',
            };
        case 'founder':
            return {
                label: 'Startup Founder',
                badgeClass: 'bg-violet-500/12 text-violet-300 border-violet-500/30',
                iconClass: 'text-violet-400',
            };
        default:
            return {
                label: 'Verified Member',
                badgeClass: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
                iconClass: 'text-emerald-400',
            };
    }
};

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
    user,
    claims,
    portalUrl = 'http://localhost:5184/portal',
    onLogout,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Member';
    const initial = (user?.displayName?.[0] || user?.email?.[0] || 'M').toUpperCase();
    const rawRole = (claims?.role as string) || (claims?.admin ? 'admin' : 'member');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const roleInfo = getRoleDetails(rawRole);

    return (
        <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`flex items-center gap-2.5 h-10 pl-1.5 pr-3.5 py-1 rounded-full border border-white/14 shadow-md transition-all cursor-pointer outline-none ${
                    isOpen ? 'bg-[#252529]' : 'bg-[#1a1a1d] hover:bg-[#222226]'
                }`}
            >
                {user?.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={displayName}
                        className="w-[30px] h-[30px] rounded-full object-cover border border-white/20 shrink-0"
                    />
                ) : (
                    <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-black font-bold text-[13px] flex items-center justify-center shrink-0 shadow-sm leading-none">
                        {initial}
                    </div>
                )}

                <span className="text-[13px] font-semibold text-gray-100 max-w-[120px] truncate tracking-tight">
                    {displayName}
                </span>

                <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-[230px] rounded-[18px] bg-[#141418]/98 backdrop-blur-xl border border-white/12 shadow-2xl p-2.5 z-[200]"
                >
                    {/* User Identity Header */}
                    <div className="px-2 pt-1.5 pb-2">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={displayName}
                                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-black font-bold text-[15px] flex items-center justify-center shrink-0 shadow-md leading-none">
                                    {initial}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white m-0 truncate tracking-tight">
                                    {displayName}
                                </p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="inline-flex">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${roleInfo.badgeClass}`}
                            >
                                <ShieldCheck className={`w-3.5 h-3.5 ${roleInfo.iconClass}`} />
                                <span>{roleInfo.label}</span>
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-white/8 my-2" />

                    {/* Actions */}
                    <div className="flex flex-col gap-0.5">
                        <a
                            href={portalUrl}
                            role="menuitem"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-[10px] text-gray-200 hover:text-white hover:bg-white/8 text-[13px] font-medium no-underline transition-colors cursor-pointer"
                        >
                            <span>Open Member Portal</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>

                        {onLogout && (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={async () => {
                                    setIsOpen(false);
                                    await onLogout();
                                }}
                                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/12 text-[13px] font-medium border-none bg-transparent text-left cursor-pointer transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5 text-red-400" />
                                <span>Sign Out</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
