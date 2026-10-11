import React, { useState } from 'react';
import { MetricGroup, Metric, TrendDirection } from '../types';
import { TrackerService } from '../services';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { Trash2, Plus, Copy, Download } from 'lucide-react';

interface ConfigurationProps {
    groups: MetricGroup[];
    templates: MetricGroup[];
    onUpdate: () => void;
    service: TrackerService;
}

export const Configuration: React.FC<ConfigurationProps> = ({ groups, templates, onUpdate, service }) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [newMetricName, setNewMetricName] = useState<Record<string, string>>({});

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleExport = () => {
        const data = service.getData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            service.addGroup({
                id: newGroupName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
                name: newGroupName,
                metrics: []
            });
            setNewGroupName('');
            onUpdate();
        }
    };

    const handleAddTemplate = (template: MetricGroup) => {
        // Create a deep copy with new IDs to avoid conflicts
        const newGroup = {
            ...template,
            id: template.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
            metrics: template.metrics.map((m, i) => ({
                ...m,
                id: m.id + '_' + Date.now(), // Ensure unique metric IDs
                color: TrackerService.getMetricColor(0, i) // Re-assign colors
            }))
        };
        service.addGroup(newGroup);
        onUpdate();
    };

    const handleDeleteGroup = (groupId: string) => {
        setModal({
            isOpen: true,
            title: 'Delete Group',
            message: 'Are you sure you want to delete this metric group? All associated metrics and data will be permanently removed.',
            isDangerous: true,
            onConfirm: () => {
                service.deleteGroup(groupId);
                onUpdate();
                closeModal();
            }
        });
    };

    const handleAddMetric = (group: MetricGroup) => {
        const name = newMetricName[group.id];
        if (!name?.trim()) return;

        const metric: Metric = {
            id: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
            name,
            description: 'New metric description',
            trendDirection: 'UP',
            color: TrackerService.getMetricColor(0, group.metrics.length)
        };

        const updatedGroup = { ...group, metrics: [...group.metrics, metric] };
        service.updateGroup(updatedGroup);
        setNewMetricName(prev => ({ ...prev, [group.id]: '' }));
        onUpdate();
    };

    const handleUpdateMetric = (group: MetricGroup, updatedMetric: Metric) => {
        const updatedMetrics = group.metrics.map(m => m.id === updatedMetric.id ? updatedMetric : m);
        service.updateGroup({ ...group, metrics: updatedMetrics });
        onUpdate();
    };

    const handleDeleteMetric = (group: MetricGroup, metricId: string) => {
        setModal({
            isOpen: true,
            title: 'Delete Metric',
            message: 'Are you sure you want to delete this metric? Historical data associated with it may be lost.',
            isDangerous: true,
            onConfirm: () => {
                const updatedMetrics = group.metrics.filter(m => m.id !== metricId);
                service.updateGroup({ ...group, metrics: updatedMetrics });
                onUpdate();
                closeModal();
            }
        });
    };

    return (
        <div className="space-y-8 pb-20">
            <ConfirmationModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
                isDangerous={modal.isDangerous}
                confirmLabel="Delete"
            />

            {/* Data Management Header */}
            <div className="flex justify-end">
                <button
                    onClick={handleExport}
                    className="flex items-center text-sm bg-[#1e1e1e] hover:bg-[#2d2d2d] text-gray-300 border border-gray-700 px-4 py-2 rounded transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                </button>
            </div>

            {/* Create Group Section */}
            <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Create New Group</h2>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Custom Group */}
                    <div className="flex-1">
                        <form onSubmit={handleAddGroup} className="flex gap-2">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="E.g. Project Alpha Stats"
                                className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded px-4 py-2 text-white outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                            />
                            <button
                                type="submit"
                                disabled={!newGroupName.trim()}
                                className="bg-[var(--accent-color)] text-black px-4 py-2 rounded font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    {/* Templates */}
                    <div className="flex-1 border-l border-gray-700 pl-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">OR ADD FROM TEMPLATE</h3>
                        <div className="flex flex-wrap gap-2">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleAddTemplate(template)}
                                    className="flex items-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-full border border-gray-600 transition-colors"
                                >
                                    <Copy className="w-3 h-3 mr-1.5" />
                                    {template.name}
                                </button>
                            ))}
                            {templates.length === 0 && (
                                <span className="text-xs text-gray-500 italic">No templates loaded</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white border-t border-gray-800 pt-8">Your Metrics</h2>

            {groups.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <p className="text-gray-400">No groups defined yet. Use the form above to add one.</p>
                </div>
            )}

            {groups.map(group => (
                <div key={group.id} className="bg-[var(--card-bg)] rounded-lg p-6 border border-gray-800">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-700">
                        <div>
                            <h3 className="text-xl font-bold text-white">{group.name}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-1">ID: {group.id}</p>
                        </div>
                        <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                            title="Delete Group"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {group.metrics.map(metric => (
                            <MetricEditor
                                key={metric.id}
                                metric={metric}
                                onSave={(m) => handleUpdateMetric(group, m)}
                                onDelete={() => handleDeleteMetric(group, metric.id)}
                            />
                        ))}
                    </div>

                    {/* Add Metric Inline Form */}
                    <div className="mt-4 pt-4 border-t border-gray-800/50 flex gap-2">
                        <input
                            type="text"
                            value={newMetricName[group.id] || ''}
                            onChange={(e) => setNewMetricName(prev => ({ ...prev, [group.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMetric(group)}
                            placeholder={`Add metric to ${group.name}...`}
                            className="flex-1 bg-black/20 border border-gray-700 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[var(--accent-color)]"
                        />
                        <button
                            onClick={() => handleAddMetric(group)}
                            disabled={!newMetricName[group.id]?.trim()}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};



// Sub-component for editing a single metric
const MetricEditor: React.FC<{
    metric: Metric;
    onSave: (m: Metric) => void;
    onDelete: () => void
}> = ({ metric, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState(metric);

    if (!isEditing) {
        return (
            <div className="flex justify-between items-center bg-black/20 p-3 rounded hover:bg-black/30 transition-colors" style={{ borderLeft: `4px solid ${metric.color}` }}>
                <div>
                    <div className="font-semibold text-white">{metric.name}</div>
                    <div className="text-xs text-gray-400">{metric.description}</div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${metric.trendDirection === 'DOWN' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                        Good: {metric.trendDirection}
                    </span>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-[var(--accent-color)] hover:underline">Edit</button>
                    <button onClick={onDelete} className="text-sm text-red-500 hover:underline">Delete</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 p-4 rounded border border-gray-600 space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input
                        className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        value={edited.name}
                        onChange={e => setEdited({ ...edited, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                        type="color"
                        className="w-full h-8 bg-[#1e1e1e] border border-gray-600 rounded cursor-pointer"
                        value={edited.color}
                        onChange={e => setEdited({ ...edited, color: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <input
                    className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    value={edited.description}
                    onChange={e => setEdited({ ...edited, description: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Good Trend Direction</label>
                <select
                    className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    value={edited.trendDirection}
                    onChange={e => setEdited({ ...edited, trendDirection: e.target.value as TrendDirection })}
                >
                    <option value="UP">UP (Higher is better)</option>
                    <option value="DOWN">DOWN (Lower is better)</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1">Cancel</button>
                <button
                    onClick={() => { onSave(edited); setIsEditing(false); }}
                    className="text-sm bg-[var(--accent-color)] text-black px-3 py-1 rounded font-medium"
                >
                    Save
                </button>
            </div>
        </div>
    );
};
