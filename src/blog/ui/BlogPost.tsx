import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogPosts, BlogItem } from '../services';
import { BlogAdminService } from '../../services/blogService';
import { MediaService } from '../../services/mediaService';
import { BlogMarkdownRenderer } from './BlogMarkdownRenderer';
import { ArrowLeft } from 'lucide-react';
import PageMeta from '../../layout/PageMeta';

interface BlogPostProps {
    indexUrl: string;
    backLink: string;
    blogService?: BlogAdminService;
    mediaService?: MediaService;
}

export const BlogPostComponent: React.FC<BlogPostProps> = ({ indexUrl, backLink, blogService, mediaService }) => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogItem | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                let dynamicPost: (BlogItem & { content?: string }) | null = null;

                // 1. Try Loading from Service (First Priority)
                if (blogService && id) {
                    try {
                        const data = await blogService.getPostWithContent(id);
                        if (data) {
                            dynamicPost = {
                                id: data.meta.id,
                                title: data.meta.title,
                                description: data.meta.description,
                                date: data.meta.publishedAt
                                    ? data.meta.publishedAt.toDate().toISOString()
                                    : data.meta.createdAt.toDate().toISOString(),
                                author: data.meta.author,
                                thumbnail: data.meta.coverImageUrl,
                                markdownUrl: '',
                                content: data.content.markdown
                            };
                        }
                    } catch (e) {
                        console.warn("Service fetch failed (or not found), falling back to static", e);
                    }
                }

                if (dynamicPost) {
                    setPost(dynamicPost);
                    setContent(dynamicPost.content || '');
                } else {
                    // 2. Fallback to Static Index
                    let foundPost: BlogItem | undefined;
                    try {
                        const posts = await fetchBlogPosts(indexUrl);
                        foundPost = posts.find((p) => p.id === id);
                    } catch (e) {
                        console.warn("Failed to load static index", e);
                    }

                    if (foundPost) {
                        setPost(foundPost);
                        const res = await fetch(foundPost.markdownUrl);
                        if (!res.ok) {
                            throw new Error('Failed to load blog content');
                        }
                        const text = await res.text();
                        setContent(text);
                    } else {
                        // Not found in either
                        setLoading(false);
                        return;
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load content.');
                setLoading(false);
            }
        };

        loadPost();
    }, [id, indexUrl]);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl mb-4">Post not found</h2>
                <Link to={backLink} className="text-[var(--accent-color)] hover:underline">Back to Blog</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl mb-4 text-red-400">{error}</h2>
                <Link to={backLink} className="text-[var(--accent-color)] hover:underline">Back to Blog</Link>
            </div>
        );
    }

    return (
        <PageMeta
            title={`${post.title} - Comify.art`}
            description={post.description}
            image={post.thumbnail}
        >
            <div className="min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="sticky top-0 z-50 py-2 bg-background/80 backdrop-blur-sm -ml-2">
                        <Link to={backLink} className="inline-flex items-center text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-8 h-8" />
                        </Link>
                    </div>

                    <BlogMarkdownRenderer
                        content={content}
                        mediaService={mediaService}
                    />
                    <div className="mt-8">
                        <hr className="border-gray-800 mb-8" />
                        <div className="flex items-center text-gray-400 mb-8 pb-8 border-b border-gray-800">
                            <span>By {post.author}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </PageMeta>
    );
};
