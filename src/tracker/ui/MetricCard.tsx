import React from 'react';
import { Metric } from '../types';
import { getTrendInfo, TrendInfo } from '../utils/trendUtils';

interface MetricCardProps {
    metric: Metric;
    currentValue: number;
    previousValue: number | null | undefined;
    trendHistory: (TrendInfo | null)[];
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, currentValue, previousValue, trendHistory }) => {
    const trendInfo = getTrendInfo(metric, currentValue, previousValue);

    return (
        <div
            className="p-5 rounded-xl shadow-md bg-[var(--card-bg)] border-l-4 transition-transform hover:-translate-y-1 flex flex-col justify-between h-full"
            style={{ borderLeftColor: metric.color }}
        >
            <div>
                <h3 className="text-lg font-semibold mb-1 text-gray-100">
                    {metric.name}
                </h3>
                <p className="text-sm text-gray-400 mb-1 h-10 line-clamp-2">{metric.description}</p>

                <div className="flex justify-between items-center mb-2">
                    <div className="text-3xl font-bold text-white">
                        {currentValue}
                    </div>

                    <p className={`text-sm italic font-medium ${trendInfo.className}`}>
                        {trendInfo.text}
                        {trendInfo.hasData && (
                            <span className="text-gray-500 font-normal ml-1">({previousValue} → {currentValue})</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Bottom Line: 10-day Trend Visualization */}
            <div className="flex gap-1 justify-end items-end h-3 pt-1 border-t border-gray-700/50 mt-auto pt-2">
                {/* Re-use Trend Sparkline Logic */}
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
