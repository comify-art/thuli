import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BookService } from '../../services/bookService';
import { ChapterService } from '../../services/chapterService';
import { MediaService } from '../../services/mediaService';
import { MarkdownRenderer } from '../../ui/MarkdownRenderer';
import { blogLinkResolvers } from '../../blog/linkResolvers';
import { verseLinkResolver } from '../linkResolvers';
import { VerseNavigator } from './VerseNavigator';
import type { Book, Chapter } from '../types';

interface BookHomeProps {
    bookService: BookService;
    chapterService: ChapterService;
    mediaService?: MediaService;
    bookSlug: string;
    /** Public base path for verse routes. Defaults to `/p/verse`. */
    basePath?: string;
}

/**
 * Public landing page for one book.
 *
 * Lays out cover + title + subtitle + translator credit, a chapter index,
 * a jump-to-verse navigator, and the book's rights/terms block. Loads the
 * cover image via `MediaService.resolveSlugs` if it's a `slug:` reference.
 */
export const BookHome: React.FC<BookHomeProps> = ({
    bookService,
    chapterService,
    mediaService,
    bookSlug,
    basePath = '/p/verse',
}) => {
    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const b = await bookService.getBookBySlug(bookSlug);
                if (cancelled) return;
                if (!b) {
                    setNotFound(true);
                    setBook(null);
                    setChapters([]);
                    return;
                }
                setBook(b);

                // Resolve cover image (slug: → URL) and load chapters in parallel.
                const [chs, resolvedCover] = await Promise.all([
                    chapterService.listChapters(b.id),
                    resolveCover(b.coverImageUrl, mediaService),
                ]);
                if (cancelled) return;
                setChapters(chs);
                setCoverUrl(resolvedCover);
            } catch (e) {
                console.error('Failed to load book home:', e);
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookService, chapterService, mediaService, bookSlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]" />
            </div>
        );
    }

    if (notFound || !book) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <BookOpen className="w-16 h-16 text-gray-700 mb-4" />
                <h1 className="text-2xl font-semibold text-white">Book not found</h1>
                <p className="text-gray-400 mt-2">
                    No published book with slug <code className="font-mono">{bookSlug}</code>.
                </p>
                <Link to={basePath} className="mt-6 text-[var(--accent-color)] hover:underline">
                    See all books
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="pt-12 pb-8 flex flex-col sm:flex-row gap-8 items-start">
                    {coverUrl && (
                        <img
                            src={coverUrl}
                            alt={book.title}
                            className="w-48 h-48 object-cover rounded-lg border border-white/10 shadow-lg flex-shrink-0"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white">{book.title}</h1>
                        {book.subtitle && (
                            <p className="mt-2 text-xl text-gray-400">{book.subtitle}</p>
                        )}
                        {book.translator && (
                            <p className="mt-4 text-sm text-gray-500">
                                Translation by <span className="text-gray-300">{book.translator}</span>
                            </p>
                        )}
                        <div className="mt-6">
                            <VerseNavigator bookSlug={book.slug} basePath={basePath} />
                        </div>
                    </div>
                </header>

                {/* Chapter index */}
                <section className="mt-8">
                    <h2 className="text-lg font-semibold text-white mb-4 uppercase tracking-wide text-sm">
                        Chapters
                    </h2>
                    {chapters.length === 0 ? (
                        <p className="text-gray-500 italic">No chapters yet.</p>
                    ) : (
                        <ul className="divide-y divide-white/10 border-y border-white/10">
                            {chapters.map((ch) => (
                                <li key={ch.id}>
                                    <Link
                                        to={`${basePath}/${book.slug}/${ch.index}`}
                                        className="flex items-center justify-between py-4 px-2 hover:bg-white/5 transition-colors"
                                    >
                                        <div>
                                            <p className="text-white font-medium">
                                                {ch.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {ch.verseCount} {ch.verseCount === 1 ? 'verse' : 'verses'}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-500" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Rights / terms */}
                {book.rights && (
                    <footer className="mt-12 pt-6 border-t border-white/10 text-sm text-gray-400">
                        <MarkdownRenderer
                            content={book.rights}
                            linkResolvers={[verseLinkResolver({ basePath }), ...blogLinkResolvers]}
                            className="prose prose-invert prose-sm max-w-none"
                            linkClassName="text-[var(--accent-color)] hover:underline"
                        />
                    </footer>
                )}
            </div>
        </div>
    );
};

async function resolveCover(
    coverImageUrl: string | undefined,
    mediaService: MediaService | undefined,
): Promise<string | undefined> {
    if (!coverImageUrl) return undefined;
    if (!coverImageUrl.startsWith('slug:')) return coverImageUrl;
    if (!mediaService) return undefined;
    const slug = coverImageUrl.slice('slug:'.length);
    const map = await mediaService.resolveSlugs([slug]);
    return map[slug];
}
