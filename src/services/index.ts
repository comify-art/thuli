// @thuli/services barrel — single import surface for the service layer.
// Host apps should `import { BlogAdminService, MediaService } from '@thuli/services'`
// rather than reaching into `@thuli/services/blogService` etc.

export { BaseAdminService } from './baseService';
export type { Page, PageCursor } from './baseService';

export { BlogAdminService } from './blogService';

export { MediaService } from './mediaService';
export type { MediaItemInput, BulkUploadResult, RegenerateResult, OrphanedBlob } from './mediaService';

export { BookService } from './bookService';
export type { BookStats } from './bookService';

export { ChapterService } from './chapterService';

export { VerseService } from './verseService';

// Verse-books domain types are re-exported here so consumers have a single
// import surface: `import { Book, Verse, BookService } from '@thuli/services'`.
export type { Book, Chapter, Verse, VerseContent, Translation, BookTheme, ImportedVerse, ImportFailure, BookStatus, VerseStatus } from '../verse-books/types';
