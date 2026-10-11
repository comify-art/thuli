import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { BookService } from '../../services/bookService';
import { MediaService } from '../../services/mediaService';
import type { Book } from '../types';

interface BookListPublicProps {
    bookService: BookService;
    mediaService?: MediaService;
    basePath?: string;
    title?: string;
    subtitle?: string;
}

/**
 * Minimal landing for `/p/verse` — lists every published book as a card with
 * cover + title + translator + verse count.
 *
 * v1 keeps this small and book-specific. If/when this needs the "Load more"
 * pagination machinery from `BlogList`, we'll consider lifting that grid via
 * the `renderCard` prop added in G2.
 */
export const BookListPublic: React.FC<BookListPublicProps> = ({
    bookService,
    mediaService,
    basePath = '/p/verse',
    title = 'Verse Books',
    subtitle = 'Bilingual readers for classical Tamil texts.',
}) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const list = await bookService.listPublishedBooks();
                if (cancelled) return;
                setBooks(list);

                // Resolve any slug: cover refs in one batched call.
                const slugs = list
                    .map((b) => b.coverImageUrl)
                    .filter((u): u is string => !!u && u.startsWith('slug:'))
                    .map((u) => u.slice('slug:'.length));
                if (mediaService && slugs.length > 0) {
                    const map = await mediaService.resolveSlugs(slugs);
                    if (!cancelled) setCoverUrls(map);
                }
            } catch (e) {
                console.error('Failed to load published books:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookService, mediaService]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-5xl mx-auto">
                <header className="text-center pt-12 pb-10">
                    <h1 className="text-4xl font-bold text-white">{title}</h1>
                    <p className="mt-3 text-gray-400">{subtitle}</p>
                </header>

                {books.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400">No published books yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {books.map((b) => {
                            const cover = b.coverImageUrl?.startsWith('slug:')
                                ? coverUrls[b.coverImageUrl.slice('slug:'.length)]
                                : b.coverImageUrl;
                            return (
                                <Link
                                    key={b.id}
                                    to={`${basePath}/${b.slug}`}
                                    className="block rounded-lg overflow-hidden border border-white/10 hover:border-[var(--accent-color)] transition-colors bg-black/30"
                                >
                                    {cover ? (
                                        <img src={cover} alt={b.title} className="w-full h-48 object-cover" />
                                    ) : (
                                        <div className="w-full h-48 flex items-center justify-center bg-black/40">
                                            <BookOpen className="w-12 h-12 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold text-white">{b.title}</h2>
                                        {b.subtitle && (
                                            <p className="text-sm text-gray-400 mt-1">{b.subtitle}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            {b.verseCount} {b.verseCount === 1 ? 'verse' : 'verses'}
                                            {b.translator && ` · tr. ${b.translator}`}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
