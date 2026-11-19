import { Timestamp } from 'firebase/firestore';

/**
 * Domain types for the Tamil Verse Books framework. The canonical source is
 * docs/specs/tamil-verse-books-v1-prd.md §4.2 — keep in sync.
 *
 * Firestore document IDs follow these conventions:
 *   - books/{bookSlug}                            (e.g. 'thirumandhiram')
 *   - chapters/{bookSlug}-{chapterIndex}          (e.g. 'thirumandhiram-1')
 *   - verses/{bookSlug}-{chapterIndex}-{verseIndex}
 *   - verse_contents/{verseId}                    (same id as the matching verse)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Theme — reserved on Book; v1 ignores the field and uses defaults. Per-book
// theming lands in P3 (BookThemeProvider). See framework doc §Theming.

export interface BookTheme {
    accent?: string;
    surface?: string;
    surfaceText?: string;
    verseText?: string;
    scriptFont?: string;
    bodyFont?: string;
    ornament?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations — one VerseContent holds many. v1 uses a single translator
// per book (credited on Book.translator); the array still exists so each
// verse can carry multiple bodies (English meaning, Tamil meaning, future
// commentary variants) without a schema migration.

export interface Translation {
    /** ISO-639-1 language code, e.g. 'en', 'ta'. Free-form for extensibility. */
    language: string;
    /** Free-form sub-type, e.g. 'meaning', 'literal', 'commentary'. */
    variant?: string;
    /** Markdown. */
    body: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export type BookStatus = 'draft' | 'published';
export type VerseStatus = 'draft' | 'published';

export interface Book {
    id: string;
    /** URL segment; === id. Kept as a field for queryability and forward-compat. */
    slug: string;
    title: string;
    subtitle?: string;
    /** `slug:<media-slug>` reference resolved via `MediaService`, or a full URL. */
    coverImageUrl?: string;
    /** Single translator credit for v1; future revisions may shift to per-translation. */
    translator?: string;
    /** Markdown rights/terms block rendered on book home + page footer. */
    rights?: string;
    /** Reserved for P3 theming. v1 components ignore this field. */
    theme?: BookTheme;
    /** ISO-639-1 codes the book ships, e.g. ['ta','en']. */
    languages: string[];
    /** Cached, recomputed on chapter add/remove. */
    chapterCount: number;
    /** Cached, recomputed on verse add/remove. */
    verseCount: number;
    status: BookStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
}

export interface Chapter {
    id: string;
    bookId: string;
    /** 1-based ordinal within the book. */
    index: number;
    /** Display label, e.g. "Tantra 1". */
    label: string;
    /** Optional markdown shown above the verse list on the chapter page. */
    intro?: string;
    /** Cached, recomputed on verse add/remove. */
    verseCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Verse {
    id: string;
    bookId: string;
    chapterId: string;
    /** Denormalized from the parent chapter for ordered queries without a join. */
    chapterIndex: number;
    /** 1-based ordinal within the chapter. */
    verseIndex: number;
    /** Optional short label; most verses have none. */
    title?: string;
    /** Reserved for P2 audio integration; null in v1. */
    audioId?: string;
    status: VerseStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
}

export interface VerseContent {
    id: string;
    verseId: string;
    /** Canonical Tamil verse (markdown allowed). */
    original: string;
    translations: Translation[];
    updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Importer DTOs — used by VerseImporter (P1.5) and by VerseService.bulkImport.

export interface ImportedVerse {
    chapterIndex: number;
    /** 1-based label for the chapter ("Tantra 1" etc). Used only when the chapter doesn't yet exist. */
    chapterLabel?: string;
    verseIndex: number;
    original: string;
    translations: Translation[];
}

export interface ImportFailure {
    chapterIndex: number;
    verseIndex: number;
    error: string;
}
