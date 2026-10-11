import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, X, Save } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { BookService } from '../../services/bookService';
import { ChapterService } from '../../services/chapterService';
import { MediaService } from '../../services/mediaService';
import { MediaPicker } from '../../blog/media/MediaPicker';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import type { Book, Chapter } from '../types';

interface BookEditorProps {
    bookService: BookService;
    chapterService: ChapterService;
    mediaService: MediaService;
    /** When provided, edit an existing book; when omitted, create a new one. */
    bookId?: string;
    onClose: () => void;
}

interface ChapterDraft {
    /** Existing chapter id, or `undefined` if not yet saved. */
    id?: string;
    index: number;
    label: string;
    intro?: string;
    /** True when this chapter was edited locally and needs an upsert on save. */
    dirty: boolean;
}

/**
 * Book metadata form with an inline chapter scaffold.
 *
 * Chapter rows are managed locally; new chapters get saved on form submit,
 * existing rows are upserted if the user edits them, and removals fire
 * `ChapterService.deleteChapter` (which refuses if verses still reference
 * the chapter — caller sees an alert with the error).
 */
export const BookEditor: React.FC<BookEditorProps> = ({
    bookService,
    chapterService,
    mediaService,
    bookId,
    onClose,
}) => {
    const isNew = !bookId;

    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [translator, setTranslator] = useState('');
    const [rights, setRights] = useState('');
    const [languages, setLanguages] = useState('ta,en');

    const [chapters, setChapters] = useState<ChapterDraft[]>([]);
    const [removedChapterIds, setRemovedChapterIds] = useState<string[]>([]);

    const [existing, setExisting] = useState<Book | null>(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pendingRemove, setPendingRemove] = useState<ChapterDraft | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (isNew) {
                setLoading(false);
                return;
            }
            try {
                const b = await bookService.getById(bookId!);
                if (cancelled || !b) {
                    if (!cancelled) onClose();
                    return;
                }
                setExisting(b);
                setSlug(b.slug);
                setTitle(b.title);
                setSubtitle(b.subtitle ?? '');
                setCoverImageUrl(b.coverImageUrl ?? '');
                setTranslator(b.translator ?? '');
                setRights(b.rights ?? '');
                setLanguages(b.languages.join(','));

                const chs = await chapterService.listChapters(b.id);
                if (cancelled) return;
                setChapters(
                    chs.map((c) => ({
                        id: c.id,
                        index: c.index,
                        label: c.label,
                        intro: c.intro,
                        dirty: false,
                    })),
                );
            } catch (e) {
                console.error('Failed to load book for edit:', e);
                onClose();
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookId, bookService, chapterService, isNew, onClose]);

    // Auto-derive slug from title only while creating a fresh book and the user
    // hasn't manually typed in the slug field. (Same UX as BlogEditor.)
    useEffect(() => {
        if (!isNew) return;
        if (slug && slug !== autoSlug(title.slice(0, slug.length))) return;
        setSlug(autoSlug(title));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, isNew]);

    const addChapter = () => {
        const nextIdx = chapters.length === 0 ? 1 : Math.max(...chapters.map((c) => c.index)) + 1;
        setChapters([
            ...chapters,
            {
                index: nextIdx,
                label: `Chapter ${nextIdx}`,
                dirty: true,
            },
        ]);
    };

    const updateChapter = (idx: number, patch: Partial<ChapterDraft>) => {
        setChapters((prev) =>
            prev.map((c, i) => (i === idx ? { ...c, ...patch, dirty: true } : c)),
        );
    };

    const confirmRemoveChapter = (c: ChapterDraft) => setPendingRemove(c);

    const removeChapter = () => {
        if (!pendingRemove) return;
        setChapters((prev) => prev.filter((c) => c !== pendingRemove));
        if (pendingRemove.id) {
            setRemovedChapterIds((prev) => [...prev, pendingRemove.id!]);
        }
        setPendingRemove(null);
    };

    const handleSave = async (publish: boolean) => {
        if (!slug.trim()) {
            alert('Slug cannot be empty.');
            return;
        }
        if (!title.trim()) {
            alert('Title cannot be empty.');
            return;
        }

        setSaving(true);
        try {
            const now = Timestamp.now();
            const book: Book = {
                id: slug.trim(),
                slug: slug.trim(),
                title: title.trim(),
                subtitle: subtitle.trim() || undefined,
                coverImageUrl: coverImageUrl.trim() || undefined,
                translator: translator.trim() || undefined,
                rights: rights.trim() || undefined,
                languages: languages
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                chapterCount: chapters.length,
                verseCount: existing?.verseCount ?? 0,
                status: publish ? 'published' : existing?.status ?? 'draft',
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
                publishedAt: publish ? existing?.publishedAt ?? now : existing?.publishedAt,
            };
            await bookService.saveBook(book);

            // Upsert dirty chapters.
            for (const draft of chapters) {
                if (!draft.dirty) continue;
                const chapterId = draft.id ?? `${book.id}-${draft.index}`;
                const ch: Chapter = {
                    id: chapterId,
                    bookId: book.id,
                    index: draft.index,
                    label: draft.label.trim() || `Chapter ${draft.index}`,
                    intro: draft.intro?.trim() || undefined,
                    verseCount: 0,
                    createdAt: now,
                    updatedAt: now,
                };
                await chapterService.saveChapter(ch);
            }

            // Delete chapters that were removed in the UI. Each call refuses if
            // verses still reference it; we surface that as an alert and let
            // the admin reassign/delete those verses first.
            for (const id of removedChapterIds) {
                try {
                    await chapterService.deleteChapter(id);
                } catch (e) {
                    alert(`Could not remove chapter ${id}: ${(e as Error).message}`);
                }
            }

            // Refresh counts so the book row reflects reality after chapter edits.
            await bookService.recomputeCounts(book.id);

            onClose();
        } catch (e) {
            console.error('Save failed:', e);
            alert(`Save failed: ${(e as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-card p-12 text-center admin-text-muted">Loading book…</div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-sm admin-text-body hover:admin-text-strong"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to books
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="admin-btn-secondary"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="admin-card p-6 space-y-4">
                <h2 className="text-lg font-semibold admin-text-strong">
                    {isNew ? 'New Book' : 'Edit Book'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Title</label>
                        <input
                            type="text"
                            className="admin-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Thirumandhiram"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Slug</label>
                        <input
                            type="text"
                            className="admin-input font-mono text-sm"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="thirumandhiram"
                            disabled={!isNew}
                        />
                        {!isNew && (
                            <p className="text-xs admin-text-muted mt-1">
                                Slug is the document id — immutable once created.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="admin-label">Subtitle</label>
                    <input
                        type="text"
                        className="admin-input"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="A foundational text of Tamil Shaivism"
                    />
                </div>

                <div>
                    <label className="admin-label">Cover Image</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            className="admin-input font-mono text-sm flex-1"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            placeholder="slug:thirumandhiram-cover  or  https://…"
                        />
                        <button
                            onClick={() => setShowPicker(true)}
                            className="admin-btn-secondary"
                            title="Pick from Media Library"
                        >
                            <ImageIcon className="w-4 h-4" /> Pick
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Translator (single, v1)</label>
                        <input
                            type="text"
                            className="admin-input"
                            value={translator}
                            onChange={(e) => setTranslator(e.target.value)}
                            placeholder="B. Natarajan"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Languages (comma-separated)</label>
                        <input
                            type="text"
                            className="admin-input font-mono text-sm"
                            value={languages}
                            onChange={(e) => setLanguages(e.target.value)}
                            placeholder="ta,en"
                        />
                    </div>
                </div>

                <div>
                    <label className="admin-label">Rights / Terms (markdown)</label>
                    <textarea
                        className="admin-input font-mono text-sm"
                        rows={4}
                        value={rights}
                        onChange={(e) => setRights(e.target.value)}
                        placeholder="© Public domain text. Translations © …"
                    />
                </div>
            </div>

            <div className="admin-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold admin-text-strong">Chapters</h2>
                    <button onClick={addChapter} className="admin-btn-secondary">
                        <Plus className="w-4 h-4" /> Add Chapter
                    </button>
                </div>
                {chapters.length === 0 ? (
                    <p className="admin-text-muted text-sm italic">No chapters yet.</p>
                ) : (
                    <div className="space-y-3">
                        {chapters.map((ch, i) => (
                            <div key={ch.id ?? `new-${i}`} className="flex gap-3 items-start admin-surface-sunken p-3 rounded-md border admin-border">
                                <div className="w-12 shrink-0">
                                    <label className="text-xs admin-text-muted">Idx</label>
                                    <input
                                        type="number"
                                        className="admin-input font-mono text-sm"
                                        value={ch.index}
                                        onChange={(e) => updateChapter(i, { index: Number(e.target.value) })}
                                        min={1}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs admin-text-muted">Label</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={ch.label}
                                        onChange={(e) => updateChapter(i, { label: e.target.value })}
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="text-xs admin-text-muted">Intro (optional, markdown)</label>
                                    <textarea
                                        className="admin-input text-sm"
                                        rows={2}
                                        value={ch.intro ?? ''}
                                        onChange={(e) => updateChapter(i, { intro: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={() => confirmRemoveChapter(ch)}
                                    className="admin-btn-icon hover:!text-red-400 mt-5"
                                    title="Remove chapter"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <MediaPicker
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={(item) => setCoverImageUrl(`slug:${item.slug}`)}
                service={mediaService}
            />

            <ConfirmationModal
                isOpen={!!pendingRemove}
                title="Remove Chapter"
                message={
                    pendingRemove
                        ? `Remove chapter "${pendingRemove.label}"? If verses still reference it, deletion will fail and you'll need to reassign or delete those verses first.`
                        : ''
                }
                onConfirm={removeChapter}
                onCancel={() => setPendingRemove(null)}
                isDangerous={true}
                confirmLabel="Remove"
            />
        </div>
    );
};

function autoSlug(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');
}

