import React from 'react';
import { Components } from 'react-markdown';
import { MarkdownRenderer } from '../../ui/MarkdownRenderer';
import { blogLinkResolvers } from '../linkResolvers';
import { MediaService } from '../../services/mediaService';
import { AsyncImage } from './AsyncImage';

interface BlogMarkdownRendererProps {
    content: string;
    mediaService?: MediaService;
    className?: string;
}

/**
 * Blog-flavored markdown renderer: pre-bakes the blog's link resolvers,
 * the `AsyncImage` slug-aware image slot, and the prose-on-dark typography
 * the blog uses. Wraps the generic `MarkdownRenderer` from `@thuli/ui`.
 *
 * Other modules (verse-books, future tools) compose their own resolvers and
 * call `MarkdownRenderer` directly rather than going through this wrapper.
 */
export const BlogMarkdownRenderer: React.FC<BlogMarkdownRendererProps> = ({
    content,
    mediaService,
    className,
}) => {
    const blogTagStyles: Partial<Components> = {
        h1: (props) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-white" />,
        h2: (props) => <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-white" />,
        h3: (props) => <h3 {...props} className="text-xl font-bold mt-6 mb-3 text-white" />,
        h4: (props) => <h4 {...props} className="text-lg font-bold mt-6 mb-3 text-white" />,
        p: (props) => <p {...props} className="mb-4 leading-relaxed text-gray-300" />,
        ul: (props) => <ul {...props} className="list-disc pl-6 mb-4 text-gray-300" />,
        li: (props) => <li {...props} className="mb-2" />,
    };

    return (
        <MarkdownRenderer
            content={content}
            className={`prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-[var(--accent-color)] prose-strong:text-white prose-code:text-[var(--accent-color)] ${className || ''}`}
            linkResolvers={blogLinkResolvers}
            linkClassName="text-[var(--accent-color)] hover:underline"
            imageRenderer={(props) => (
                <AsyncImage
                    {...props}
                    mediaService={mediaService}
                    className="rounded-lg my-6 max-w-full h-auto border border-gray-800"
                />
            )}
            components={blogTagStyles}
        />
    );
};
