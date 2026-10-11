import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { BlogAdminService } from '../../services/blogService';
import { BlogContent } from '../../types/blog';

interface OrphanedContentManagerProps {
    service: BlogAdminService;
}

/**
 * Lists `blog_contents` rows that no `blog_posts` row references, and
 * lets an admin delete them to free storage. Pure UI over
 * `BlogAdminService.getOrphanedContents()` / `deleteBlogContent()`.
 */
export const OrphanedContentManager: React.FC<OrphanedContentManagerProps> = ({ service }) => {
    const [orphanedItems, setOrphanedItems] = useState<BlogContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadOrphanedContent = useCallback(async () => {
        setLoading(true);
        try {
            const items = await service.getOrphanedContents();
            setOrphanedItems(items);
        } catch (error) {
            console.error('Failed to load orphaned content:', error);
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => {
        loadOrphanedContent();
    }, [loadOrphanedContent]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this orphaned content? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            await service.deleteBlogContent(id);
            await loadOrphanedContent();
        } catch (error) {
            console.error('Failed to delete content:', error);
            alert('Failed to delete orphaned content.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-card p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold admin-text-strong flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        Orphaned Blog Content
                    </h2>
                    <p className="admin-text-muted mt-1">
                        Content rows that are no longer linked to any active blog post. Safe to delete to free storage.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : orphanedItems.length === 0 ? (
                <div className="mt-8 p-12 border-2 border-dashed admin-border rounded-xl text-center flex flex-col items-center">
                    <FileText className="w-12 h-12 admin-text-muted opacity-50 mb-4" />
                    <h3 className="text-lg font-medium admin-text-strong mb-1">No orphaned content found</h3>
                    <p className="admin-text-muted">All content items are properly linked to blog posts.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orphanedItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-start p-4 admin-surface-sunken rounded-lg border admin-border transition-colors"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-medium admin-text-strong truncate">ID: {item.id}</h3>
                                <p className="text-sm admin-text-muted mt-1 line-clamp-2">
                                    {item.markdown.substring(0, 150) || 'No content'}...
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                                aria-label="Delete orphaned content"
                            >
                                {deletingId === item.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
