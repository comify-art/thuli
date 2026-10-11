import { Metric, TrendDirection } from '../types';

export interface TrendInfo {
    direction: TrendDirection | 'NO CHANGE';
    diff: number;
    text: string;
    className: string;
    isGood: boolean;
    hasData: boolean;
}

export const getTrendInfo = (
    metric: Metric,
    currentValue: number | undefined,
    previousValue: number | null | undefined
): TrendInfo => {
    if (currentValue === undefined || previousValue === null || previousValue === undefined) {
        return {
            direction: 'NO CHANGE',
            diff: 0,
            text: 'No previous data',
            className: 'text-gray-600',
            isGood: false,
            hasData: false
        };
    }

    const diff = currentValue - previousValue;
    const absoluteDiff = Math.abs(diff);
    const direction = diff > 0 ? 'UP' : (diff < 0 ? 'DOWN' : 'NO CHANGE');

    if (direction === 'NO CHANGE') {
        return {
            direction,
            diff: 0,
            text: 'No change',
            className: 'text-yellow-500', // Slightly darker than yellow-400 for better visibility? keeping consistent with design
            isGood: true, // Neutral is "good" enough not to be red
            hasData: true
        };
    }

    // Determine if the change is "Good"
    // UP is good if trendDirection is UP (or default)
    // DOWN is good if trendDirection is DOWN
    // We need to check the metric definition. Assuming default 'UP' is good if not specified? 
    // Actually the metric type usually has trendDirection.
    const isGood = (metric.trendDirection === 'DOWN' && diff < 0) ||
        (metric.trendDirection === 'UP' && diff > 0) ||
        (!metric.trendDirection && diff > 0); // Default to UP is good

    const className = isGood ? 'text-[var(--accent-color)]' : 'text-red-400';
    const text = `${direction} by ${absoluteDiff}`;

    return {
        direction,
        diff,
        text,
        className,
        isGood,
        hasData: true
    };
};
