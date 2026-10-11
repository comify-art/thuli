import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Globe, PenTool, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { BlogAdminService } from '../../services/blogService';
import { BlogStats } from '../../types/blog';

interface BlogStatsWidgetProps {
    service: BlogAdminService;
    onNavigate?: (sectionId: string) => void;
}

export const BlogStatsWidget: React.FC<BlogStatsWidgetProps> = ({ service, onNavigate }) => {
    const [stats, setStats] = useState<BlogStats>({ total: 0, published: 0, drafts: 0, mediaItems: 0, orphanedContents: 0 });
    const [loading, setLoading] = useState(false);

    const loadStats = useCallback(async (force = false) => {
        setLoading(true);
        try {
            const data = await service.getStats(force);
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => {
        loadStats(false);
    }, [loadStats]);

    return (
        <div className="mb-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold admin-text-strong">Overview</h3>
                <button
                    onClick={() => loadStats(true)}
                    disabled={loading}
                    className="admin-btn-icon disabled:opacity-50"
                    title="Refresh Stats"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex flex-wrap gap-[20px]">
                <StatsCard
                    label="Total Posts"
                    value={stats.total}
                    icon={<FileText className="w-5 h-5 text-blue-500" />}
                    onClick={() => onNavigate?.('blog')}
                />
                <StatsCard
                    label="Published"
                    value={stats.published}
                    icon={<Globe className="w-5 h-5 text-green-500" />}
                    onClick={() => onNavigate?.('blog')}
                />
                <StatsCard
                    label="Drafts"
                    value={stats.drafts}
                    icon={<PenTool className="w-5 h-5 text-yellow-500" />}
                    onClick={() => onNavigate?.('blog')}
                />
                <StatsCard
                    label="Media Items"
                    value={stats.mediaItems}
                    icon={<ImageIcon className="w-5 h-5 text-purple-500" />}
                    onClick={() => onNavigate?.('media')}
                />
                <StatsCard
                    label="Orphaned Content"
                    value={stats.orphanedContents}
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                    onClick={() => onNavigate?.('orphaned')}
                />
            </div>
        </div>
    );
};

const StatsCard = ({ label, value, icon, onClick }: { label: string, value: number, icon: React.ReactNode, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`flex-1 min-w-[150px] max-w-[200px] p-4 flex items-center justify-between admin-card ${onClick ? 'admin-card-interactive' : ''}`}
    >
        <div>
            <p className="text-sm font-medium admin-text-muted">{label}</p>
            <p className="text-2xl font-bold admin-text-strong mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full admin-surface-sunken">
            {icon}
        </div>
    </div>
);
