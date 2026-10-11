import React, { useCallback, useState } from 'react';
import { Edit, Trash2, Link, Globe, FileText, ExternalLink } from 'lucide-react';
import { BlogAdminService } from '../../services/blogService';
import type { PageCursor } from '../../services/baseService';
import { BlogPostMeta } from '../../types/blog';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { useCursorPagination } from '../../ui/useCursorPagination';
import { PaginationFooter } from '../../ui/PaginationFooter';

interface BlogAdminListProps {
    service: BlogAdminService;
    onEdit: (id: string) => void;
    pageSize?: number;
}

export const BlogAdminList: React.FC<BlogAdminListProps> = ({ service, onEdit, pageSize = 25 }) => {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchPage = useCallback(
        (cursor: PageCursor | undefined) => service.listPostsPage({ limit: pageSize, cursor }),
        [service, pageSize],
    );

    const { items: posts, loading, pageIndex, hasNext, hasPrev, next, prev, reload } =
        useCursorPagination<BlogPostMeta>({ fetchPage, deps: [service, pageSize] });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await service.delete(deleteId);
            setDeleteId(null);
            reload();
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post");
        }
    };

    const handleQuickPublish = async (post: BlogPostMeta) => {
        if (!confirm(`Are you sure you want to publish "${post.title}"?`)) return;

        try {
            await service.publishPost(post.id);
            reload();
        } catch (error) {
            console.error("Failed to publish post", error);
            alert("Failed to publish post");
        }
    };

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/blog/${slug}`;
        navigator.clipboard.writeText(url);
        alert(`Copied link: ${url}`);
    };

    if (loading && posts.length === 0) {
        return <div className="p-8 text-center admin-text-muted">Loading posts...</div>;
    }

    return (
        <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="admin-surface-sunken border-b admin-border text-xs uppercase admin-text-body font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="admin-divide">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center admin-text-muted">
                                    No posts found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id} className="admin-row-hover">
                                    <td className="px-6 py-4">
                                        <div className="font-medium admin-text-strong line-clamp-1">
                                            {post.title}
                                        </div>
                                        <div className="text-xs admin-text-muted font-mono mt-0.5">
                                            /{post.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'published'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                            }`}>
                                            {post.status === 'published' ? <Globe className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm admin-text-body">
                                        {post.category || <span className="italic admin-text-muted opacity-70">Uncategorized</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm admin-text-muted whitespace-nowrap">
                                        {post.createdAt?.toDate().toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1">
                                        {post.status === 'draft' && (
                                            <button
                                                onClick={() => handleQuickPublish(post)}
                                                className="admin-btn-icon hover:!text-green-500"
                                                title="Publish Now"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                        {post.status === 'published' && (
                                            <button
                                                onClick={() => copyLink(post.slug)}
                                                className="admin-btn-icon hover:!text-blue-400"
                                                title="Copy Link"
                                            >
                                                <Link className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onEdit(post.id)}
                                            className="admin-btn-icon hover:!text-blue-400"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(post.id)}
                                            className="admin-btn-icon hover:!text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-3 border-t admin-border admin-surface-sunken">
                <PaginationFooter
                    pageIndex={pageIndex}
                    itemsOnPage={posts.length}
                    hasNext={hasNext}
                    hasPrev={hasPrev}
                    loading={loading}
                    onPrev={prev}
                    onNext={next}
                    itemNoun="post"
                />
            </div>

            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isDangerous={true}
                confirmLabel="Delete"
            />
        </div>
    );
};
