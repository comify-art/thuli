import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { BookService } from '../../services/bookService';
import { VerseService } from '../../services/verseService';
import { parsePackBatch, type ParsedFile } from '../parsers/packFormat';
import type { Book } from '../types';

interface VerseImporterProps {
    bookService: BookService;
    verseService: VerseService;
}

type Phase = 'pick' | 'preview' | 'importing' | 'done';

/**
 * Bulk-import verses into an existing book from the legacy
 * `---TAMIL_MANDHIRAM_PACK_v1` format. Accepts drag-and-drop files or a
 * pasted text blob.
 *
 * Flow:  pick book + load files  →  dry-run preview  →  commit  →  result
 *
 * Each verse becomes:
 *   - a `verses/{book-chapter-verse}` document with status=published
 *   - a `verse_contents/{...}` document with the parsed bodies
 *   - any missing chapter scaffolds are created on the fly by
 *     `VerseService.bulkImport`.
 */
export const VerseImporter: React.FC<VerseImporterProps> = ({ bookService, verseService }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [bookId, setBookId] = useState<string>('');
    const [parsed, setParsed] = useState<ParsedFile[]>([]);
    const [phase, setPhase] = useState<Phase>('pick');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ imported: number; failures: number } | null>(null);

    useEffect(() => {
        (async () => {
            const list = await bookService.listBooks();
            setBooks(list);
            if (list.length > 0) setBookId(list[0].id);
        })();
    }, [bookService]);

    const onFiles = async (files: FileList | File[]) => {
        const arr = Array.from(files);
        const reads = await Promise.all(
            arr.map(async (f) => ({ name: f.name, text: await f.text() })),
        );
        const out = parsePackBatch(reads);
        setParsed(out);
        setPhase('preview');
    };

    const onPasted = (text: string) => {
        const out = parsePackBatch([{ name: 'pasted', text }]);
        setParsed(out);
        setPhase('preview');
    };

    const onCommit = async () => {
        const valid = parsed.filter((p): p is ParsedFile & { verse: NonNullable<ParsedFile['verse']> } => !!p.verse);
        if (valid.length === 0) {
            alert('Nothing valid to import.');
            return;
        }
        setImporting(true);
        setPhase('importing');
        try {
            const verses = valid.map((p) => p.verse);
            const out = await verseService.bulkImport(bookId, verses);
            await bookService.recomputeCounts(bookId);
            setResult({ imported: out.imported, failures: out.failures.length + parsed.length - valid.length });
            setPhase('done');
        } catch (e) {
            console.error('Import failed:', e);
            alert(`Import failed: ${(e as Error).message}`);
            setPhase('preview');
        } finally {
            setImporting(false);
        }
    };

    const reset = () => {
        setParsed([]);
        setResult(null);
        setPhase('pick');
    };

    const validParsed = parsed.filter((p) => p.verse);
    const invalidParsed = parsed.filter((p) => !p.verse);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold admin-text-strong">Verse Import</h2>
                <p className="admin-text-muted text-sm mt-1">
                    Bulk-import verses from <code className="font-mono">---TAMIL_MANDHIRAM_PACK_v1</code> files.
                    Missing chapter scaffolds are created automatically.
                </p>
            </div>

            <div className="admin-card p-4 space-y-3">
                <label className="admin-label">Target book</label>
                <select
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    className="admin-input text-sm"
                    disabled={phase !== 'pick' && phase !== 'preview'}
                >
                    {books.length === 0 ? (
                        <option value="">No books — create one via Books admin first</option>
                    ) : (
                        books.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.title} ({b.slug})
                            </option>
                        ))
                    )}
                </select>
            </div>

            {phase === 'pick' && (
                <div className="space-y-4">
                    <div className="admin-card p-6">
                        <h3 className="text-sm font-semibold admin-text-strong mb-3 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Drop or pick files
                        </h3>
                        <input
                            type="file"
                            multiple
                            accept=".txt"
                            onChange={(e) => e.target.files && onFiles(e.target.files)}
                            className="admin-input text-sm"
                            disabled={!bookId}
                        />
                        <p className="text-xs admin-text-muted mt-2">
                            Tip: select all 32 <code className="font-mono">1-N.txt</code> files at once.
                        </p>
                    </div>

                    <div className="admin-card p-6">
                        <h3 className="text-sm font-semibold admin-text-strong mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Or paste a single file's text
                        </h3>
                        <PasteForm onSubmit={onPasted} disabled={!bookId} />
                    </div>
                </div>
            )}

            {phase === 'preview' && (
                <div className="space-y-4">
                    <div className="admin-card p-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="text-sm">
                            <span className="admin-text-strong font-semibold">{validParsed.length}</span>
                            <span className="admin-text-muted"> ready</span>
                            {invalidParsed.length > 0 && (
                                <>
                                    <span className="admin-text-muted"> · </span>
                                    <span className="text-red-500 font-semibold">{invalidParsed.length}</span>
                                    <span className="admin-text-muted"> failed to parse</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={reset} className="admin-btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={onCommit}
                                disabled={validParsed.length === 0 || importing}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm disabled:opacity-50"
                            >
                                Import {validParsed.length} verse{validParsed.length === 1 ? '' : 's'}
                            </button>
                        </div>
                    </div>

                    <div className="admin-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="admin-surface-sunken border-b admin-border text-xs uppercase admin-text-body font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">Verse</th>
                                        <th className="px-4 py-2">Preview / Error</th>
                                    </tr>
                                </thead>
                                <tbody className="admin-divide">
                                    {parsed.map((p, i) => (
                                        <tr key={i} className="admin-row-hover">
                                            <td className="px-4 py-2 font-mono admin-text-muted text-xs">{p.source}</td>
                                            <td className="px-4 py-2 font-mono admin-text-strong whitespace-nowrap">
                                                {Number.isFinite(p.chapter) && Number.isFinite(p.verseIndex)
                                                    ? `${p.chapter}.${p.verseIndex}`
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-2 admin-text-body">
                                                {p.verse ? (
                                                    <span className="admin-text-body">
                                                        {p.verse.original.split('\n')[0].slice(0, 80)}…
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> {p.error}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'importing' && (
                <div className="admin-card p-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 admin-text-muted" />
                    <p className="admin-text-body">Importing… do not navigate away.</p>
                </div>
            )}

            {phase === 'done' && result && (
                <div className="admin-card p-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                    <h3 className="text-xl font-semibold admin-text-strong">
                        Imported {result.imported} verse{result.imported === 1 ? '' : 's'}
                    </h3>
                    {result.failures > 0 && (
                        <p className="text-red-500 text-sm">
                            {result.failures} verse{result.failures === 1 ? '' : 's'} failed — check console for details.
                        </p>
                    )}
                    <button onClick={reset} className="admin-btn-secondary">
                        Import more
                    </button>
                </div>
            )}
        </div>
    );
};

const PasteForm: React.FC<{ onSubmit: (text: string) => void; disabled?: boolean }> = ({
    onSubmit,
    disabled,
}) => {
    const [text, setText] = useState('');
    return (
        <div className="space-y-2">
            <textarea
                className="admin-input font-mono text-xs"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`version: 1.0.0\nbook: Thirumandhiram\nchapter: 1\nindex: 1\n\n---TAMIL_MANDHIRAM_PACK_v1\n…`}
                disabled={disabled}
            />
            <div className="flex justify-end">
                <button
                    onClick={() => onSubmit(text)}
                    disabled={disabled || !text.trim()}
                    className="admin-btn-secondary"
                >
                    Parse
                </button>
            </div>
        </div>
    );
};
