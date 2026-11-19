import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface VerseNavigatorProps {
    bookSlug: string;
    /** Default chapter the input lands in when the user just enters a verse number. */
    chapterIndex?: number;
    /** Base public path for verse routes. Defaults to `/p/verse`. */
    basePath?: string;
}

/**
 * "Jump to verse" input — type a number, hit Go (or Enter), navigate to that
 * verse. Used on `BookHome` (no chapter context → defaults to chapter 1) and
 * on `VersePage` (carries the current chapter).
 *
 * Accepts either a plain verse number (e.g. `16`) or a fully-qualified
 * `chapter.verse` form (e.g. `2.5`) for cross-chapter jumps without
 * exposing a separate chapter picker.
 */
export const VerseNavigator: React.FC<VerseNavigatorProps> = ({
    bookSlug,
    chapterIndex = 1,
    basePath = '/p/verse',
}) => {
    const [value, setValue] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;

        let chapter = chapterIndex;
        let verse: number;

        if (v.includes('.')) {
            const [cStr, vStr] = v.split('.');
            const c = Number(cStr);
            const n = Number(vStr);
            if (!Number.isFinite(c) || c < 1 || !Number.isFinite(n) || n < 1) return;
            chapter = c;
            verse = n;
        } else {
            const n = Number(v);
            if (!Number.isFinite(n) || n < 1) return;
            verse = n;
        }

        navigate(`${basePath}/${bookSlug}/${chapter}/${verse}`);
    };

    return (
        <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
            <label htmlFor="verse-jump" className="text-sm text-gray-400">
                Jump to verse
            </label>
            <input
                id="verse-jump"
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`${chapterIndex}.1`}
                className="w-24 px-3 py-1.5 rounded-md bg-black/30 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--accent-color)] font-mono"
            />
            <button
                type="submit"
                disabled={!value.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--accent-color)] text-black text-sm font-medium hover:opacity-90 disabled:opacity-40"
            >
                Go <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </form>
    );
};
