import React from 'react';
import { MetricGroup, DailyEntries } from '../types';
import { MetricCard } from './MetricCard';
import { MetricRow } from './MetricRow';
import { getTrendInfo } from '../utils/trendUtils';
import { shareContent } from '../../utils/shareUtils';
import { Share2 } from 'lucide-react';

interface DashboardProps {
    groups: MetricGroup[];
    entries: DailyEntries;
    version?: string;
}

// Helper to parse YYYY-MM-DD as local date to prevent timezone shifts
const formatSafeDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, options);
};

export const Dashboard: React.FC<DashboardProps> = ({ groups, entries, version = 'v1.0.0' }) => {
    const [viewMode, setViewMode] = React.useState<'full' | 'compact'>('compact');

    // Get sorted dates to find latest and previous
    const dates = Object.keys(entries).sort();
    const latestDate = dates[dates.length - 1];
    const previousDate = dates[dates.length - 2];

    if (!latestDate) {
        return (
            <div className="text-center py-10 bg-[var(--card-bg)] rounded-lg">
                <p className="text-gray-400 text-lg">No data saved yet. Enter today's values to get started.</p>
            </div>
        );
    }

    const latestEntry = entries[latestDate];
    const previousEntry = previousDate ? entries[previousDate] : {};

    // Helper to get last 10 days trend info for a metric
    const getTrendHistory = (metricId: string, metric: any) => {
        // We need the last 10 days ending at latestDate.
        const historyIndices = [];
        for (let i = 0; i < 10; i++) {
            const idx = dates.length - 1 - i; // 0 is latest, 1 is prev...
            if (idx >= 0) historyIndices.unshift(idx); // unshift to keep chronological order
        }

        // Pad if less than 10
        while (historyIndices.length < 10) {
            historyIndices.unshift(-1); // -1 indicates no data
        }

        return historyIndices.map(dateIdx => {
            if (dateIdx === -1) return null;

            const currentDate = dates[dateIdx];
            const prevDate = dateIdx > 0 ? dates[dateIdx - 1] : null;

            const currentVal = entries[currentDate][metricId];
            if (currentVal === undefined) return null;

            const prevVal = prevDate ? entries[prevDate][metricId] : undefined;
            return getTrendInfo(metric, currentVal, prevVal ?? null);
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-6">
                <h2 className="text-sm font-medium text-gray-500">
                    as of {formatSafeDate(latestDate, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </h2>
                {previousDate && (
                    <span className="text-xs text-gray-600">
                        Vs {formatSafeDate(previousDate, { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>

            {groups.map(group => {
                const handleShare = () => {
                    const lines = [`${group.name} - ${formatSafeDate(latestDate)}`];
                    lines.push(''); // spacer

                    group.metrics.forEach(metric => {
                        const val = latestEntry[metric.id];
                        if (val !== undefined) {
                            const prev = previousEntry[metric.id];
                            const trend = getTrendInfo(metric, val, prev);
                            let arrow = '';
                            if (trend.direction === 'UP') arrow = '↑';
                            if (trend.direction === 'DOWN') arrow = '↓';

                            lines.push(`${metric.name}: ${val} ${arrow}`);
                        }
                    });

                    lines.push('');
                    lines.push(` - Tracker v${version}`);

                    shareContent({
                        title: `Metrics: ${group.name}`,
                        text: lines.join('\n')
                    });
                };

                return (
                    <div key={group.id} className="space-y-4 border-gray-900">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-[var(--accent-color)]">{group.name}</h3>
                            <button
                                onClick={handleShare}
                                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label={`Share ${group.name}`}
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className={`${viewMode === 'full' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-2'}`}>
                            {group.metrics.map(metric => {
                                const value = latestEntry[metric.id];
                                if (value === undefined) return null;

                                if (viewMode === 'full') {
                                    return (
                                        <MetricCard
                                            key={metric.id}
                                            metric={metric}
                                            currentValue={value}
                                            previousValue={previousEntry[metric.id]}
                                            trendHistory={getTrendHistory(metric.id, metric)}
                                        />
                                    );
                                } else {
                                    return (
                                        <MetricRow
                                            key={metric.id}
                                            metric={metric}
                                            currentValue={value}
                                            previousValue={previousEntry[metric.id]}
                                            trendHistory={getTrendHistory(metric.id, metric)}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </div>
                );
            })}

            {/* View Toggle */}
            <div className="flex justify-left pl-4 pt-8 border-t border-gray-800">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setViewMode('compact')}
                        className={`px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors
                            ${viewMode === 'compact'
                                ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)]'
                                : 'bg-transparent text-gray-400 border-gray-600 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        Compact
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('full')}
                        className={`px-4 py-2 text-sm font-medium border rounded-r-lg transition-colors
                            ${viewMode === 'full'
                                ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)]'
                                : 'bg-transparent text-gray-400 border-gray-600 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        Cards
                    </button>
                </div>
            </div>
        </div>
    );
};
