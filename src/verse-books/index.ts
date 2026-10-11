// @thuli/verse-books barrel — prefer these named imports over deep module paths.

// Public reader UI (P1.3)
export { BookHome } from './ui/BookHome';
export { ChapterTOC } from './ui/ChapterTOC';
export { VersePage } from './ui/VersePage';
export { VerseNavigator } from './ui/VerseNavigator';
export { BookListPublic } from './ui/BookListPublic';

// Admin authoring UI (P1.4)
export { BookList } from './admin/BookList';
export { BookEditor } from './admin/BookEditor';
export { VerseList } from './admin/VerseList';
export { VerseEditor } from './admin/VerseEditor';

// Importer (P1.5)
export { VerseImporter } from './admin/VerseImporter';
export { parsePackText, parsePackBatch } from './parsers/packFormat';
export type { ParsedFile } from './parsers/packFormat';

// Link resolver factory (consumed by MarkdownRenderer).
export { verseLinkResolver } from './linkResolvers';

// Domain types — also re-exported from `@thuli/services` for ergonomic imports
// alongside the services. Either import surface works.
export type {
    Book,
    Chapter,
    Verse,
    VerseContent,
    Translation,
    BookTheme,
    ImportedVerse,
    ImportFailure,
    BookStatus,
    VerseStatus,
} from './types';
