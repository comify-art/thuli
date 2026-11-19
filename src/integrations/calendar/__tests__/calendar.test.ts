import { describe, it, expect, vi } from 'vitest';
import {
    generateIcsPayload,
    escapeIcsText,
    parseEventTime,
    downloadIcsFile,
} from '../ics';
import {
    buildGoogleCalendarUrl,
    buildOutlookCalendarUrl,
} from '../deepLinks';
import type { CalendarEventOptions } from '../types';

describe('Calendar Integration', () => {
    const mockEvent: CalendarEventOptions = {
        title: 'Pitch Session: Alpha Inc',
        description: 'Founder presentation and member Q&A.\nSession is recorded.',
        location: 'https://zoom.us/j/123456789',
        date: '2026-12-15',
        time: '10:00 AM',
        durationMinutes: 45,
        timezone: 'America/Los_Angeles',
        uid: 'evt-test-123@thuli.calendar',
    };

    describe('escapeIcsText', () => {
        it('escapes slashes, semicolons, commas, and newlines per RFC 5545', () => {
            const raw = 'Meeting, with; Dr. Smith\\Jones\nNext line';
            expect(escapeIcsText(raw)).toBe('Meeting\\, with\\; Dr. Smith\\\\Jones\\nNext line');
        });
    });

    describe('parseEventTime', () => {
        it('parses 12-hour AM/PM times correctly', () => {
            expect(parseEventTime('10:00 AM')).toEqual({ hours: 10, minutes: 0 });
            expect(parseEventTime('12:00 PM')).toEqual({ hours: 12, minutes: 0 });
            expect(parseEventTime('12:30 AM')).toEqual({ hours: 0, minutes: 30 });
            expect(parseEventTime('2:45 PM')).toEqual({ hours: 14, minutes: 45 });
        });

        it('parses 24-hour time strings correctly', () => {
            expect(parseEventTime('15:30')).toEqual({ hours: 15, minutes: 30 });
            expect(parseEventTime('09:15')).toEqual({ hours: 9, minutes: 15 });
        });
    });

    describe('generateIcsPayload', () => {
        it('compiles valid RFC 5545 VCALENDAR and VEVENT', () => {
            const ics = generateIcsPayload(mockEvent);

            expect(ics).toContain('BEGIN:VCALENDAR');
            expect(ics).toContain('VERSION:2.0');
            expect(ics).toContain('BEGIN:VEVENT');
            expect(ics).toContain('UID:evt-test-123@thuli.calendar');
            expect(ics).toContain('SUMMARY:Pitch Session: Alpha Inc');
            expect(ics).toContain('DTSTART;TZID=America/Los_Angeles:20261215T100000');
            expect(ics).toContain('LOCATION:https://zoom.us/j/123456789');
            expect(ics).toContain('STATUS:CONFIRMED');
            expect(ics).toContain('END:VEVENT');
            expect(ics).toContain('END:VCALENDAR');
        });
    });

    describe('downloadIcsFile', () => {
        it('triggers blob anchor download', () => {
            const createObjectURLMock = vi.fn().mockReturnValue('blob:ics-url');
            const revokeObjectURLMock = vi.fn();
            global.URL.createObjectURL = createObjectURLMock;
            global.URL.revokeObjectURL = revokeObjectURLMock;

            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            downloadIcsFile(mockEvent, 'alpha-pitch');

            expect(createObjectURLMock).toHaveBeenCalledTimes(1);
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:ics-url');
        });
    });

    describe('Calendar Deep Links', () => {
        it('generates valid Google Calendar web intent URL', () => {
            const url = buildGoogleCalendarUrl(mockEvent);
            expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
            expect(url).toContain('Pitch+Session%3A+Alpha+Inc');
            expect(url).toContain('20261215T100000');
        });

        it('generates valid Outlook web intent URL', () => {
            const url = buildOutlookCalendarUrl(mockEvent);
            expect(url).toContain('https://outlook.live.com/calendar/0/deeplink/compose?rru=addevent');
            expect(url).toContain('Pitch+Session%3A+Alpha+Inc');
            expect(url).toContain('startdt=2026-12-15T10%3A00%3A00');
        });
    });
});
