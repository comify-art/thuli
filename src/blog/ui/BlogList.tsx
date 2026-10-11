import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { BlogAdminService } from "../../services/blogService";
import { MediaService } from "../../services/mediaService";
import type { PageCursor } from "../../services/baseService";

interface BlogListProps {
    title: string;
    subtitle: string;
    basePath: string;
    blogService?: BlogAdminService;
    mediaService?: MediaService;
    pageSize?: number;
    /**
     * Optional override for the card renderer. Defaults to the built-in
     * `BlogCard`. Other modules (e.g. verse-books `BookListPublic`) reuse
     * this grid + load-more machinery with their own card shape.
     */
    renderCard?: (item: ListedPost, basePath: string) => React.ReactNode;
}

export type ListedPost = {
    id: string;
    title: string;
    description: string;
    date: string;
    author: string;
    thumbnail?: string;
    markdownUrl: string;
};

const BlogCard: React.FC<{ post: ListedPost, basePath: string }> = ({ post, basePath }) => {
    // `thumbnail` is pre-resolved by BlogList via `resolvePostThumbnails` —
    // either a full URL, or the original `slug:...` reference if resolution
    // failed (in which case we just skip rendering the image).
    const imageUrl = post.thumbnail && !post.thumbnail.startsWith('slug:') ? post.thumbnail : undefined;

    return (
        <div
            className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--card-border-hover)] transition-all duration-300 hover:-translate-y-1"
        >
            {imageUrl && (
                <div className="flex-shrink-0 h-48 w-full overflow-hidden bg-gray-900">
                    <img
                        className="h-full w-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                        src={imageUrl}
                        alt={post.title}
                        loading="lazy"
                    />
                </div>
            )}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--accent-color)]">
                        {post.date}
                    </p>
                    <Link to={`${basePath}/${post.id}`} className="block mt-2">
                        <p className="text-xl font-semibold text-white hover:text-[var(--accent-color)] transition-colors">
                            {post.title}
                        </p>
                        <p className="mt-3 text-base text-gray-400">
                            {post.description.length > 100
                                ? `${post.description.substring(0, 100)}...`
                                : post.description}
                        </p>
                    </Link>
                </div>
                <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                        <span className="sr-only">{post.author}</span>
                    </div>
                    <div className="">
                        <p className="text-sm font-medium text-gray-300">
                            By {post.author}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <Link to={`${basePath}/${post.id}`} className="flex items-center text-[var(--accent-color)] hover:text-white transition-colors text-sm font-medium">
                            Read more <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BlogList: React.FC<BlogListProps> = ({ title, subtitle, basePath, blogService, mediaService, pageSize = 12, renderCard }) => {
    const [posts, setPosts] = useState<ListedPost[]>([]);
    const [cursor, setCursor] = useState<PageCursor | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoaded, setInitialLoaded] = useState(false);

    // Keep cursor/hasMore in a ref so loadMore sees the latest value even
    // when called rapid-fire (React state updates are batched).
    const cursorRef = useRef<PageCursor | null>(null);

    useEffect(() => {
        cursorRef.current = cursor;
    }, [cursor]);

    const loadMore = async (reset: boolean = false) => {
        if (!blogService) return;
        setLoading(true);
        try {
            const startCursor = reset ? null : cursorRef.current;
            const page = await blogService.listPublishedPostsPage({
                limit: pageSize,
                cursor: startCursor,
            });
            let items: ListedPost[] = page.items;
            if (mediaService) {
                items = await mediaService.resolvePostThumbnails(items);
            }
            setPosts((prev) => (reset ? items : [...prev, ...items]));
            cursorRef.current = page.nextCursor;
            setCursor(page.nextCursor);
            setHasMore(!!page.nextCursor);
        } catch (error) {
            console.error("Error loading blog list", error);
        } finally {
            setLoading(false);
            setInitialLoaded(true);
        }
    };

    useEffect(() => {
        // Fresh load when the service (or pageSize) changes.
        setPosts([]);
        cursorRef.current = null;
        setCursor(null);
        setHasMore(false);
        setInitialLoaded(false);
        loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blogService, pageSize]);

    if (!initialLoaded && loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-400">
                        {subtitle}
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {posts.map((post) =>
                        renderCard
                            ? <React.Fragment key={post.id}>{renderCard(post, basePath)}</React.Fragment>
                            : <BlogCard key={post.id} post={post} basePath={basePath} />
                    )}
                </div>

                {posts.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-400">
                        No published posts yet.
                    </div>
                )}

                {hasMore && (
                    <div className="flex justify-center mt-12">
                        <button
                            onClick={() => loadMore(false)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-black bg-[var(--accent-color)] rounded-full hover:opacity-90 transition-all disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                                </>
                            ) : (
                                <>Load more</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
