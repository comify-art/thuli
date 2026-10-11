import {
    Firestore,
    Timestamp,
    doc,
    getDoc,
    setDoc,
    writeBatch,
    orderBy,
    where,
    QueryConstraint,
} from 'firebase/firestore';
import { BaseAdminService, Page, PageCursor } from './baseService';
import type { Verse, VerseContent, Chapter, ImportedVerse, ImportFailure } from '../verse-books/types';

interface VerseServiceConfig {
    versesCollection?: string;
    contentsCollection?: string;
    chaptersCollection?: string;
    booksCollection?: string;
    /** Read-cache TTL in milliseconds. Default 5 minutes — verses change rarely. */
    cacheTtlMs?: number;
}

/**
 * Tiny in-memory TTL cache. Per-instance so each VerseService has its own
 * store; reset by clearing or letting entries expire. No background sweep —
 * entries are validated on read.
 */
class TtlCache<T> {
    private store = new Map<string, { value: T; expiresAt: number }>();
    constructor(private ttlMs: number) {}
    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key: string, value: T): void {
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }
    delete(key: string): void {
        this.store.delete(key);
    }
    clear(): void {
        this.store.clear();
    }
}

/**
 * Read/write Verse + VerseContent documents. The two are kept in lock-step
 * via batched writes — saveDraft/publish always touch both atomically.
 *
 * Verse-by-path lookup uses the predictable id shape `<bookSlug>-<chapter>-<verse>`,
 * so the public URL `/p/verse/<book>/<chapter>/<verse>` resolves to a single
 * getDoc with no extra query.
 */
export class VerseService extends BaseAdminService<Verse> {
    private contentsCollection: string;
    private chaptersCollection: string;
    private booksCollection: string;

    private verseContentCache: TtlCache<{ verse: Verse; content: VerseContent | null } | null>;
    private prevNextCache: TtlCache<{ prevId?: string; nextId?: string }>;

    constructor(db: Firestore, config: VerseServiceConfig = {}) {
        super(db, config.versesCollection ?? 'verses');
        this.contentsCollection = config.contentsCollection ?? 'verse_contents';
        this.chaptersCollection = config.chaptersCollection ?? 'chapters';
        this.booksCollection = config.booksCollection ?? 'books';
        const ttl = config.cacheTtlMs ?? 5 * 60 * 1000;
        this.verseContentCache = new TtlCache(ttl);
        this.prevNextCache = new TtlCache(ttl);
    }

    /** Drop all cached verse/prev-next entries — call after admin-side writes. */
    clearCache(): void {
        this.verseContentCache.clear();
        this.prevNextCache.clear();
    }

    /**
     * Cursor-paginated verse list. With `chapterId`/`chapterIndex`, filters
     * to one chapter; otherwise lists the whole book. Ordered by
     * (chapterIndex, verseIndex) — natural reading order both for admin
     * scanning and the public TOC.
     *
     * Indexes (see docs/specs/tamil-verse-books-v1-prd.md §4.3):
     *   - (bookId, chapterIndex, verseIndex) — no-status queries.
     *   - (bookId, status, chapterIndex, verseIndex) — status-filtered queries.
     *     Equality on a leading prefix + ordering on trailing fields lets
     *     this one index cover both "all chapters" and "this chapter" forms.
     */
    async listVersesPage(opts: {
        bookId: string;
        chapterId?: string;
        chapterIndex?: number;
        status?: 'draft' | 'published';
        limit?: number;
        cursor?: PageCursor | null;
    }): Promise<Page<Verse>> {
        const { bookId, chapterId, chapterIndex, status, limit = 50, cursor } = opts;

        const constraints: QueryConstraint[] = [where('bookId', '==', bookId)];
        if (status) constraints.push(where('status', '==', status));
        if (chapterId) constraints.push(where('chapterId', '==', chapterId));
        if (typeof chapterIndex === 'number') constraints.push(where('chapterIndex', '==', chapterIndex));
        constraints.push(orderBy('chapterIndex', 'asc'));
        constraints.push(orderBy('verseIndex', 'asc'));

        return this.getAllPage(constraints, limit, cursor);
    }

    /**
     * Resolve a public URL path → Verse. The id shape is predictable so this
     * is one getDoc.
     */
    async getVerseByPath(bookSlug: string, chapterIndex: number, verseIndex: number): Promise<Verse | null> {
        const id = `${bookSlug}-${chapterIndex}-${verseIndex}`;
        return this.getById(id);
    }

    /**
     * Single-call join of `verses.id` ↔ `verse_contents.id`. Returns `content: null`
     * if the verse exists but its content document hasn't been written yet
     * (intermediate state during authoring).
     */
    async getVerseWithContent(id: string): Promise<{ verse: Verse; content: VerseContent | null } | null> {
        const cached = this.verseContentCache.get(id);
        if (cached !== undefined) return cached;

        const verse = await this.getById(id);
        if (!verse) {
            this.verseContentCache.set(id, null);
            return null;
        }

        const contentRef = doc(this.db, this.contentsCollection, id);
        const contentSnap = await getDoc(contentRef);
        const result = contentSnap.exists()
            ? { verse, content: contentSnap.data() as VerseContent }
            : { verse, content: null };
        this.verseContentCache.set(id, result);
        return result;
    }

    /**
     * Atomic write of Verse + VerseContent as a draft. Either both land or
     * neither does. `publishedAt` is preserved if already set (re-saving a
     * previously-published verse as a draft is unusual but supported).
     */
    async saveDraft(verse: Verse, content: VerseContent): Promise<void> {
        await this.writeVerseAndContent({ ...verse, status: 'draft' }, content);
    }

    /**
     * Atomic publish: sets `status: 'published'` and stamps `publishedAt`
     * (preserved if already set), writes the content alongside in one batch.
     */
    async publish(verse: Verse, content: VerseContent): Promise<void> {
        const existing = await this.getById(verse.id);
        const now = Timestamp.now();
        await this.writeVerseAndContent(
            {
                ...verse,
                status: 'published',
                publishedAt: existing?.publishedAt ?? now,
            },
            content,
        );
    }

    private async writeVerseAndContent(verse: Verse, content: VerseContent): Promise<void> {
        const now = Timestamp.now();
        const existing = await this.getById(verse.id);

        const verseRef = doc(this.db, this.collectionName, verse.id);
        const contentRef = doc(this.db, this.contentsCollection, verse.id);

        const batch = writeBatch(this.db);
        batch.set(verseRef, {
            ...verse,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        });
        batch.set(contentRef, {
            ...content,
            id: verse.id,
            verseId: verse.id,
            updatedAt: now,
        });
        await batch.commit();

        // Drop cached reads — neighbors' prev/next pointers may also have
        // shifted (e.g. when a new verse fills a previously-missing gap), so
        // clearing the whole prev-next cache is the safe move.
        this.verseContentCache.delete(verse.id);
        this.prevNextCache.clear();
    }

    /**
     * Reader prev/next navigation across chapter boundaries.
     *
     * Walks via predictable verse-IDs (`{bookSlug}-{chapter}-{verse}`) rather
     * than a composite Firestore query — that avoids the dependency on the
     * `(bookId, chapterIndex, verseIndex)` composite index being deployed
     * (the earlier query-based impl silently returned `{}` whenever the
     * composite was missing, leaving Prev/Next perpetually disabled).
     *
     * Chapter-boundary crossing is informed by the chapter doc's `verseCount`
     * — already cached/recomputed by `BookService.recomputeCounts`.
     */
    async prevNext(verseId: string): Promise<{ prevId?: string; nextId?: string }> {
        const cached = this.prevNextCache.get(verseId);
        if (cached) return cached;

        const currentRef = doc(this.db, this.collectionName, verseId);
        const currentSnap = await getDoc(currentRef);
        if (!currentSnap.exists()) return {};

        const current = currentSnap.data() as Verse;
        const { bookId, chapterIndex, verseIndex } = current;

        const verseExists = async (id: string): Promise<boolean> => {
            const snap = await getDoc(doc(this.db, this.collectionName, id));
            return snap.exists();
        };

        const chapterVerseCount = async (cIdx: number): Promise<number | null> => {
            const snap = await getDoc(doc(this.db, this.chaptersCollection, `${bookId}-${cIdx}`));
            if (!snap.exists()) return null;
            return (snap.data() as Chapter).verseCount;
        };

        // --- next ---------------------------------------------------------
        const resolveNext = async (): Promise<string | undefined> => {
            const sameChapter = `${bookId}-${chapterIndex}-${verseIndex + 1}`;
            if (await verseExists(sameChapter)) return sameChapter;
            const nextChapterFirst = `${bookId}-${chapterIndex + 1}-1`;
            if (await verseExists(nextChapterFirst)) return nextChapterFirst;
            return undefined;
        };

        // --- prev ---------------------------------------------------------
        const resolvePrev = async (): Promise<string | undefined> => {
            if (verseIndex > 1) {
                const sameChapter = `${bookId}-${chapterIndex}-${verseIndex - 1}`;
                if (await verseExists(sameChapter)) return sameChapter;
            }
            if (chapterIndex > 1) {
                const prevCount = await chapterVerseCount(chapterIndex - 1);
                if (prevCount && prevCount > 0) {
                    const prevChapterLast = `${bookId}-${chapterIndex - 1}-${prevCount}`;
                    if (await verseExists(prevChapterLast)) return prevChapterLast;
                }
            }
            return undefined;
        };

        const [nextId, prevId] = await Promise.all([resolveNext(), resolvePrev()]);
        const result = { prevId, nextId };
        this.prevNextCache.set(verseId, result);
        return result;
    }

    /**
     * Bulk-import verses into a book. Creates missing chapters on the fly
     * (using the supplied chapterLabel or a default of "Chapter N"). Writes
     * are issued in batches of 250 to stay well under Firestore's 500-op
     * batch ceiling (each verse uses two ops: verse + content).
     *
     * Caller is responsible for invoking `BookService.recomputeCounts(bookId)`
     * after this resolves — we don't reach into a sibling service from here.
     */
    async bulkImport(
        bookId: string,
        verses: ImportedVerse[],
    ): Promise<{ imported: number; failures: ImportFailure[] }> {
        const failures: ImportFailure[] = [];
        let imported = 0;

        // Track which chapters need to be created or have their verseCount bumped.
        const chapterIndexes = new Set<number>();
        for (const v of verses) chapterIndexes.add(v.chapterIndex);

        // Resolve / create chapter scaffolding first so verses can reference them.
        const knownChapterIds = new Map<number, string>();
        for (const cIdx of chapterIndexes) {
            const chapterId = `${bookId}-${cIdx}`;
            const ref = doc(this.db, this.chaptersCollection, chapterId);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                const label = verses.find((v) => v.chapterIndex === cIdx)?.chapterLabel ?? `Chapter ${cIdx}`;
                const now = Timestamp.now();
                const chapter: Chapter = {
                    id: chapterId,
                    bookId,
                    index: cIdx,
                    label,
                    verseCount: 0,
                    createdAt: now,
                    updatedAt: now,
                };
                await setDoc(ref, chapter);
            }
            knownChapterIds.set(cIdx, chapterId);
        }

        // Chunk into batches of 250 verses (each verse = 2 writes = 500-op batch).
        const CHUNK = 250;
        for (let i = 0; i < verses.length; i += CHUNK) {
            const slice = verses.slice(i, i + CHUNK);
            const batch = writeBatch(this.db);
            const now = Timestamp.now();

            for (const v of slice) {
                try {
                    const verseId = `${bookId}-${v.chapterIndex}-${v.verseIndex}`;
                    const chapterId = knownChapterIds.get(v.chapterIndex);
                    if (!chapterId) {
                        throw new Error(`Missing chapter scaffold for chapter ${v.chapterIndex}`);
                    }

                    const verse: Verse = {
                        id: verseId,
                        bookId,
                        chapterId,
                        chapterIndex: v.chapterIndex,
                        verseIndex: v.verseIndex,
                        status: 'published',
                        createdAt: now,
                        updatedAt: now,
                        publishedAt: now,
                    };
                    const content: VerseContent = {
                        id: verseId,
                        verseId,
                        original: v.original,
                        translations: v.translations,
                        updatedAt: now,
                    };
                    batch.set(doc(this.db, this.collectionName, verseId), verse);
                    batch.set(doc(this.db, this.contentsCollection, verseId), content);
                    imported++;
                } catch (e) {
                    failures.push({
                        chapterIndex: v.chapterIndex,
                        verseIndex: v.verseIndex,
                        error: (e as Error).message,
                    });
                }
            }

            try {
                await batch.commit();
            } catch (e) {
                // Whole chunk failed — record every verse in the chunk as a failure
                // and subtract them from the imported count.
                imported -= slice.length;
                for (const v of slice) {
                    failures.push({
                        chapterIndex: v.chapterIndex,
                        verseIndex: v.verseIndex,
                        error: `Batch commit failed: ${(e as Error).message}`,
                    });
                }
            }
        }

        // Reference booksCollection so the field-init isn't flagged unused; reserved
        // for a future enhancement where bulkImport recomputes Book counts itself.
        void this.booksCollection;

        // Bulk-import touches many verses + chapter scaffolds — safest to drop
        // the entire read cache rather than try to evict per-id.
        this.clearCache();

        return { imported, failures };
    }
}
