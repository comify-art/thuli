import type { ImportedVerse } from '../types';

const BOUNDARY = '---TAMIL_MANDHIRAM_PACK_v1';

export interface ParsedFile {
    book?: string;
    chapter: number;
    verseIndex: number;
    /** Successfully parsed verse, or null if the file was malformed. */
    verse: ImportedVerse | null;
    error?: string;
    /** Original filename (or pseudo-name for pasted text), for error reporting. */
    source: string;
}

/**
 * Parse a single legacy `---TAMIL_MANDHIRAM_PACK_v1` file.
 *
 * Shape (see `tamilmandhiram/src/content/1/1-1.txt`):
 *
 *   version: 1.0.0
 *   book: Thirumandhiram
 *   chapter: 1
 *   index: N
 *   datetime: <ISO>
 *
 *   ---TAMIL_MANDHIRAM_PACK_v1
 *   <Tamil verse>
 *   ---TAMIL_MANDHIRAM_PACK_v1
 *   <English meaning>
 *   ---TAMIL_MANDHIRAM_PACK_v1
 *   <Tamil meaning>
 *
 * The English-meaning body can contain arbitrary trailing notes; we treat
 * everything between boundaries as the body verbatim.
 */
export function parsePackText(text: string, source: string = 'pasted'): ParsedFile {
    const lines = text.split(/\r?\n/);

    // Walk the header until the first blank line.
    const header: Record<string, string> = {};
    let i = 0;
    for (; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            i++;
            break;
        }
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
        if (match) {
            header[match[1].toLowerCase()] = match[2].trim();
        }
    }

    const chapter = Number(header.chapter);
    const verseIndex = Number(header.index);
    if (!Number.isFinite(chapter) || !Number.isFinite(verseIndex)) {
        return {
            book: header.book,
            chapter: Number.isFinite(chapter) ? chapter : NaN,
            verseIndex: Number.isFinite(verseIndex) ? verseIndex : NaN,
            verse: null,
            error: `Header missing or invalid chapter/index (chapter="${header.chapter}", index="${header.index}")`,
            source,
        };
    }

    // Everything from `i` onward is the body. Split on the boundary line; the
    // body usually starts with a leading boundary marker which makes split
    // produce a leading empty string we discard.
    const body = lines.slice(i).join('\n');
    const sections = body
        .split(new RegExp(`^${BOUNDARY}\\s*$`, 'm'))
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (sections.length < 1) {
        return {
            book: header.book,
            chapter,
            verseIndex,
            verse: null,
            error: 'No content sections found after header.',
            source,
        };
    }

    const original = sections[0];
    const translations = [];
    if (sections[1]) translations.push({ language: 'en', variant: 'meaning', body: sections[1] });
    if (sections[2]) translations.push({ language: 'ta', variant: 'meaning', body: sections[2] });
    // Any additional sections are appended as further translations with the
    // same convention; in practice the legacy format never has more than 3.
    for (let s = 3; s < sections.length; s++) {
        translations.push({ language: 'en', variant: `extra-${s}`, body: sections[s] });
    }

    return {
        book: header.book,
        chapter,
        verseIndex,
        verse: {
            chapterIndex: chapter,
            verseIndex,
            original,
            translations,
        },
        source,
    };
}

/** Parse many text blobs at once. Filename should be the original source name. */
export function parsePackBatch(files: Array<{ name: string; text: string }>): ParsedFile[] {
    return files.map((f) => parsePackText(f.text, f.name));
}
