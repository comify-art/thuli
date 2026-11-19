import React from 'react';
import { Metric } from '../types';
import { getTrendInfo, TrendInfo } from '../utils/trendUtils';

interface MetricRowProps {
    metric: Metric;
    currentValue: number;
    previousValue: number | null | undefined;
    trendHistory: (TrendInfo | null)[]; // Array of 10 items for the last 10 days
}

export const MetricRow: React.FC<MetricRowProps> = ({ metric, currentValue, previousValue, trendHistory }) => {
    const trendInfo = getTrendInfo(metric, currentValue, previousValue);

    return (
        <div className="p-3 bg-[var(--card-bg)] rounded-xl border-l-4 mb-3 shadow-sm hover:bg-slate-800 transition-colors" style={{ borderLeftColor: metric.color }}>
            {/* Top Line: Name | Value | Trend Text */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-200">{metric.name}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-xl font-bold text-white block leading-none">{currentValue}</span>
                    </div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full border border-transparent ${trendInfo.isGood ? 'bg-green-600/90 text-white' : (trendInfo.direction === 'NO CHANGE' ? 'bg-yellow-600/90 text-white' : 'bg-red-600/90 text-white')}`}>
                        {trendInfo.hasData ? (
                            <>
                                {trendInfo.direction === 'UP' && '↑'}
                                {trendInfo.direction === 'DOWN' && '↓'}
                                {trendInfo.direction === 'NO CHANGE' && '-'}
                                {' '}{Math.abs(trendInfo.diff)}
                            </>
                        ) : '-'}
                    </div>
                </div>
            </div>

            {/* Bottom Line: 10-day Trend Visualization */}
            <div className="flex gap-1 mt-4 justify-end items-end h-3 pt-1">
                {/* We expect exactly 10 items in trendHistory */}
                {trendHistory.map((dayTrend, idx) => {
                    let bgColor = 'bg-slate-700/30'; // Default empty
                    if (dayTrend) {
                        if (dayTrend.direction === 'NO CHANGE') {
                            bgColor = 'bg-yellow-500/50';
                        } else {
                            bgColor = dayTrend.isGood ? 'bg-[var(--accent-color)]' : 'bg-red-500';
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-[2px] ${bgColor} transition-all duration-300 hover:scale-110`}
                            title={dayTrend ? `${dayTrend.text}` : 'No data'}
                        />
                    );
                })}
            </div>
        </div>
    );
};
