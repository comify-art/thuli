import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Globe, FileText, ExternalLink } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { BookService } from '../../services/bookService';
import { ChapterService } from '../../services/chapterService';
import { VerseService } from '../../services/verseService';
import type { PageCursor } from '../../services/baseService';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { useCursorPagination } from '../../ui/useCursorPagination';
import { PaginationFooter } from '../../ui/PaginationFooter';
import { VerseNavigator } from '../ui/VerseNavigator';
import type { Book, Chapter, Verse } from '../types';

interface VerseListProps {
    bookService: BookService;
    chapterService: ChapterService;
    verseService: VerseService;
    bookId: string;
    onEdit: (verseId: string) => void;
    onCreate: () => void;
    onBack: () => void;
    pageSize?: number;
    /** Public reader base path for the View action. Defaults to `/p/verse`. */
    viewBasePath?: string;
}

type StatusFilter = 'all' | 'draft' | 'published';

/**
 * Per-book admin verse table.
 *
 * Breadcrumb (book), status filter, jump-to-verse navigator, cursor
 * pagination. Inline quick-publish for drafts; per-row delete that also
 * removes the matching `verse_contents` document.
 */
export const VerseList: React.FC<VerseListProps> = ({
    bookService,
    chapterService,
    verseService,
    bookId,
    onEdit,
    onCreate,
    onBack,
    pageSize = 50,
    viewBasePath = '/p/verse',
}) => {
    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all');
    const [deleteVerse, setDeleteVerse] = useState<Verse | null>(null);

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
            } catch (e) {
                console.error('Failed to load book context:', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookService, chapterService, bookId]);

    const fetchPage = useCallback(
        (cursor: PageCursor | undefined) =>
            verseService.listVersesPage({
                bookId,
                chapterIndex: chapterFilter === 'all' ? undefined : chapterFilter,
                status: statusFilter === 'all' ? undefined : statusFilter,
                limit: pageSize,
                cursor,
            }),
        [verseService, bookId, statusFilter, chapterFilter, pageSize],
    );

    const { items: verses, loading, pageIndex, hasNext, hasPrev, next, prev, reload } =
        useCursorPagination<Verse>({
            fetchPage,
            deps: [bookId, statusFilter, chapterFilter, pageSize],
        });

    const handleDelete = async () => {
        if (!deleteVerse) return;
        try {
            await verseService.delete(deleteVerse.id);
            setDeleteVerse(null);
            reload();
            await bookService.recomputeCounts(bookId);
        } catch (error) {
            console.error('Failed to delete verse:', error);
            alert(`Failed: ${(error as Error).message}`);
        }
    };

    const handleQuickPublish = async (verse: Verse) => {
        if (!confirm(`Publish verse ${verse.chapterIndex}.${verse.verseIndex}?`)) return;
        try {
            await verseService.update(verse.id, {
                status: 'published',
                publishedAt: verse.publishedAt ?? Timestamp.now(),
            } as Partial<Verse>);
            reload();
        } catch (error) {
            console.error('Failed to publish verse:', error);
            alert(`Failed: ${(error as Error).message}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm admin-text-body hover:admin-text-strong"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to books
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={chapterFilter}
                        onChange={(e) => setChapterFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="admin-input text-sm w-auto"
                    >
                        <option value="all">All chapters</option>
                        {chapters.map((c) => (
                            <option key={c.id} value={c.index}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="admin-input text-sm w-auto"
                    >
                        <option value="all">All statuses</option>
                        <option value="draft">Drafts</option>
                        <option value="published">Published</option>
                    </select>
                    {book && (
                        <VerseNavigator
                            bookSlug={book.slug}
                            chapterIndex={typeof chapterFilter === 'number' ? chapterFilter : 1}
                        />
                    )}
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> New Verse
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold admin-text-strong">
                {book ? book.title : '…'} <span className="admin-text-muted font-normal text-base">verses</span>
            </h2>

            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="admin-surface-sunken border-b admin-border text-xs uppercase admin-text-body font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Verse</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Updated</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="admin-divide">
                            {verses.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center admin-text-muted">
                                        No verses matching this filter.
                                    </td>
                                </tr>
                            ) : (
                                verses.map((v) => (
                                    <tr key={v.id} className="admin-row-hover">
                                        <td className="px-6 py-4 font-mono text-sm admin-text-strong">
                                            {v.chapterIndex}.{v.verseIndex}
                                        </td>
                                        <td className="px-6 py-4 text-sm admin-text-body">
                                            {v.title || <span className="italic admin-text-muted opacity-70">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                v.status === 'published'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                            }`}>
                                                {v.status === 'published' ? <Globe className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm admin-text-muted whitespace-nowrap">
                                            {v.updatedAt?.toDate().toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1">
                                            {book && (
                                                <a
                                                    href={`${viewBasePath}/${book.slug}/${v.chapterIndex}/${v.verseIndex}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="admin-btn-icon hover:!text-green-400 inline-flex"
                                                    title="View public verse"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {v.status === 'draft' && (
                                                <button
                                                    onClick={() => handleQuickPublish(v)}
                                                    className="admin-btn-icon hover:!text-green-500"
                                                    title="Publish"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEdit(v.id)}
                                                className="admin-btn-icon hover:!text-blue-400"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteVerse(v)}
                                                className="admin-btn-icon hover:!text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t admin-border admin-surface-sunken">
                    <PaginationFooter
                        pageIndex={pageIndex}
                        itemsOnPage={verses.length}
                        hasNext={hasNext}
                        hasPrev={hasPrev}
                        loading={loading}
                        onPrev={prev}
                        onNext={next}
                        itemNoun="verse"
                    />
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!deleteVerse}
                title="Delete Verse"
                message={
                    deleteVerse
                        ? `Permanently delete verse ${deleteVerse.chapterIndex}.${deleteVerse.verseIndex}? The matching verse_contents document is NOT automatically removed; surface it via Orphaned Content if needed.`
                        : ''
                }
                onConfirm={handleDelete}
                onCancel={() => setDeleteVerse(null)}
                isDangerous={true}
                confirmLabel="Delete"
            />
        </div>
    );
};
