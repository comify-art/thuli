import React, { ImgHTMLAttributes, ReactNode } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';

export interface ResolvedLink {
    /** Final href to render. */
    href: string;
    /** When true, render with a plain `<a>` instead of React Router `<Link>`. */
    external?: boolean;
    /** Optional explicit target (e.g. `_blank`). */
    target?: string;
    /** Optional explicit rel. */
    rel?: string;
}

/**
 * A LinkResolver inspects a raw markdown href and either resolves it to a
 * concrete `ResolvedLink`, or returns null to let the next resolver (or the
 * default behavior) handle it.
 *
 * Default behavior when no resolver matches:
 *   - href starts with `/` → internal React Router `<Link>`
 *   - otherwise           → external `<a target="_blank" rel="noopener noreferrer">`
 *
 * Compose resolvers for custom protocols: e.g. `slug:`, `verse:`, `audio:`.
 */
export type LinkResolver = (href: string) => ResolvedLink | null;

export interface MarkdownRendererProps {
    content: string;
    /** Optional className for the article wrapper. */
    className?: string;
    /** Tag-level overrides merged on top of the built-in `a` and `img` handlers. */
    components?: Partial<Components>;
    /**
     * Ordered list of resolvers for `<a>` hrefs. The first non-null wins; if
     * none match, the default internal/external split applies.
     */
    linkResolvers?: LinkResolver[];
    /**
     * Custom renderer for `<img>` tags. Defaults to a plain `<img>`. Consumers
     * with a media catalog (e.g. blog `AsyncImage`) pass their own.
     */
    imageRenderer?: (props: ImgHTMLAttributes<HTMLImageElement>) => ReactNode;
    /** Optional className applied to the default `<a>` anchor element. */
    linkClassName?: string;
    /**
     * When true, single newlines in the source become hard line breaks
     * (via `remark-breaks`). Useful for verse content where every line
     * matters. Default false — keeps standard markdown semantics.
     */
    preserveLineBreaks?: boolean;
}

/**
 * Generic markdown renderer with pluggable link + image resolution.
 *
 * Blog and verse-books both consume this — the only difference is the set
 * of resolvers (and the image renderer for blog's AsyncImage).
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className,
    components,
    linkResolvers = [],
    imageRenderer,
    linkClassName,
    preserveLineBreaks = false,
}) => {
    const resolveLink = (rawHref: string): ResolvedLink => {
        for (const r of linkResolvers) {
            const resolved = r(rawHref);
            if (resolved) return resolved;
        }
        // Default split: leading-slash → internal; anything else → external + new tab.
        if (rawHref.startsWith('/')) {
            return { href: rawHref, external: false };
        }
        return { href: rawHref, external: true, target: '_blank', rel: 'noopener noreferrer' };
    };

    const defaultComponents: Partial<Components> = {
        a: (props) => {
            const raw = props.href || '';
            const { href, external, target, rel } = resolveLink(raw);
            if (!external) {
                return (
                    <Link to={href} className={linkClassName}>
                        {props.children}
                    </Link>
                );
            }
            return (
                <a
                    href={href}
                    className={linkClassName}
                    target={target}
                    rel={rel}
                >
                    {props.children}
                </a>
            );
        },
        img: imageRenderer ? (props) => imageRenderer(props) : undefined,
    };

    return (
        <article className={className}>
            <ReactMarkdown
                remarkPlugins={
                    preserveLineBreaks
                        ? [remarkGfm, remarkMath, remarkBreaks]
                        : [remarkGfm, remarkMath]
                }
                rehypePlugins={[rehypeKatex]}
                urlTransform={(url) => url}
                components={{ ...defaultComponents, ...components }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
};
