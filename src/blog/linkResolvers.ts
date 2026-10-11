import type { LinkResolver } from '../ui/MarkdownRenderer';

/**
 * Link resolvers used by the blog stack's markdown surfaces. Composed into
 * `BlogMarkdownRenderer`; other host apps building their own renderer can
 * pick the ones they need.
 */

/**
 * `/x/...` — legacy single-entry external apps. Render as a plain `<a>` so
 * the SPA router doesn't intercept and the static HTML is served directly.
 * No `target=_blank` since these are same-origin and the user expects to
 * stay in the same tab.
 */
export const xPrefixResolver: LinkResolver = (href) => {
    if (!href.startsWith('/x/')) return null;
    return { href, external: true };
};

/**
 * `/f/<category>/...` — file-backed collection apps. Same reasoning as
 * `xPrefixResolver`: render as plain `<a>` to bypass the SPA router.
 */
export const fPrefixResolver: LinkResolver = (href) => {
    if (!href.startsWith('/f/')) return null;
    return { href, external: true };
};

/** Convenience — the full set of blog resolvers in their canonical order. */
export const blogLinkResolvers = [xPrefixResolver, fPrefixResolver];
