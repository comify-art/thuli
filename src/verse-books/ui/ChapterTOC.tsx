import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import type { PageCursor } from '../../services/baseService';
import { BookService } from '../../services/bookService';
import { ChapterService } from '../../services/chapterService';
import { VerseService } from '../../services/verseService';
import { useCursorPagination } from '../../ui/useCursorPagination';
import { PaginationFooter } from '../../ui/PaginationFooter';
import { VerseNavigator } from './VerseNavigator';
import type { Book, Chapter, Verse } from '../types';

interface ChapterTOCProps {
    bookService: BookService;
    chapterService: ChapterService;
    verseService: VerseService;
    bookSlug: string;
    chapterIndex: number;
    basePath?: string;
    pageSize?: number;
}

/**
 * Public verse list for one chapter. Paginated via `useCursorPagination`.
 * Each row links to the matching `VersePage`.
 */
export const ChapterTOC: React.FC<ChapterTOCProps> = ({
    bookService,
    chapterService,
    verseService,
    bookSlug,
    chapterIndex,
    basePath = '/p/verse',
    pageSize = 50,
}) => {
    const [book, setBook] = useState<Book | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [headerLoading, setHeaderLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setHeaderLoading(true);
            setNotFound(false);
            try {
                const b = await bookService.getBookBySlug(bookSlug);
                if (cancelled) return;
                if (!b) {
                    setNotFound(true);
                    return;
                }
                setBook(b);
                const chapterId = `${b.id}-${chapterIndex}`;
                const ch = await chapterService.getById(chapterId);
                if (cancelled) return;
                if (!ch) {
                    setNotFound(true);
                    return;
                }
                setChapter(ch);
            } catch (e) {
                console.error('Failed to load chapter:', e);
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setHeaderLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookService, chapterService, bookSlug, chapterIndex]);

    const fetchPage = useCallback(
        (cursor: PageCursor | undefined) => {
            if (!book) {
                // While the header is loading, defer with an empty page; the deps
                // array will fire another fetch as soon as `book` resolves.
                return Promise.resolve({ items: [], nextCursor: null });
            }
            return verseService.listVersesPage({
                bookId: book.id,
                chapterIndex,
                status: 'published',
                limit: pageSize,
                cursor,
            });
        },
        [verseService, book, chapterIndex, pageSize],
    );

    const { items: verses, loading, pageIndex, hasNext, hasPrev, next, prev } =
        useCursorPagination<Verse>({ fetchPage, deps: [book?.id, chapterIndex, pageSize] });

    if (headerLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]" />
            </div>
        );
    }

    if (notFound || !book || !chapter) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <BookOpen className="w-16 h-16 text-gray-700 mb-4" />
                <h1 className="text-2xl font-semibold text-white">Chapter not found</h1>
                <Link to={basePath} className="mt-6 text-[var(--accent-color)] hover:underline">
                    See all books
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <nav className="pt-8 text-sm text-gray-400 flex items-center gap-2">
                    <Link to={`${basePath}/${book.slug}`} className="hover:text-white inline-flex items-center gap-1">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        {book.title}
                    </Link>
                </nav>

                <header className="mt-4 flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{chapter.label}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {chapter.verseCount} {chapter.verseCount === 1 ? 'verse' : 'verses'}
                        </p>
                    </div>
                    <VerseNavigator bookSlug={book.slug} chapterIndex={chapter.index} basePath={basePath} />
                </header>

                {chapter.intro && (
                    <p className="mt-4 text-gray-400 italic">{chapter.intro}</p>
                )}

                <section className="mt-8">
                    {loading && verses.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">Loading verses…</div>
                    ) : verses.length === 0 ? (
                        <p className="py-10 text-center text-gray-500 italic">
                            No published verses in this chapter yet.
                        </p>
                    ) : (
                        <ul className="divide-y divide-white/10 border-y border-white/10">
                            {verses.map((v) => (
                                <li key={v.id}>
                                    <Link
                                        to={`${basePath}/${book.slug}/${chapter.index}/${v.verseIndex}`}
                                        className="flex items-baseline justify-between py-3 px-2 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-mono text-sm text-[var(--accent-color)]">
                                            {chapter.index}.{v.verseIndex}
                                        </span>
                                        <span className="text-white">
                                            {v.title || <span className="text-gray-500">Verse {v.verseIndex}</span>}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="mt-6">
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
        </div>
    );
};
