import React, { useCallback, useState } from 'react';
import { Edit, Trash2, Globe, FileText, BookOpen, ExternalLink } from 'lucide-react';
import { BookService } from '../../services/bookService';
import type { PageCursor } from '../../services/baseService';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { useCursorPagination } from '../../ui/useCursorPagination';
import { PaginationFooter } from '../../ui/PaginationFooter';
import type { Book } from '../types';

interface BookListProps {
    service: BookService;
    onEdit: (id: string) => void;
    onManageVerses: (id: string) => void;
    pageSize?: number;
    /** Public reader base path for the View action. Defaults to `/p/verse`. */
    viewBasePath?: string;
}

/**
 * Admin table of books. Mirrors the BlogAdminList shape — cursor-stack
 * pagination via the `useCursorPagination` hook, semantic-token classes
 * from the admin palette. "Manage Verses" drills into per-book VerseList.
 */
export const BookList: React.FC<BookListProps> = ({ service, onEdit, onManageVerses, pageSize = 25, viewBasePath = '/p/verse' }) => {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchPage = useCallback(
        (cursor: PageCursor | undefined) => service.listBooksPage({ limit: pageSize, cursor }),
        [service, pageSize],
    );

    const { items: books, loading, pageIndex, hasNext, hasPrev, next, prev, reload } =
        useCursorPagination<Book>({ fetchPage, deps: [service, pageSize] });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await service.delete(deleteId);
            setDeleteId(null);
            reload();
        } catch (error) {
            console.error('Failed to delete book', error);
            alert(`Failed to delete book: ${(error as Error).message}`);
        }
    };

    if (loading && books.length === 0) {
        return <div className="p-8 text-center admin-text-muted">Loading books...</div>;
    }

    return (
        <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="admin-surface-sunken border-b admin-border text-xs uppercase admin-text-body font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Chapters</th>
                            <th className="px-6 py-3">Verses</th>
                            <th className="px-6 py-3">Updated</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="admin-divide">
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center admin-text-muted">
                                    No books yet. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => (
                                <tr key={book.id} className="admin-row-hover">
                                    <td className="px-6 py-4">
                                        <div className="font-medium admin-text-strong line-clamp-1">
                                            {book.title}
                                        </div>
                                        <div className="text-xs admin-text-muted font-mono mt-0.5">
                                            /{book.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            book.status === 'published'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                        }`}>
                                            {book.status === 'published' ? <Globe className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm admin-text-body">{book.chapterCount}</td>
                                    <td className="px-6 py-4 text-sm admin-text-body">{book.verseCount}</td>
                                    <td className="px-6 py-4 text-sm admin-text-muted whitespace-nowrap">
                                        {book.updatedAt?.toDate().toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1">
                                        <a
                                            href={`${viewBasePath}/${book.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-btn-icon hover:!text-green-400 inline-flex"
                                            title="View public book home"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => onManageVerses(book.id)}
                                            className="admin-btn-icon hover:!text-purple-400"
                                            title="Manage Verses"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(book.id)}
                                            className="admin-btn-icon hover:!text-blue-400"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(book.id)}
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
                    itemsOnPage={books.length}
                    hasNext={hasNext}
                    hasPrev={hasPrev}
                    loading={loading}
                    onPrev={prev}
                    onNext={next}
                    itemNoun="book"
                />
            </div>

            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Book"
                message="Delete this book? Its chapters and verses are NOT removed — you must clean those up separately. This cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isDangerous={true}
                confirmLabel="Delete Book"
            />
        </div>
    );
};
