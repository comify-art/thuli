// Container 4: Literature Feature (Verse Books)

// Public reader UI
export { BookHome } from './ui/BookHome';
export { ChapterTOC } from './ui/ChapterTOC';
export { VersePage } from './ui/VersePage';
export { VerseNavigator } from './ui/VerseNavigator';
export { BookListPublic } from './ui/BookListPublic';

// Admin authoring UI
export { BookList } from './admin/BookList';
export { BookEditor } from './admin/BookEditor';
export { VerseList } from './admin/VerseList';
export { VerseEditor } from './admin/VerseEditor';

// Importer
export { VerseImporter } from './admin/VerseImporter';
export { parsePackText, parsePackBatch } from './parsers/packFormat';
export type { ParsedFile } from './parsers/packFormat';

// Link resolver factory
export { verseLinkResolver } from './linkResolvers';

// Services
export { BookService } from './services/bookService';
export type { BookStats } from './services/bookService';
export { ChapterService } from './services/chapterService';
export { VerseService } from './services/verseService';

// Domain types
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
