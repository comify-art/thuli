import React from 'react';
import { Sparkles, RefreshCw, ExternalLink, Save } from 'lucide-react';
import type { ZoomRecordingPanelProps } from './types';

/**
 * Reusable dark-first Zoom Cloud Recording & AI Summary editor panel.
 * Container 3: Integrations (Zoom)
 */
export const ZoomRecordingPanel: React.FC<ZoomRecordingPanelProps> = ({
    recordingUrl,
    onRecordingUrlChange,
    recordingPasscode,
    onRecordingPasscodeChange,
    recordingSummary,
    onRecordingSummaryChange,
    watchUrl,
    syncing = false,
    saving = false,
    onSync,
    onSave,
    title = 'Zoom Cloud Recording & AI Summary',
    subtitle = 'Import recording URL, passcode, and AI summary automatically or enter below.',
    className = '',
}) => {
    const resolvedWatchUrl = watchUrl || recordingUrl;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Sync Action Strip */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>{title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">{subtitle}</p>
                </div>
                {onSync && (
                    <button
                        type="button"
                        onClick={onSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                        <span>{syncing ? 'Syncing...' : 'Sync from Zoom'}</span>
                    </button>
                )}
            </div>

            {/* Recording URL */}
            <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Cloud Recording Share URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="url"
                        value={recordingUrl}
                        onChange={(e) => onRecordingUrlChange(e.target.value)}
                        placeholder="https://zoom.us/rec/share/..."
                        className="flex-1 px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                    {resolvedWatchUrl && (
                        <a
                            href={resolvedWatchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium shrink-0"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Watch</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Recording Passcode */}
            <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Recording Passcode (optional)
                </label>
                <input
                    type="text"
                    value={recordingPasscode}
                    onChange={(e) => onRecordingPasscodeChange(e.target.value)}
                    placeholder="e.g. aB3$k9"
                    className="w-full sm:w-64 px-3.5 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                />
            </div>

            {/* AI Summary */}
            <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    AI Meeting Summary / Key Takeaways
                </label>
                <textarea
                    rows={5}
                    value={recordingSummary}
                    onChange={(e) => onRecordingSummaryChange(e.target.value)}
                    placeholder="Key discussion points, action items, and next steps..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-y"
                />
            </div>

            {/* Save CTA */}
            {onSave && (
                <div className="flex justify-end pt-1">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save Recording Details'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ZoomRecordingPanel;
