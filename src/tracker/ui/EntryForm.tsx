import React, { useState, useEffect } from 'react';
import { MetricGroup, DailyEntries } from '../types';
import { ConfirmationModal } from '../../ui/ConfirmationModal';

interface EntryFormProps {
    groups: MetricGroup[];
    entries: DailyEntries;
    onSave: (date: string, data: Record<string, number>) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ groups, entries, onSave }) => {
    // Helper to get local date string YYYY-MM-DD
    const getLocalDateStr = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getLocalDateStr(new Date());
    const [selectedDate, setSelectedDate] = useState(today);
    const [formData, setFormData] = useState<Record<string, number | ''>>({});

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // Min date is 10 days ago
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 10);
    const minDateStr = getLocalDateStr(minDate);

    // Load existing data when date changes
    useEffect(() => {
        const existingData = entries[selectedDate] || {};
        const initialData: Record<string, number | ''> = {};

        // Populate with existing data or clear
        groups.forEach(group => {
            group.metrics.forEach(metric => {
                initialData[metric.id] = existingData[metric.id] !== undefined ? existingData[metric.id] : '';
            });
        });

        setFormData(initialData);
    }, [selectedDate, entries, groups]);

    const handleChange = (metricId: string, value: string) => {
        const numValue = value === '' ? '' : parseInt(value, 10);
        setFormData(prev => ({
            ...prev,
            [metricId]: numValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert '' to undefined (or just skip) and numbers to numbers
        const cleanData: Record<string, number> = {};
        let hasData = false;

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== '') {
                cleanData[key] = value as number;
                hasData = true;
            }
        });

        if (hasData) {
            onSave(selectedDate, cleanData);
            setModal({
                isOpen: true,
                title: 'Success',
                message: `Entries for ${selectedDate} have been saved successfully!`,
                onConfirm: closeModal
            });
        }
    };

    return (
        <React.Fragment>
            <ConfirmationModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
                confirmLabel="OK"
                showCancel={false}
            />
            <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] p-6 rounded-lg shadow-lg">
                <div className="mb-8 flex items-center space-x-4 border-b border-gray-700 pb-4">
                    <label className="text-lg font-medium text-gray-300">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={today}
                        min={minDateStr}
                        className="bg-black/20 text-white border border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                        required
                    />
                    <span className="text-sm text-gray-500">(Past 10 days only)</span>
                </div>

                <div className="space-y-8">
                    {groups.map(group => (
                        <div key={group.id} className="space-y-4">
                            <h4 className="text-lg font-semibold text-[var(--accent-color)] border-l-4 border-[var(--accent-color)] pl-3">
                                {group.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {group.metrics.map(metric => (
                                    <div key={metric.id} className="flex flex-col">
                                        <label htmlFor={metric.id} className="mb-2 text-sm font-medium text-gray-300">
                                            {metric.name}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id={metric.id}
                                                value={formData[metric.id] ?? ''}
                                                onChange={(e) => handleChange(metric.id, e.target.value)}
                                                min="0"
                                                className="w-full bg-[#1e1e1e] border border-gray-600 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all outline-none"
                                                placeholder="0"
                                            />
                                            <div
                                                className={`absolute right-3 top-3 text-xs text-gray-500 pointer-events-none transition-opacity duration-200 ${(formData[metric.id] !== '' && formData[metric.id] !== undefined) ? 'opacity-0' : 'opacity-100'
                                                    }`}
                                            >
                                                {metric.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        className="bg-[var(--accent-color)] text-black font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-[var(--accent-color)]/20"
                    >
                        Save Entries
                    </button>
                </div>
            </form>
        </React.Fragment>
    );
};
