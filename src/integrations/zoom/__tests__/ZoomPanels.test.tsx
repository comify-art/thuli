import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZoomSchedulePanel } from '../ZoomSchedulePanel';
import { ZoomRecordingPanel } from '../ZoomRecordingPanel';

describe('ZoomSchedulePanel', () => {
    it('renders scheduling fields and triggers onSchedule', () => {
        const onSchedule = vi.fn();
        render(
            <ZoomSchedulePanel
                topic="Quarterly Planning"
                date="2026-12-01"
                time="17:00"
                durationMinutes={60}
                autoRecording="cloud"
                onSchedule={onSchedule}
            />
        );

        expect(screen.getByText('Zoom Meeting & Scheduling')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Quarterly Planning')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Schedule Zoom/i }));
        expect(onSchedule).toHaveBeenCalledTimes(1);
    });

    it('renders active meeting join link and passcode when meeting is provided', () => {
        render(
            <ZoomSchedulePanel
                meeting={{
                    meetingId: '9988776655',
                    joinUrl: 'https://zoom.us/j/9988776655',
                    passcode: '123456',
                }}
            />
        );

        expect(screen.getByText('ID: 9988776655')).toBeInTheDocument();
        expect(screen.getByText('https://zoom.us/j/9988776655')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument();
    });
});

describe('ZoomRecordingPanel', () => {
    it('renders recording inputs and triggers onSync and onSave', () => {
        const onSync = vi.fn();
        const onSave = vi.fn();
        const onRecordingUrlChange = vi.fn();
        const onRecordingPasscodeChange = vi.fn();
        const onRecordingSummaryChange = vi.fn();

        render(
            <ZoomRecordingPanel
                recordingUrl="https://zoom.us/rec/share/sample"
                onRecordingUrlChange={onRecordingUrlChange}
                recordingPasscode="abc123"
                onRecordingPasscodeChange={onRecordingPasscodeChange}
                recordingSummary="Summary highlights"
                onRecordingSummaryChange={onRecordingSummaryChange}
                onSync={onSync}
                onSave={onSave}
            />
        );

        expect(screen.getByText('Zoom Cloud Recording & AI Summary')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Watch/i })).toHaveAttribute('href', 'https://zoom.us/rec/share/sample');

        fireEvent.click(screen.getByRole('button', { name: /Sync from Zoom/i }));
        expect(onSync).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: /Save Recording Details/i }));
        expect(onSave).toHaveBeenCalledTimes(1);
    });
});
