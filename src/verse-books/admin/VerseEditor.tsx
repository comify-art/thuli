import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Save, X, Globe } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { BookService } from '../../services/bookService';
import { ChapterService } from '../../services/chapterService';
import { VerseService } from '../../services/verseService';
import type { Book, Chapter, Verse, VerseContent, Translation } from '../types';

interface VerseEditorProps {
    bookService: BookService;
    chapterService: ChapterService;
    verseService: VerseService;
    bookId: string;
    /** When provided, edit; when omitted, create new. */
    verseId?: string;
    /** Pre-fill chapter/verse indexes for the new-verse flow. */
    defaultChapterIndex?: number;
    defaultVerseIndex?: number;
    onClose: () => void;
}

type Tab = 'write' | 'settings';

/**
 * Split-pane verse editor.
 *
 * Write tab: canonical Tamil verse on the left, each translation stacked
 * on the right with collapsible bodies. Settings tab: chapter/verse
 * indexes + status + title. Save + Publish use atomic batched writes
 * via `VerseService.saveDraft` / `publish`.
 */
export const VerseEditor: React.FC<VerseEditorProps> = ({
    bookService,
    chapterService,
    verseService,
    bookId,
    verseId,
    defaultChapterIndex,
    defaultVerseIndex,
    onClose,
}) => {
    const isNew = !verseId;

    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [tab, setTab] = useState<Tab>('write');

    const [chapterIndex, setChapterIndex] = useState<number>(defaultChapterIndex ?? 1);
    const [verseIndex, setVerseIndex] = useState<number>(defaultVerseIndex ?? 1);
    const [title, setTitle] = useState('');
    const [original, setOriginal] = useState('');
    const [translations, setTranslations] = useState<Translation[]>([
        { language: 'en', variant: 'meaning', body: '' },
        { language: 'ta', variant: 'meaning', body: '' },
    ]);

    const [existing, setExisting] = useState<Verse | null>(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [b, chs] = await Promise.all([
                    bookService.getById(bookId),
                    chapterService.listChapters(bookId),
                ]);
                if (cancelled) return;
                setBook(b);
                setChapters(chs);

                if (!isNew) {
                    const joined = await verseService.getVerseWithContent(verseId!);
                    if (cancelled || !joined) {
                        if (!cancelled) onClose();
                        return;
                    }
                    setExisting(joined.verse);
                    setChapterIndex(joined.verse.chapterIndex);
                    setVerseIndex(joined.verse.verseIndex);
                    setTitle(joined.verse.title ?? '');
                    setOriginal(joined.content?.original ?? '');
                    if (joined.content?.translations.length) {
                        setTranslations(joined.content.translations);
                    }
                } else if (chs.length > 0 && !defaultChapterIndex) {
                    setChapterIndex(chs[0].index);
                }
            } catch (e) {
                console.error('Failed to load verse for edit:', e);
                onClose();
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [
        bookService,
        chapterService,
        verseService,
        bookId,
        verseId,
        isNew,
        defaultChapterIndex,
        onClose,
    ]);

    const updateTranslation = (i: number, patch: Partial<Translation>) => {
        setTranslations((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
    };

    const addTranslation = () => {
        setTranslations((prev) => [...prev, { language: 'en', variant: 'commentary', body: '' }]);
    };

    const removeTranslation = (i: number) => {
        setTranslations((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleSave = async (publish: boolean) => {
        if (!book) return;
        if (chapterIndex < 1 || verseIndex < 1) {
            alert('Chapter and verse indexes must be ≥ 1.');
            return;
        }
        if (!chapters.find((c) => c.index === chapterIndex)) {
            alert(
                `No chapter at index ${chapterIndex}. Create it from the Book editor first, or pick an existing one.`,
            );
            return;
        }

        setSaving(true);
        try {
            const id = `${book.id}-${chapterIndex}-${verseIndex}`;
            const chapterId = `${book.id}-${chapterIndex}`;
            const now = Timestamp.now();
            const verse: Verse = {
                id,
                bookId: book.id,
                chapterId,
                chapterIndex,
                verseIndex,
                title: title.trim() || undefined,
                status: publish ? 'published' : 'draft',
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
                publishedAt: existing?.publishedAt,
            };
            const content: VerseContent = {
                id,
                verseId: id,
                original,
                translations: translations.filter((t) => t.body.trim() !== ''),
                updatedAt: now,
            };
            if (publish) {
                await verseService.publish(verse, content);
            } else {
                await verseService.saveDraft(verse, content);
            }
            // Refresh cached counts on the book record.
            await bookService.recomputeCounts(bookId);
            onClose();
        } catch (e) {
            console.error('Verse save failed:', e);
            alert(`Save failed: ${(e as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-card p-12 text-center admin-text-muted">Loading verse…</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-sm admin-text-body hover:admin-text-strong"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to verses
                </button>
                <div className="flex items-center gap-2">
                    <div className="admin-pill-track">
                        <button
                            onClick={() => setTab('write')}
                            className={`admin-pill ${tab === 'write' ? 'admin-pill-active' : ''}`}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setTab('settings')}
                            className={`admin-pill ${tab === 'settings' ? 'admin-pill-active' : ''}`}
                        >
                            Settings
                        </button>
                    </div>
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
                        <Globe className="w-4 h-4" /> {saving ? 'Saving…' : 'Publish'}
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold admin-text-strong">
                {book?.title}{' '}
                <span className="admin-text-muted font-normal text-base font-mono">
                    {chapterIndex}.{verseIndex}
                </span>
            </h2>

            {tab === 'write' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Canonical original */}
                    <div className="admin-card p-4">
                        <h3 className="text-sm font-semibold admin-text-strong mb-2">Original (Tamil)</h3>
                        <textarea
                            className="admin-input font-serif text-base"
                            rows={12}
                            value={original}
                            onChange={(e) => setOriginal(e.target.value)}
                            placeholder="ஓரா யிரத்து…"
                        />
                    </div>

                    {/* Translations stack */}
                    <div className="space-y-3">
                        {translations.map((t, i) => (
                            <div key={i} className="admin-card p-4 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="admin-input text-xs font-mono w-20"
                                            value={t.language}
                                            onChange={(e) => updateTranslation(i, { language: e.target.value })}
                                            placeholder="en"
                                        />
                                        <input
                                            type="text"
                                            className="admin-input text-xs w-36"
                                            value={t.variant ?? ''}
                                            onChange={(e) => updateTranslation(i, { variant: e.target.value })}
                                            placeholder="meaning"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeTranslation(i)}
                                        className="admin-btn-icon hover:!text-red-400"
                                        title="Remove translation"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <textarea
                                    className="admin-input text-sm"
                                    rows={6}
                                    value={t.body}
                                    onChange={(e) => updateTranslation(i, { body: e.target.value })}
                                    placeholder="Translation body (markdown)…"
                                />
                            </div>
                        ))}
                        <button onClick={addTranslation} className="admin-btn-secondary w-full justify-center">
                            <Plus className="w-4 h-4" /> Add translation
                        </button>
                    </div>
                </div>
            ) : (
                <div className="admin-card p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="admin-label">Chapter index</label>
                            <input
                                type="number"
                                className="admin-input font-mono text-sm"
                                value={chapterIndex}
                                onChange={(e) => setChapterIndex(Number(e.target.value))}
                                min={1}
                            />
                            {chapters.length > 0 && (
                                <p className="text-xs admin-text-muted mt-1">
                                    Existing chapters:{' '}
                                    {chapters.map((c) => c.index).join(', ')}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="admin-label">Verse index</label>
                            <input
                                type="number"
                                className="admin-input font-mono text-sm"
                                value={verseIndex}
                                onChange={(e) => setVerseIndex(Number(e.target.value))}
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="admin-label">Title (optional)</label>
                            <input
                                type="text"
                                className="admin-input text-sm"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="usually blank"
                            />
                        </div>
                    </div>
                    <p className="text-sm admin-text-muted">
                        The verse id is derived from <code className="font-mono">{book?.id}</code>{' '}
                        + chapter + verse. Changing the indexes here creates a new document at the
                        new id — re-save to commit. The previous id is not auto-deleted.
                    </p>
                </div>
            )}
        </div>
    );
};
