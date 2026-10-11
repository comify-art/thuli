import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { MediaService } from '../../services/mediaService';
import type { OrphanedBlob } from '../../services/mediaService';
import { ConfirmationModal } from '../../ui/ConfirmationModal';

interface OrphanedMediaManagerProps {
    service: MediaService;
    /** Storage prefix to scan. Defaults to `media`, which covers originals
     *  and the `media/thumbnails/` subtree. */
    rootPath?: string;
}

/**
 * Lists Firebase Storage blobs under `rootPath` that no `media_items` row
 * references via `url` or `thumbnailUrl`. These are typically left over
 * from uploads where the storage write succeeded but the Firestore write
 * failed (or from manual uploads outside the app). Pure UI over
 * `MediaService.listOrphanedMediaBlobs()` / `deleteStorageBlob()`.
 */
export const OrphanedMediaManager: React.FC<OrphanedMediaManagerProps> = ({
    service,
    rootPath = 'media',
}) => {
    const [orphans, setOrphans] = useState<OrphanedBlob[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanError, setScanError] = useState<string | null>(null);
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<OrphanedBlob | null>(null);

    const scan = useCallback(async () => {
        setLoading(true);
        setScanError(null);
        try {
            const items = await service.listOrphanedMediaBlobs(rootPath);
            setOrphans(items);
        } catch (e) {
            console.error('Failed to scan orphaned media:', e);
            setScanError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, [service, rootPath]);

    useEffect(() => {
        scan();
    }, [scan]);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setDeletingPath(pendingDelete.fullPath);
        try {
            await service.deleteStorageBlob(pendingDelete.fullPath);
            setOrphans((prev) => prev.filter((o) => o.fullPath !== pendingDelete.fullPath));
            setPendingDelete(null);
        } catch (e) {
            console.error('Failed to delete blob:', e);
            alert(`Failed to delete ${pendingDelete.fullPath}: ${(e as Error).message}`);
        } finally {
            setDeletingPath(null);
        }
    };

    const totalBytes = orphans.reduce((sum, o) => sum + (o.size ?? 0), 0);

    return (
        <div className="admin-card p-6">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold admin-text-strong flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        Orphaned Media
                    </h2>
                    <p className="admin-text-muted mt-1">
                        Storage blobs under <code className="font-mono text-xs">{rootPath}/</code>{' '}
                        that no media item references. Safe to delete to free storage.
                    </p>
                </div>
                <button
                    onClick={scan}
                    disabled={loading}
                    className="admin-btn-secondary"
                    title="Re-scan storage"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Scanning...' : 'Re-scan'}
                </button>
            </div>

            {scanError && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    Scan failed: {scanError}
                </div>
            )}

            {loading && orphans.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : orphans.length === 0 && !scanError ? (
                <div className="mt-2 p-12 border-2 border-dashed admin-border rounded-xl text-center flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 admin-text-muted opacity-50 mb-4" />
                    <h3 className="text-lg font-medium admin-text-strong mb-1">No orphaned media found</h3>
                    <p className="admin-text-muted">Every storage blob is referenced by a media item.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-sm admin-text-muted">
                        {orphans.length} {orphans.length === 1 ? 'blob' : 'blobs'}
                        {totalBytes > 0 && <> · {formatBytes(totalBytes)} reclaimable</>}
                    </div>
                    <div className="space-y-2">
                        {orphans.map((o) => (
                            <div
                                key={o.fullPath}
                                className="flex justify-between items-start p-4 admin-surface-sunken rounded-lg border admin-border transition-colors"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-medium admin-text-strong truncate" title={o.fullPath}>
                                        {o.name}
                                    </p>
                                    <p className="text-xs admin-text-muted mt-1 font-mono truncate">
                                        {o.fullPath}
                                    </p>
                                    <p className="text-xs admin-text-muted mt-1">
                                        {o.size != null && <>{formatBytes(o.size)}</>}
                                        {o.size != null && o.updated && <> · </>}
                                        {o.updated && <>Updated {new Date(o.updated).toLocaleString()}</>}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPendingDelete(o)}
                                    disabled={deletingPath === o.fullPath}
                                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                                    aria-label="Delete orphaned blob"
                                >
                                    {deletingPath === o.fullPath ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!pendingDelete}
                onCancel={() => setPendingDelete(null)}
                onConfirm={handleDelete}
                title="Delete Orphaned Blob"
                message={`Permanently delete ${pendingDelete?.fullPath}? This cannot be undone.`}
                confirmLabel="Delete"
                isDangerous
            />
        </div>
    );
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}