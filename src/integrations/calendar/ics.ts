import type { CalendarEventOptions } from './types';

/**
 * Escapes characters in text values per RFC 5545 section 3.3.11.
 */
export function escapeIcsText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\n|\r/g, '\\n');
}

/**
 * Parses time string (e.g., '10:00 AM', '2:30 PM', '14:30') into hours and minutes.
 */
export function parseEventTime(timeStr?: string): { hours: number; minutes: number } {
    if (!timeStr) return { hours: 10, minutes: 0 };

    const match12 = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match12) {
        let hours = parseInt(match12[1], 10);
        const minutes = parseInt(match12[2], 10);
        const meridiem = match12[3]?.toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
    }

    const match24 = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        return {
            hours: parseInt(match24[1], 10),
            minutes: parseInt(match24[2], 10),
        };
    }

    return { hours: 10, minutes: 0 };
}

/**
 * Compiles an RFC 5545 compliant iCalendar (.ics) string.
 */
export function generateIcsPayload(options: CalendarEventOptions): string {
    const {
        title,
        description = '',
        location = '',
        date,
        time,
        durationMinutes = 30,
        timezone = 'America/Los_Angeles',
        uid,
        url,
    } = options;

    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    const { hours, minutes } = parseEventTime(time);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startLocal = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;

    // Calculate end time
    const startUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endUtc = new Date(startUtc.getTime() + durationMinutes * 60000);
    const endLocal = `${endUtc.getUTCFullYear()}${pad(endUtc.getUTCMonth() + 1)}${pad(endUtc.getUTCDate())}T${pad(endUtc.getUTCHours())}${pad(endUtc.getUTCMinutes())}00`;

    const nowUtc = new Date();
    const stampUtc = `${nowUtc.getUTCFullYear()}${pad(nowUtc.getUTCMonth() + 1)}${pad(nowUtc.getUTCDate())}T${pad(nowUtc.getUTCHours())}${pad(nowUtc.getUTCMinutes())}${pad(nowUtc.getUTCSeconds())}Z`;

    const eventUid = uid || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@thuli.calendar`;

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Thuli Calendar Engine//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${eventUid}`,
        `DTSTAMP:${stampUtc}`,
        `DTSTART;TZID=${timezone}:${startLocal}`,
        `DTEND;TZID=${timezone}:${endLocal}`,
        `SUMMARY:${escapeIcsText(title)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
        ...(url ? [`URL:${url}`] : []),
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    return lines.join('\r\n');
}

/**
 * Downloads a generated .ics calendar file in the browser.
 */
export function downloadIcsFile(options: CalendarEventOptions, filename?: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const payload = generateIcsPayload(options);
    const blob = new Blob([payload], { type: 'text/calendar;charset=utf-8' });
    const blobUrl = window.URL.createObjectURL(blob);

    const safeName = filename || `${options.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    const finalFilename = safeName.endsWith('.ics') ? safeName : `${safeName}.ics`;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
}
