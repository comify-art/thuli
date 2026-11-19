export type ZoomAutoRecordingMode = 'cloud' | 'local' | 'none';

export interface ZoomMeetingDetails {
    meetingId?: string | number;
    joinUrl?: string;
    startUrl?: string;
    passcode?: string;
    topic?: string;
    startTime?: string;
    durationMinutes?: number;
    autoRecording?: ZoomAutoRecordingMode;
}

export interface ZoomSchedulePanelProps {
    meeting?: ZoomMeetingDetails | null;
    topic?: string;
    onTopicChange?: (value: string) => void;
    date?: string;
    onDateChange?: (value: string) => void;
    time?: string;
    onTimeChange?: (value: string) => void;
    durationMinutes?: number;
    onDurationChange?: (minutes: number) => void;
    autoRecording?: ZoomAutoRecordingMode;
    onAutoRecordingChange?: (mode: ZoomAutoRecordingMode) => void;
    scheduling?: boolean;
    syncing?: boolean;
    onSchedule?: () => void;
    onSync?: () => void;
    title?: string;
    subtitle?: string;
    className?: string;
}

export interface ZoomRecordingPanelProps {
    recordingUrl: string;
    onRecordingUrlChange: (url: string) => void;
    recordingPasscode: string;
    onRecordingPasscodeChange: (passcode: string) => void;
    recordingSummary: string;
    onRecordingSummaryChange: (summary: string) => void;
    watchUrl?: string;
    syncing?: boolean;
    saving?: boolean;
    onSync?: () => void;
    onSave?: () => void;
    title?: string;
    subtitle?: string;
    className?: string;
}
