import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { BookService } from '../../services/bookService';
import { VerseService } from '../../services/verseService';
import { MediaService } from '../../services/mediaService';
import { MarkdownRenderer } from '../../ui/MarkdownRenderer';
import { blogLinkResolvers } from '../../blog/linkResolvers';
import { verseLinkResolver } from '../linkResolvers';
import { AsyncImage } from '../../blog/ui/AsyncImage';
import { VerseNavigator } from './VerseNavigator';
import type { Book, Verse, VerseContent } from '../types';

interface VersePageProps {
    bookService: BookService;
    verseService: VerseService;
    mediaService?: MediaService;
    bookSlug: string;
    chapterIndex: number;
    verseIndex: number;
    basePath?: string;
}

/**
 * Public reader for a single verse.
 *
 * Loads the verse + content (single join via `verses.id === verse_contents.id`),
 * fetches prev/next ids in parallel, renders the canonical original above
 * each translation. Uses `MarkdownRenderer` with the verse-link resolver +
 * blog resolvers so `verse:`, `slug:` (image), and `/x/`, `/f/` refs all
 * route correctly.
 */
export const VersePage: React.FC<VersePageProps> = ({
    bookService,
    verseService,
    mediaService,
    bookSlug,
    chapterIndex,
    verseIndex,
    basePath = '/p/verse',
}) => {
    const navigate = useNavigate();

    const [book, setBook] = useState<Book | null>(null);
    const [verse, setVerse] = useState<Verse | null>(null);
    const [content, setContent] = useState<VerseContent | null>(null);
    const [prevId, setPrevId] = useState<string | undefined>();
    const [nextId, setNextId] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            // Don't wipe state or re-show the spinner on subsequent navigation
            // — keep the current verse visible until the new one is ready, then
            // swap atomically. The initial mount still shows the spinner because
            // `loading` starts as true.
            setNotFound(false);
            const verseId = `${bookSlug}-${chapterIndex}-${verseIndex}`;
            try {
                const [b, joined] = await Promise.all([
                    bookService.getBookBySlug(bookSlug),
                    verseService.getVerseWithContent(verseId),
                ]);
                if (cancelled) return;
                if (!b || !joined) {
                    setNotFound(true);
                    setVerse(null);
                    setContent(null);
                    return;
                }
                setBook(b);
                setVerse(joined.verse);
                setContent(joined.content);
            } catch (e) {
                console.error('Failed to load verse:', e);
                if (!cancelled) setNotFound(true);
                return;
            } finally {
                if (!cancelled) setLoading(false);
            }

            // Best-effort prev/next nav — never blocks the verse from showing.
            try {
                const nav = await verseService.prevNext(verseId);
                if (cancelled) return;
                setPrevId(nav.prevId);
                setNextId(nav.nextId);
            } catch (e) {
                console.warn('prevNext failed (verse still rendered):', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookService, verseService, bookSlug, chapterIndex, verseIndex]);

    const linkResolvers = [verseLinkResolver({ basePath }), ...blogLinkResolvers];
    const linkClass = 'text-[var(--accent-color)] hover:underline';
    const imageRenderer = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <AsyncImage {...props} mediaService={mediaService} className="rounded-lg my-4 max-w-full h-auto" />
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]" />
            </div>
        );
    }

    if (notFound || !book || !verse) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <BookOpen className="w-16 h-16 text-gray-700 mb-4" />
                <h1 className="text-2xl font-semibold text-white">Verse not found</h1>
                <p className="text-gray-400 mt-2">
                    No verse at <code className="font-mono">{bookSlug}/{chapterIndex}/{verseIndex}</code>.
                </p>
                <Link to={`${basePath}/${bookSlug}`} className="mt-6 text-[var(--accent-color)] hover:underline">
                    Back to {bookSlug}
                </Link>
            </div>
        );
    }

    const goToVerseId = (id: string) => {
        // id shape: `${bookSlug}-${chapter}-${verse}` — flip dashes back to the URL form.
        const parts = id.split('-');
        if (parts.length < 3) return;
        // The book slug itself may contain dashes (e.g. `tamil-veda`), so chapter
        // and verse are always the last two segments.
        const v = parts.pop()!;
        const c = parts.pop()!;
        const slug = parts.join('-');
        navigate(`${basePath}/${slug}/${c}/${v}`);
    };

    const verseLabel = `${chapterIndex}.${verseIndex}`;

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-3xl mx-auto">
                {/* Compact header: breadcrumb + prev/next + jump-to-verse share a single row. */}
                <div className="pt-3 flex items-center justify-between gap-4 flex-wrap">
                    <nav className="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
                        <Link to={`${basePath}/${book.slug}`} className="hover:text-white inline-flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            {book.title}
                        </Link>
                        <span className="opacity-50">/</span>
                        <Link to={`${basePath}/${book.slug}/${chapterIndex}`} className="hover:text-white">
                            Chapter {chapterIndex}
                        </Link>
                        <span className="opacity-50">/</span>
                        <span className="text-white font-mono">{verseLabel}</span>
                    </nav>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => prevId && goToVerseId(prevId)}
                            disabled={!prevId}
                            title={prevId ? `Previous · ${formatVerseLabel(prevId, book.slug)}` : 'No previous verse'}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--accent-color)]/40 bg-white/5 text-white text-sm hover:bg-[var(--accent-color)]/15 hover:border-[var(--accent-color)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="font-mono">{prevId ? formatVerseLabel(prevId, book.slug) : '—'}</span>
                        </button>
                        <button
                            onClick={() => nextId && goToVerseId(nextId)}
                            disabled={!nextId}
                            title={nextId ? `Next · ${formatVerseLabel(nextId, book.slug)}` : 'No next verse'}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--accent-color)]/40 bg-white/5 text-white text-sm hover:bg-[var(--accent-color)]/15 hover:border-[var(--accent-color)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="font-mono">{nextId ? formatVerseLabel(nextId, book.slug) : '—'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <VerseNavigator bookSlug={book.slug} chapterIndex={chapterIndex} basePath={basePath} />
                    </div>
                </div>

                {verse.title && (
                    <h1 className="mt-3 text-xl text-gray-300">{verse.title}</h1>
                )}

                {/* Canonical original — most prominent panel on the page. Verse label
                    floats in the bottom-right corner so the header stays compact. */}
                <article
                    className="relative mt-3 rounded-xl px-8 py-10 sm:px-12 sm:py-12 border border-[var(--accent-color)]/30 bg-gradient-to-br from-white/5 to-transparent shadow-lg"
                >
                    {content ? (
                        <div className="verse-original font-serif text-2xl sm:text-3xl leading-[1.7] text-white [&_p]:mb-0 [&_p+p]:mt-4">
                            <MarkdownRenderer
                                content={content.original}
                                linkResolvers={linkResolvers}
                                linkClassName={linkClass}
                                imageRenderer={imageRenderer}
                                preserveLineBreaks
                            />
                        </div>
                    ) : (
                        <p className="italic text-gray-500">Original verse text not yet available.</p>
                    )}
                    <span
                        aria-hidden
                        className="absolute bottom-3 right-4 text-sm sm:text-md font-light text-[var(--accent-color)]/70 font-mono leading-none select-none pointer-events-none"
                    >
                        {verseLabel}
                    </span>
                </article>

                {/* Translations — each one its own labeled card with preserved line breaks. */}
                {content && content.translations.length > 0 && (
                    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {content.translations.map((t, i) => (
                            <div
                                key={`${t.language}-${t.variant ?? 'default'}-${i}`}
                                className="rounded-lg border border-white/10 bg-black/20 px-5 py-5"
                            >
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-color)] mb-3 border-b border-white/10 pb-2">
                                    {translationHeading(t.language, t.variant)}
                                </h2>
                                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-2 [&_p]:leading-relaxed">
                                    <MarkdownRenderer
                                        content={t.body}
                                        linkResolvers={linkResolvers}
                                        linkClassName={linkClass}
                                        imageRenderer={imageRenderer}
                                        preserveLineBreaks
                                    />
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Book rights / terms — clearly secondary, well below the reader content. */}
                {book.rights && (
                    <footer className="mt-20 pt-6 border-t border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                            Rights &amp; Terms
                        </p>
                        <div className="prose prose-invert prose-xs max-w-none text-xs text-gray-500 [&_p]:my-1 [&_a]:text-gray-400">
                            <MarkdownRenderer
                                content={book.rights}
                                linkResolvers={linkResolvers}
                                linkClassName="text-gray-400 hover:text-gray-200 underline"
                            />
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

function formatVerseLabel(verseId: string, bookSlug: string): string {
    // id shape: `${bookSlug}-${chapter}-${verse}` — book slug may include dashes,
    // so peel from the right.
    const stripped = verseId.startsWith(bookSlug + '-') ? verseId.slice(bookSlug.length + 1) : verseId;
    const parts = stripped.split('-');
    if (parts.length < 2) return verseId;
    const v = parts.pop();
    const c = parts.join('-');
    return `${c}.${v}`;
}

function translationHeading(language: string, variant: string | undefined): string {
    const lang = LANGUAGE_LABELS[language] ?? language.toUpperCase();
    if (!variant) return lang;
    return `${lang} — ${variant}`;
}

const LANGUAGE_LABELS: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
};
