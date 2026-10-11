import React, { useState, useEffect } from 'react';
import { TrackerService } from '../services';
import { TrackerData, MetricGroup } from '../types';
import { Dashboard } from './Dashboard';
import { EntryForm } from './EntryForm';
import { Configuration } from './Configuration';
import { LayoutDashboard, PenTool, Settings } from 'lucide-react';

interface TrackerAppProps {
    templatesUrl?: string;
    version?: string;
}

export const TrackerApp: React.FC<TrackerAppProps> = ({ templatesUrl, version }) => {
    const [service] = useState(() => new TrackerService());
    const [data, setData] = useState<TrackerData>({ groups: [], entries: {} });
    const [templates, setTemplates] = useState<MetricGroup[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'config'>('dashboard');

    const refreshData = () => {
        service.reload();
        setData({ ...service.getData() });
    };

    useEffect(() => {
        const currentData = service.getData();
        setData(currentData);
        if (currentData.groups.length === 0) {
            setActiveTab('config');
        }
    }, [service]);

    // Fetch templates
    useEffect(() => {
        if (templatesUrl) {
            fetch(templatesUrl)
                .then(res => res.json())
                .then(data => setTemplates(data))
                .catch(err => console.error("Failed to load templates:", err));
        }
    }, [templatesUrl]);

    const handleSaveEntry = (date: string, metrics: Record<string, number>) => {
        service.saveEntry(date, metrics);
        refreshData();
        setActiveTab('dashboard'); // Auto switch to dashboard after save
    };

    const isDashboard = activeTab === 'dashboard';

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans pt-20 relative">
            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-0">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {activeTab === 'dashboard' ? 'Metrics Dashboard' : (activeTab === 'entry' ? 'Track Data' : 'Manage ')}
                    </h1>

                    <div className="flex items-center gap-3">
                        {activeTab !== 'config' ? (
                            <>
                                <button
                                    onClick={() => setActiveTab(isDashboard ? 'entry' : 'dashboard')}
                                    className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent-color)] text-black shadow-md hover:opacity-90 transition-all"
                                >
                                    {isDashboard ? (
                                        <>
                                            <PenTool className="w-4 h-4 mr-2" />
                                            Track
                                        </>
                                    ) : (
                                        <>
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('config')}
                                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label="Manage"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent-color)] text-black shadow-md hover:opacity-90 transition-all"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </header>

                <main>
                    {activeTab === 'dashboard' && (
                        <Dashboard groups={data.groups} entries={data.entries} version={version} />
                    )}
                    {activeTab === 'entry' && (
                        <div className="max-w-2xl mx-auto">
                            <EntryForm groups={data.groups} entries={data.entries} onSave={handleSaveEntry} />
                        </div>
                    )}
                    {activeTab === 'config' && (
                        <div className="max-w-3xl mx-auto">
                            <Configuration
                                groups={data.groups}
                                templates={templates}
                                onUpdate={refreshData}
                                service={service}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
