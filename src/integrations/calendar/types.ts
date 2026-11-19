export interface CalendarEventOptions {
    title: string;
    description?: string;
    location?: string;
    date: string; // YYYY-MM-DD
    time?: string; // e.g. "10:00 AM" or "14:00"
    durationMinutes?: number; // default: 30
    timezone?: string; // default: 'America/Los_Angeles'
    organizer?: {
        name?: string;
        email: string;
    };
    uid?: string;
    url?: string;
}
