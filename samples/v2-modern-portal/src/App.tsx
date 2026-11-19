import { useState } from 'react';
import {
  buildCsvContent,
  downloadCsvFile,
  formatCompactCurrency,
  formatCurrency,
} from '@comify.art/thuli/core';
import {
  Alert,
  Checkbox,
  ConfirmationModal,
  CopyButton,
  DataTable,
  Drawer,
  FormField,
  MetricStrip,
  Modal,
  ProgressMeter,
  SelectInput,
  StatusBadge,
  Textarea,
  TextInput,
  ToggleSwitch,
  type ColumnDef,
} from '@comify.art/thuli/ui/primitives';
import { Footer, Navbar, PageMeta } from '@comify.art/thuli/ui/layout';
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
} from '@comify.art/thuli/integrations/calendar';
import {
  WhatsAppBroadcastConsole,
  WhatsAppSyndicateCard,
} from '@comify.art/thuli/integrations/whatsapp';
import {
  ZoomRecordingPanel,
  ZoomSchedulePanel,
} from '@comify.art/thuli/integrations/zoom';
import {
  AccessGateCard,
  DocumentViewer,
  UserProfileMenu,
} from '@comify.art/thuli/features';

interface DealRow {
  id: string;
  company: string;
  sector: string;
  committedUsd: number;
  status: 'active' | 'pending' | 'closed';
}

const SAMPLE_DEALS: DealRow[] = [
  { id: '1', company: 'Acme Robotics', sector: 'Autonomous Systems', committedUsd: 42000, status: 'active' },
  { id: '2', company: 'Nova Dynamics', sector: 'Enterprise AI', committedUsd: 50000, status: 'closed' },
  { id: '3', company: 'Stellar Systems', sector: 'Clean Energy', committedUsd: 18000, status: 'pending' },
];

type TabId = 'dashboard' | 'table' | 'forms' | 'integrations' | 'features';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const [companyInput, setCompanyInput] = useState('Acme Robotics');
  const [sectorSelect, setSectorSelect] = useState('ai');
  const [notesInput, setNotesInput] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const [zoomTopic, setZoomTopic] = useState('Acme Robotics — Quarterly Review');
  const [zoomDate, setZoomDate] = useState('2026-12-01');
  const [zoomTime, setZoomTime] = useState('17:00');
  const [zoomDuration, setZoomDuration] = useState(60);
  const [zoomRecordingUrl, setZoomRecordingUrl] = useState('https://zoom.us/rec/share/sample-recording');
  const [zoomPasscode, setZoomPasscode] = useState('aB3$k9');
  const [zoomSummary, setZoomSummary] = useState('• Reviewed Q4 milestones\n• Approved next sprint scope');

  const columns: ColumnDef<DealRow>[] = [
    { key: 'company', header: 'Company', sortable: true, render: (r) => <span className="font-semibold text-white">{r.company}</span> },
    { key: 'sector', header: 'Sector', sortable: true, render: (r) => r.sector },
    { key: 'committedUsd', header: 'Committed', sortable: true, align: 'right', render: (r) => formatCurrency(r.committedUsd, 'USD') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusBadge
          variant={r.status === 'active' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'}
          label={r.status.toUpperCase()}
          dot={r.status === 'active'}
          dotPulse={r.status === 'active'}
        />
      ),
    },
  ];

  const sampleEvent = {
    title: 'Quarterly Planning & Product Review',
    description: 'Executive review session with Acme Corporation.',
    location: 'https://meet.example.com/q4-review',
    date: '2026-12-01',
    time: '5:00 PM UTC',
    durationMinutes: 60,
  };

  const handleCsvExport = () => {
    const csv = buildCsvContent(SAMPLE_DEALS, [
      { header: 'Company', accessor: (d) => d.company },
      { header: 'Sector', accessor: (d) => d.sector },
      { header: 'Committed USD', accessor: (d) => d.committedUsd },
      { header: 'Status', accessor: (d) => d.status },
    ]);
    downloadCsvFile('thuli-v2-deals.csv', csv);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: '1. Executive Dashboard' },
    { id: 'table', label: '2. Data Table & CSV' },
    { id: 'forms', label: '3. Dialogs & Forms' },
    { id: 'integrations', label: '4. Integrations' },
    { id: 'features', label: '5. Turnkey Features' },
  ];

  return (
    <PageMeta title="Thuli 2.0 Modern Portal" description="4-Container Showcase">
      <div className="flex flex-col min-h-screen bg-[var(--surface-canvas)] text-white">
        <Navbar
          title="Thuli 2.0 Portal"
          logo="https://placehold.co/120x40/0f172a/38bdf8?text=Thuli+2.0"
          links={[{ name: 'Dashboard', path: '/' }]}
          rightSlot={
            <UserProfileMenu
              user={{
                uid: 'u1',
                displayName: 'Alex Rivera',
                email: 'alex@example.com',
                photoURL: null,
              }}
              claims={{ role: 'admin' }}
              onLogout={() => setConfirmOpen(true)}
            />
          }
        />

        <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
          <div className="flex flex-wrap gap-2 border-b border-[var(--border-default)] pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <section className="space-y-6">
              {showAlert && (
                <Alert
                  variant="info"
                  title="Thuli 2.0 Canonical Architecture"
                  onDismiss={() => setShowAlert(false)}
                >
                  All 4 containers (core, ui, integrations, features) are active with dark-first CSS variables.
                </Alert>
              )}

              <MetricStrip
                items={[
                  { label: 'Total Volume', value: formatCompactCurrency(110000, 'USD'), color: 'emerald' },
                  { label: 'Active Programs', value: '3', color: 'blue' },
                  { label: 'Completion Rate', value: '84%', color: 'amber' },
                ]}
              />

              <div className="p-6 rounded-2xl bg-[var(--surface-panel)] border border-[var(--border-default)] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Quarterly Target Progress</h2>
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Open Details Drawer
                  </button>
                </div>
                <ProgressMeter current={84000} target={100000} label="Target Allocation" unit="USD" />
              </div>
            </section>
          )}

          {activeTab === 'table' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Portfolio & Pipeline</h2>
                <button
                  onClick={handleCsvExport}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold cursor-pointer"
                >
                  Export RFC 4180 CSV
                </button>
              </div>
              <DataTable<DealRow>
                data={SAMPLE_DEALS}
                columns={columns}
                keyExtractor={(row) => row.id}
              />
            </section>
          )}

          {activeTab === 'forms' && (
            <section className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium cursor-pointer"
                >
                  Open Dark-First Modal
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium cursor-pointer"
                >
                  Open Confirmation Modal
                </button>
                <CopyButton text="https://portal.example.com/invite/acme" label="Copy Invite Link" showLabel />
              </div>

              <div className="p-6 rounded-2xl bg-[var(--surface-panel)] border border-[var(--border-default)] space-y-4 max-w-xl">
                <FormField label="Organization Name" required>
                  <TextInput value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} />
                </FormField>
                <FormField label="Primary Sector">
                  <SelectInput value={sectorSelect} onChange={(e) => setSectorSelect(e.target.value)}>
                    <option value="ai">Enterprise AI</option>
                    <option value="robotics">Autonomous Systems</option>
                    <option value="energy">Clean Energy</option>
                  </SelectInput>
                </FormField>
                <FormField label="Review Notes">
                  <Textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Enter summary notes..."
                  />
                </FormField>
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  label="Confirm compliance with workspace guidelines"
                />
                <ToggleSwitch
                  checked={notificationsOn}
                  onChange={setNotificationsOn}
                  label="Enable real-time status notifications"
                />
              </div>
            </section>
          )}

          {activeTab === 'integrations' && (
            <section className="space-y-6">
              <div className="p-6 rounded-2xl bg-[var(--surface-panel)] border border-[var(--border-default)] space-y-4">
                <h2 className="text-lg font-semibold">Calendar Integration (RFC 5545)</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadIcsFile(sampleEvent, 'quarterly-review.ics')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium cursor-pointer"
                  >
                    Download .ics File
                  </button>
                  <a
                    href={buildGoogleCalendarUrl(sampleEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium"
                  >
                    Add to Google Calendar
                  </a>
                </div>
              </div>

              <WhatsAppSyndicateCard
                startupName="Acme Robotics"
                groupInviteUrl="https://chat.whatsapp.com/EXAMPLEINVITE"
                committedAmount={10000}
                currency="USD"
              />

              <div className="p-6 rounded-2xl bg-[var(--surface-panel)] border border-[var(--border-default)] space-y-6">
                <ZoomSchedulePanel
                  meeting={{
                    meetingId: '9988776655',
                    joinUrl: 'https://zoom.us/j/9988776655',
                    passcode: zoomPasscode,
                  }}
                  topic={zoomTopic}
                  onTopicChange={setZoomTopic}
                  date={zoomDate}
                  onDateChange={setZoomDate}
                  time={zoomTime}
                  onTimeChange={setZoomTime}
                  durationMinutes={zoomDuration}
                  onDurationChange={setZoomDuration}
                  onSchedule={() => setModalOpen(true)}
                />
                <ZoomRecordingPanel
                  recordingUrl={zoomRecordingUrl}
                  onRecordingUrlChange={setZoomRecordingUrl}
                  recordingPasscode={zoomPasscode}
                  onRecordingPasscodeChange={setZoomPasscode}
                  recordingSummary={zoomSummary}
                  onRecordingSummaryChange={setZoomSummary}
                  onSync={() => setModalOpen(true)}
                  onSave={() => setConfirmOpen(true)}
                />
              </div>

              <WhatsAppBroadcastConsole
                event={{
                  companyName: 'Acme Robotics',
                  slug: 'acme-robotics',
                  pitchDate: '2026-12-01',
                  pitchTime: '5:00 PM UTC',
                  dealLead: 'Jordan Smith',
                  dealLeadPhone: '+15550192834',
                  dealShareUrl: 'https://portal.example.com/deal/acme-robotics',
                  commitmentConfig: {
                    totalCommittedUsd: 42000,
                    totalCommittedInr: 0,
                    totalCommitters: 6,
                    targetThresholdUsd: 50000,
                    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
                    whatsappGroupUrl: 'https://chat.whatsapp.com/EXAMPLEINVITE',
                  },
                }}
              />
            </section>
          )}

          {activeTab === 'features' && (
            <section className="space-y-6">
              <AccessGateCard
                title="Executive Workspace Access"
                message="This section demonstrates the turnkey role-gated boundary card."
                badgeLabel="Member Only"
                primaryAction={{ label: 'Request Access', onClick: () => setModalOpen(true) }}
              />
              <DocumentViewer
                title="Acme Robotics — Technical Overview"
                src="https://example.com/sample-deck.pdf"
              />
            </section>
          )}
        </main>

        <Footer
          logo="https://placehold.co/120x40/0f172a/38bdf8?text=Thuli+2.0"
          description="Thuli 2.0 Modern Portal Showcase"
          skinny
          links={{
            quickLinks: [{ name: 'Documentation', path: '/docs' }],
            community: [{ name: 'GitHub', path: 'https://github.com' }],
            legal: [{ name: 'Apache-2.0', path: '/license' }],
          }}
          contact={{
            name: 'Acme Corporation',
            email: 'support@example.com',
            address: '100 Main St',
          }}
          copyright="© 2026 Acme Corporation"
          version="2.0.0"
        />

        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Program Details"
        >
          <p className="text-sm text-slate-300">
            Slide-over drawer backed by dark-first Thuli surface tokens.
          </p>
        </Drawer>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Dark-First Modal"
          subtitle="Zero theme-inversion verified"
        >
          <p className="text-sm text-slate-300">
            This modal renders with <code className="text-blue-400">--surface-modal</code> and{' '}
            <code className="text-blue-400">--border-default</code>.
          </p>
        </Modal>

        <ConfirmationModal
          isOpen={confirmOpen}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
          isDangerous
        />
      </div>
    </PageMeta>
  );
}
