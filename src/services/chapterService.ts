import {
    Firestore,
    orderBy,
    where,
    QueryConstraint,
    query,
    collection,
    getCountFromServer,
} from 'firebase/firestore';
import { BaseAdminService } from './baseService';
import type { Chapter } from '../verse-books/types';

/**
 * Read/write Chapter documents. Thin by design — most editing happens at
 * the Book level (creating the chapter scaffold) or at the Verse level
 * (authoring content). Chapter primarily exists as an ordering + grouping
 * scaffold.
 */
export class ChapterService extends BaseAdminService<Chapter> {
    private versesCollection: string;

    constructor(
        db: Firestore,
        config: { chaptersCollection?: string; versesCollection?: string } = {},
    ) {
        super(db, config.chaptersCollection ?? 'chapters');
        this.versesCollection = config.versesCollection ?? 'verses';
    }

    /** Ordered chapter list within a book. */
    async listChapters(bookId: string): Promise<Chapter[]> {
        const constraints: QueryConstraint[] = [
            where('bookId', '==', bookId),
            orderBy('index', 'asc'),
        ];
        return this.getAll(constraints);
    }

    async saveChapter(chapter: Chapter): Promise<void> {
        const existing = await this.getById(chapter.id);
        if (existing) {
            await this.update(chapter.id, { ...chapter, createdAt: existing.createdAt });
        } else {
            await this.create(chapter);
        }
    }

    /**
     * Refuses to delete a chapter that still has verses pointing at it.
     * Forces the caller to either reassign or delete those verses first
     * (avoids orphan verses with broken chapterId pointers).
     */
    async deleteChapter(id: string): Promise<void> {
        const referenced = query(
            collection(this.db, this.versesCollection),
            where('chapterId', '==', id),
        );
        const snap = await getCountFromServer(referenced);
        if (snap.data().count > 0) {
            throw new Error(
                `Chapter ${id} still has ${snap.data().count} verse(s) — delete or reassign them before removing the chapter.`,
            );
        }
        await this.delete(id);
    }
}
