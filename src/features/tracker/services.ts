import { TrackerData, MetricGroup } from './types';

const STORAGE_KEY = 'dailyMetricsData_v2';

export interface TrackerStorage {
    load(): TrackerData;
    save(data: TrackerData): void;
}

export class LocalStorageAdapter implements TrackerStorage {
    load(): TrackerData {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return { groups: [], entries: {} };
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to load tracker data', e);
            return { groups: [], entries: {} };
        }
    }

    save(data: TrackerData): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save tracker data', e);
        }
    }
}

export class TrackerService {
    private storage: TrackerStorage;
    private data: TrackerData;

    constructor(storage: TrackerStorage = new LocalStorageAdapter()) {
        this.storage = storage;
        this.data = this.storage.load();
    }

    getData(): TrackerData {
        return this.data;
    }

    reload(): void {
        this.data = this.storage.load();
    }

    // --- Group Management ---

    addGroup(group: MetricGroup): void {
        if (this.data.groups.some(g => g.id === group.id)) {
            throw new Error(`Group with ID ${group.id} already exists`);
        }
        this.data.groups.push(group);
        this.save();
    }

    updateGroup(group: MetricGroup): void {
        const index = this.data.groups.findIndex(g => g.id === group.id);
        if (index === -1) {
            throw new Error(`Group with ID ${group.id} not found`);
        }
        this.data.groups[index] = group;
        this.save();
    }

    deleteGroup(groupId: string): void {
        this.data.groups = this.data.groups.filter(g => g.id !== groupId);
        this.save();
    }

    // --- Entry Management ---

    getEntry(date: string): Record<string, number> | undefined {
        return this.data.entries[date];
    }

    saveEntry(date: string, metrics: Record<string, number>): void {
        this.data.entries[date] = {
            ...(this.data.entries[date] || {}),
            ...metrics
        };
        this.save();
    }

    // --- Helpers ---

    private save(): void {
        this.storage.save(this.data);
    }

    // Auto-coloring palette (Material Design 500s)
    static COLORS = [
        '#2196F3', // Blue
        '#FF9800', // Orange
        '#4CAF50', // Green
        '#E91E63', // Pink
        '#9C27B0', // Purple
        '#F44336', // Red
        '#00BCD4', // Cyan
        '#FFC107', // Amber
        '#607D8B', // Blue Grey
    ];

    static getMetricColor(_groupIndex: number, metricIndex: number): string {
        const baseColor = this.COLORS[metricIndex % this.COLORS.length];
        return baseColor;
    }
}
