import {
    Firestore,
    Timestamp,
    orderBy,
    where,
    QueryConstraint,
    getCountFromServer,
    query,
    collection,
    getDocs,
    doc,
    writeBatch,
} from 'firebase/firestore';
import { BaseAdminService, Page, PageCursor } from './baseService';
import type { Book } from '../verse-books/types';

export interface BookStats {
    chapters: number;
    verses: number;
    draftVerses: number;
    publishedVerses: number;
}

/**
 * Read/write Book documents. Slug === id, so `getBookBySlug` is just `getById`
 * under a clearer name. Counts (chapterCount, verseCount) are cached on the
 * Book document and refreshed via `recomputeCounts`.
 */
export class BookService extends BaseAdminService<Book> {
    private chaptersCollection: string;
    private versesCollection: string;

    constructor(
        db: Firestore,
        config: {
            booksCollection?: string;
            chaptersCollection?: string;
            versesCollection?: string;
        } = {},
    ) {
        super(db, config.booksCollection ?? 'books');
        this.chaptersCollection = config.chaptersCollection ?? 'chapters';
        this.versesCollection = config.versesCollection ?? 'verses';
    }

    /** Admin "all books" — small N, no pagination needed. */
    async listBooks(): Promise<Book[]> {
        return this.getAll([orderBy('updatedAt', 'desc')]);
    }

    /** Cursor-paginated admin listing. Useful once the catalog grows. */
    async listBooksPage(opts: { limit?: number; cursor?: PageCursor | null } = {}): Promise<Page<Book>> {
        const { limit = 25, cursor } = opts;
        return this.getAllPage([orderBy('updatedAt', 'desc')], limit, cursor);
    }

    /** Public published books, ordered by most-recently-published. */
    async listPublishedBooks(): Promise<Book[]> {
        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
        ];
        return this.getAll(constraints);
    }

    /** Slug equals id, so this is `getById` under a more legible name. */
    async getBookBySlug(slug: string): Promise<Book | null> {
        return this.getById(slug);
    }

    async saveBook(book: Book): Promise<void> {
        const existing = await this.getById(book.id);
        if (existing) {
            await this.update(book.id, { ...book, createdAt: existing.createdAt });
        } else {
            await this.create(book);
        }
    }

    async publishBook(id: string): Promise<void> {
        const now = Timestamp.now();
        const existing = await this.getById(id);
        await this.update(id, {
            status: 'published',
            publishedAt: existing?.publishedAt || now,
        } as Partial<Book>);
    }

    async unpublishBook(id: string): Promise<void> {
        await this.update(id, { status: 'draft' } as Partial<Book>);
    }

    async getStats(bookId: string): Promise<BookStats> {
        const chaptersQ = query(
            collection(this.db, this.chaptersCollection),
            where('bookId', '==', bookId),
        );
        const versesQ = query(
            collection(this.db, this.versesCollection),
            where('bookId', '==', bookId),
        );
        const draftQ = query(
            collection(this.db, this.versesCollection),
            where('bookId', '==', bookId),
            where('status', '==', 'draft'),
        );
        const publishedQ = query(
            collection(this.db, this.versesCollection),
            where('bookId', '==', bookId),
            where('status', '==', 'published'),
        );

        const [c, v, d, p] = await Promise.all([
            getCountFromServer(chaptersQ),
            getCountFromServer(versesQ),
            getCountFromServer(draftQ),
            getCountFromServer(publishedQ),
        ]);

        return {
            chapters: c.data().count,
            verses: v.data().count,
            draftVerses: d.data().count,
            publishedVerses: p.data().count,
        };
    }

    /**
     * Refresh cached counts on the Book doc AND on every chapter doc from
     * live aggregate queries. Idempotent. Worth running after bulk imports,
     * mass deletes, or chapter renumbering.
     */
    async recomputeCounts(bookId: string): Promise<void> {
        const stats = await this.getStats(bookId);
        await this.update(bookId, {
            chapterCount: stats.chapters,
            verseCount: stats.verses,
        } as Partial<Book>);

        // Refresh each chapter's verseCount in parallel.
        const chaptersSnap = await getDocs(
            query(collection(this.db, this.chaptersCollection), where('bookId', '==', bookId)),
        );
        if (chaptersSnap.empty) return;

        const perChapterCounts = await Promise.all(
            chaptersSnap.docs.map(async (chapterDoc) => {
                const chapter = chapterDoc.data() as { index: number };
                const q = query(
                    collection(this.db, this.versesCollection),
                    where('bookId', '==', bookId),
                    where('chapterIndex', '==', chapter.index),
                );
                const c = await getCountFromServer(q);
                return { id: chapterDoc.id, count: c.data().count };
            }),
        );

        const batch = writeBatch(this.db);
        const now = Timestamp.now();
        for (const { id, count } of perChapterCounts) {
            batch.update(doc(this.db, this.chaptersCollection, id), {
                verseCount: count,
                updatedAt: now,
            });
        }
        await batch.commit();
    }
}
