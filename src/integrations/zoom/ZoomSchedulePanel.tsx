import React from 'react';
import { Video, Calendar, Clock, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import type { ZoomAutoRecordingMode, ZoomSchedulePanelProps } from './types';

/**
 * Reusable dark-first Zoom meeting scheduling and link management panel.
 * Container 3: Integrations (Zoom)
 */
export const ZoomSchedulePanel: React.FC<ZoomSchedulePanelProps> = ({
    meeting,
    topic = '',
    onTopicChange,
    date = '',
    onDateChange,
    time = '',
    onTimeChange,
    durationMinutes = 60,
    onDurationChange,
    autoRecording = 'cloud',
    onAutoRecordingChange,
    scheduling = false,
    syncing = false,
    onSchedule,
    onSync,
    title = 'Zoom Meeting & Scheduling',
    subtitle = 'Configure meeting details, auto-recording, and participant join links.',
    className = '',
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyJoinUrl = async () => {
        if (!meeting?.joinUrl || typeof navigator === 'undefined' || !navigator.clipboard) return;
        await navigator.clipboard.writeText(meeting.joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header Strip */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-400" />
                        <span>{title}</span>
                        {meeting?.meetingId && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                ID: {meeting.meetingId}
                            </span>
                        )}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">{subtitle}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {onSync && meeting?.meetingId && (
                        <button
                            type="button"
                            onClick={onSync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
                        </button>
                    )}
                    {onSchedule && (
                        <button
                            type="button"
                            onClick={onSchedule}
                            disabled={scheduling}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                        >
                            <Video className="w-3.5 h-3.5" />
                            <span>{scheduling ? 'Scheduling...' : meeting?.meetingId ? 'Update Meeting' : 'Schedule Zoom'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Active Meeting Link Banner */}
            {meeting?.joinUrl && (
                <div className="p-3.5 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-400">Join URL</div>
                        <div className="text-xs sm:text-sm text-blue-300 truncate font-mono mt-0.5">{meeting.joinUrl}</div>
                        {meeting.passcode && (
                            <div className="text-xs text-neutral-400 mt-1">
                                Passcode: <span className="text-white font-mono">{meeting.passcode}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleCopyJoinUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy Link'}</span>
                        </button>
                        <a
                            href={meeting.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Join</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Schedule Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Meeting Topic</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => onTopicChange?.(e.target.value)}
                        placeholder="Quarterly Planning & Product Review"
                        className="w-full px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Date</span>
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange?.(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Start Time</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => onTimeChange?.(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Duration (minutes)</label>
                    <select
                        value={durationMinutes}
                        onChange={(e) => onDurationChange?.(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Auto Recording</label>
                    <select
                        value={autoRecording}
                        onChange={(e) => onAutoRecordingChange?.(e.target.value as ZoomAutoRecordingMode)}
                        className="w-full px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="cloud">Cloud Recording</option>
                        <option value="local">Local Recording</option>
                        <option value="none">Disabled</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ZoomSchedulePanel;
