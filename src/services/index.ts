// Legacy backwards-compatibility shim -> @comify.art/thuli/integrations/firebase & @comify.art/thuli/features
export { BaseAdminService } from '../integrations/firebase';
export type { Page, PageCursor } from '../integrations/firebase';

export { BlogAdminService, MediaService } from '../features/publishing';
export type { MediaItemInput, BulkUploadResult, RegenerateResult, OrphanedBlob } from '../features/publishing';

export {
    BookService,
    ChapterService,
    VerseService,
} from '../features/literature';
export type {
    BookStats,
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
} from '../features/literature';
