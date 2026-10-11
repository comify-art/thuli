import type { LinkResolver } from '../ui/MarkdownRenderer';

/**
 * Builds a resolver for `verse:<bookSlug>/<chapter>/<verse>` markdown refs.
 *
 * Translates each `verse:` href into an internal `/p/verse/<book>/<chapter>/<verse>`
 * link (or whatever `basePath` the host uses). Lets blog markdown and verse
 * commentary cross-link to a verse the same way they link to a media asset
 * via `slug:`.
 *
 * Example: `[see verse 16](verse:thirumandhiram/1/16)` →
 *   `<Link to="/p/verse/thirumandhiram/1/16">see verse 16</Link>`
 */
export function verseLinkResolver(opts: { basePath?: string } = {}): LinkResolver {
    const basePath = opts.basePath ?? '/p/verse';
    return (href) => {
        if (!href.startsWith('verse:')) return null;
        const ref = href.slice('verse:'.length);
        // Tolerate a leading slash and split on the remaining `/`.
        const parts = ref.replace(/^\//, '').split('/');
        if (parts.length !== 3) return null;
        const [book, chapter, verse] = parts;
        if (!book || !chapter || !verse) return null;
        return { href: `${basePath}/${book}/${chapter}/${verse}`, external: false };
    };
}
