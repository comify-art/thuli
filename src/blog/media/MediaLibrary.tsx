import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Link, Download, RefreshCw, Pencil } from 'lucide-react';
import { MediaService } from '../../services/mediaService';
import type { PageCursor } from '../../services/baseService';
import { MediaItem } from '../../types/blog';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { useCursorPagination } from '../../ui/useCursorPagination';
import { PaginationFooter } from '../../ui/PaginationFooter';

interface MediaLibraryProps {
    service: MediaService;
    onSelect?: (item: MediaItem) => void;
    selectionMode?: boolean;
    pageSize?: number;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
    service,
    onSelect,
    selectionMode = false,
    pageSize = 24,
}) => {
    const [uploading, setUploading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const fetchPage = useCallback(
        (cursor: PageCursor | undefined) => service.listMediaPage({ limit: pageSize, cursor }),
        [service, pageSize],
    );

    const { items, loading, pageIndex, hasNext, hasPrev, next, prev, reset: reloadFromStart } =
        useCursorPagination<MediaItem>({ fetchPage, deps: [service, pageSize] });

    // Add URL State
    const [showAddInput, setShowAddInput] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

    // Rename State — open form for any tile, plus a hint on which item was
    // most recently uploaded (so it surfaces above the fold).
    const [itemToRename, setItemToRename] = useState<MediaItem | null>(null);
    const [renameName, setRenameName] = useState('');
    const [renameSlug, setRenameSlug] = useState('');
    const [renaming, setRenaming] = useState(false);

    // File Upload Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Paste Handle — browsers usually name pasted images "image.png", which
    // cascades into image-2 / image-3 collisions. Rewrite to a timestamped
    // name before forwarding to bulk upload, and remember the resulting
    // slugs so the user can quickly rename what they just pasted.
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                e.preventDefault();
                const renamed = renamePastedFiles(e.clipboardData.files);
                await handleBulkUpload(renamed);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [service]);

    const handleAddUrl = async () => {
        if (!newUrl) return;
        try {
            await service.addItem({
                name: newName || 'Untitled',
                slug: newSlug || undefined,
                url: newUrl,
            });
            setNewUrl('');
            setNewName('');
            setNewSlug('');
            setShowAddInput(false);
            reloadFromStart();
        } catch (error) {
            console.error("Failed to add media", error);
            alert("Failed to add media item");
        }
    };

    const handleBulkUpload = async (files: FileList) => {
        setUploading(true);
        try {
            const result = await service.bulkUpload(files);
            reloadFromStart();
            if (result.failures.length > 0) {
                console.error('Bulk upload failures:', result.failures);
                const detail = result.failures
                    .map((f) => `• ${f.file}: ${f.error}`)
                    .join('\n');
                alert(
                    `Uploaded ${result.successCount} files. Failed: ${result.failures.length}\n\n${detail}`,
                );
            }
        } catch (e) {
            console.error(e);
            alert(`Bulk upload error: ${(e as Error).message}`);
        } finally {
            setUploading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleBulkUpload(e.target.files);
        }
    };

    const openRename = (item: MediaItem) => {
        setItemToRename(item);
        setRenameName(item.name || '');
        setRenameSlug(item.slug || '');
    };

    const handleRename = async () => {
        if (!itemToRename) return;
        if (!renameName.trim()) {
            alert('Name cannot be empty');
            return;
        }
        setRenaming(true);
        try {
            await service.renameItem(itemToRename.id, renameName, renameSlug);
            setItemToRename(null);
            reloadFromStart();
        } catch (e) {
            console.error('Rename failed:', e);
            alert(`Rename failed: ${(e as Error).message}`);
        } finally {
            setRenaming(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await service.delete(itemToDelete.id);
            setItemToDelete(null);
            reloadFromStart();
        } catch (error) {
            console.error("Failed to delete media", error);
            alert("Failed to delete media item");
        }
    };

    const handleRegenerateThumbnails = async () => {
        // Quick check on the current page; full list is scanned server-side.
        const itemsWithoutThumbnails = items.filter(item => (!item.thumbnailUrl || item.thumbnailUrl === '') && item.url);
        if (itemsWithoutThumbnails.length === 0) {
            alert('All items on this page already have thumbnails!');
            return;
        }
        if (!confirm(`Regenerate thumbnails for items missing them?`)) return;

        setRegenerating(true);
        try {
            const result = await service.regenerateMissingThumbnails();
            reloadFromStart();
            alert(`Regenerated ${result.regenerated} thumbnails. Failed: ${result.failed}`);
        } catch (e) {
            console.error('Thumbnail regeneration error:', e);
            alert('Failed to regenerate thumbnails');
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownloadOriginal = async (item: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name || 'image';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image');
        }
    };

    return (
        <div className="space-y-4" tabIndex={0}>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-white">
                    Media Library
                    {uploading && <span className="ml-2 text-sm text-blue-500 flex inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>}
                    {regenerating && <span className="ml-2 text-sm text-purple-500 flex inline-flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Regenerating {items.filter(i => !i.thumbnailUrl || i.thumbnailUrl === '').length} thumbnails...</span>}
                </h3>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={onFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="admin-btn-secondary"
                    >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Bulk Upload'}
                    </button>
                    <button
                        onClick={() => setShowAddInput(!showAddInput)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add URL
                    </button>
                    {(() => {
                        const hasItemsWithoutThumbs = items.length > 0 && items.some(item => !item.thumbnailUrl || item.thumbnailUrl === '');
                        // console.log('Button visibility check:', {
                        //     itemsLength: items.length,
                        //     hasItemsWithoutThumbs,
                        //     itemsWithoutThumbs: items.filter(i => !i.thumbnailUrl || i.thumbnailUrl === '').length
                        // });
                        return hasItemsWithoutThumbs;
                    })() && (
                            <button
                                onClick={handleRegenerateThumbnails}
                                disabled={regenerating}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                                title={`Regenerate thumbnails for ${items.filter(i => !i.thumbnailUrl || i.thumbnailUrl === '').length} items`}
                            >
                                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                                {regenerating ? 'Regenerating...' : 'Regen Thumbs'}
                            </button>
                        )}
                </div>
            </div>

            {/* Paste Hint */}
            <div className="text-xs admin-text-muted text-center border-2 border-dashed admin-border rounded p-2">
                Tip: You can paste images (Ctrl+V) directly here to upload.
            </div>

            {showAddInput && (
                <div className="p-4 admin-surface-sunken rounded-lg flex flex-col md:flex-row gap-4 items-end animate-in slide-in-from-top-2">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-medium admin-text-muted">Image URL</label>
                        <input
                            type="text"
                            className="admin-input text-sm"
                            placeholder="https://example.com/image.jpg"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-medium admin-text-muted">Name (Optional)</label>
                        <input
                            type="text"
                            className="admin-input text-sm"
                            placeholder="My Image"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-medium admin-text-muted">Slug (Optional)</label>
                        <input
                            type="text"
                            className="admin-input text-sm font-mono"
                            placeholder="my-image-slug"
                            value={newSlug}
                            onChange={(e) => setNewSlug(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddUrl}
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                    >
                        Save
                    </button>
                </div>
            )}

            {loading && items.length === 0 ? (
                <div className="text-center py-10 admin-text-muted">Loading media...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-10 admin-surface-sunken rounded-lg border-2 border-dashed admin-border">
                    <ImageIcon className="w-10 h-10 admin-text-muted opacity-50 mx-auto mb-2" />
                    <p className="admin-text-body">No media found</p>
                    <p className="text-sm admin-text-muted">Add an image URL or Upload to get started</p>
                </div>
            ) : (
                <div className="media-grid">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`media-tile group relative admin-surface-sunken rounded-lg overflow-hidden border admin-border ${selectionMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
                                } ${onSelect ? 'hover:shadow-md' : ''}`}
                            onClick={() => onSelect && onSelect(item)}
                        >
                            <img
                                src={item.thumbnailUrl || item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2">
                                <p className="text-white text-xs truncate font-medium">{item.name}</p>
                                <p className="text-gray-300 text-[10px] truncate font-mono">{item.slug}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(item.url);
                                                alert(`Copied URL:\n${item.url}`);
                                            }}
                                            className="p-1.5 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full transition"
                                            title="Copy Media URL"
                                        >
                                            <Link className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                const markdown = `![${item.name || 'Image'}](slug:${item.slug})`;
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(markdown);
                                                alert(`Copied markdown:\n${markdown}`);
                                            }}
                                            className="p-1.5 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full transition"
                                            title="Copy Markdown"
                                        >
                                            <code className="text-[10px] font-bold">MD</code>
                                        </button>
                                        <button
                                            onClick={(e) => handleDownloadOriginal(item, e)}
                                            className="p-1.5 bg-green-700/80 hover:bg-green-600 text-white rounded-full transition"
                                            title="Download Original"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        {!selectionMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openRename(item);
                                                }}
                                                className="p-1.5 bg-blue-700/80 hover:bg-blue-600 text-white rounded-full transition"
                                                title="Rename"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    {!selectionMode && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToDelete(item);
                                            }}
                                            className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PaginationFooter
                pageIndex={pageIndex}
                itemsOnPage={items.length}
                hasNext={hasNext}
                hasPrev={hasPrev}
                loading={loading}
                onPrev={prev}
                onNext={next}
                itemNoun="item"
            />


            <ConfirmationModal
                isOpen={!!itemToDelete}
                onCancel={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Media"
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This cannot be undone.`}
                confirmLabel="Delete"
                isDangerous
            />

            {itemToRename && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !renaming && setItemToRename(null)}
                >
                    <div
                        className="admin-card p-6 w-full max-w-md space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold admin-text-strong">Rename Media</h3>
                        <div className="space-y-2">
                            <label className="admin-label">Name</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={renameName}
                                onChange={(e) => setRenameName(e.target.value)}
                                autoFocus
                                disabled={renaming}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Slug</label>
                            <input
                                type="text"
                                className="admin-input font-mono text-sm"
                                value={renameSlug}
                                onChange={(e) => setRenameSlug(e.target.value)}
                                placeholder="auto-derived from name if blank"
                                disabled={renaming}
                            />
                            <p className="text-xs admin-text-muted">
                                Used in <code>slug:</code> markdown references. Must be unique;
                                a counter is appended if it collides.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                className="admin-btn-secondary"
                                onClick={() => setItemToRename(null)}
                                disabled={renaming}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                onClick={handleRename}
                                disabled={renaming || !renameName.trim()}
                            >
                                {renaming ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Browsers usually name pasted images "image.png" (or worse, an empty
 * string). Rewrite those to a timestamped + randomized name so paste
 * uploads don't fall into image-2 / image-3 collision suffixes.
 */
function renamePastedFiles(files: FileList): FileList {
    const dt = new DataTransfer();
    for (const file of Array.from(files)) {
        const isGeneric = !file.name || /^image\.[a-z]+$/i.test(file.name) || file.name === 'unknown';
        if (isGeneric) {
            const ext = (file.name.split('.').pop() || file.type.split('/')[1] || 'png').toLowerCase();
            const stamp = pasteStamp();
            const newName = `pasted-${stamp}.${ext}`;
            dt.items.add(new File([file], newName, { type: file.type }));
        } else {
            dt.items.add(file);
        }
    }
    return dt.files;
}

function pasteStamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const rand = Math.random().toString(36).slice(2, 6);
    return `${date}-${time}-${rand}`;
}
