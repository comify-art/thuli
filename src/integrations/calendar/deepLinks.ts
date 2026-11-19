import type { CalendarEventOptions } from './types';
import { parseEventTime } from './ics';

function formatDatesIsoCompact(dateStr: string, timeStr?: string, durationMins: number = 30): { start: string; end: string } {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const { hours, minutes } = parseEventTime(timeStr);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startIso = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;

    const startUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endUtc = new Date(startUtc.getTime() + durationMins * 60000);
    const endIso = `${endUtc.getUTCFullYear()}${pad(endUtc.getUTCMonth() + 1)}${pad(endUtc.getUTCDate())}T${pad(endUtc.getUTCHours())}${pad(endUtc.getUTCMinutes())}00`;

    return { start: startIso, end: endIso };
}

/**
 * Generates a Google Calendar web intent URL.
 */
export function buildGoogleCalendarUrl(options: CalendarEventOptions): string {
    const { title, description = '', location = '', date, time, durationMinutes = 30 } = options;
    const { start, end } = formatDatesIsoCompact(date, time, durationMinutes);

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${start}/${end}`,
        details: description,
        location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook.com / Microsoft 365 Calendar deep link URL.
 */
export function buildOutlookCalendarUrl(options: CalendarEventOptions): string {
    const { title, description = '', location = '', date, time, durationMinutes = 30 } = options;
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    const { hours, minutes } = parseEventTime(time);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startIso = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;

    const startUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endUtc = new Date(startUtc.getTime() + durationMinutes * 60000);
    const endIso = `${endUtc.getUTCFullYear()}-${pad(endUtc.getUTCMonth() + 1)}-${pad(endUtc.getUTCDate())}T${pad(endUtc.getUTCHours())}:${pad(endUtc.getUTCMinutes())}:00`;

    const params = new URLSearchParams({
        rru: 'addevent',
        startdt: startIso,
        enddt: endIso,
        subject: title,
        body: description,
        location: location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
