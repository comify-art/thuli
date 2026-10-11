export type TrendDirection = 'UP' | 'DOWN';

export interface Metric {
    id: string;
    name: string;
    description: string;
    trendDirection: TrendDirection;
    color?: string; // Optional override, otherwise auto-assigned by group index
}

export interface MetricGroup {
    id: string;
    name: string;
    metrics: Metric[];
}

// Map of date (YYYY-MM-DD) -> { metricId: value }
export type DailyEntries = Record<string, Record<string, number>>;

export interface TrackerData {
    groups: MetricGroup[];
    entries: DailyEntries;
}
