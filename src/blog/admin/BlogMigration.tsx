import React, { useState } from 'react';
import { BlogAdminService } from '../../services/blogService';
import { MediaService } from '../../services/mediaService';
import { BlogPostMeta } from '../../types/blog';

/**
 * Shape of a legacy post as stored in the source JSON index. This is the
 * minimal contract the migration tool expects; hosts can supply a richer
 * shape and cast. `markdownUrl` points at a static Markdown file (local
 * or remote) that will be fetched and uploaded.
 */
export interface LegacyBlogItem {
    id: string;
    title: string;
    description: string;
    author: string;
    date: string;            // ISO or anything `new Date(...)` accepts
    thumbnail?: string;      // URL to cover image, or undefined
    markdownUrl: string;     // URL to the Markdown body
}

interface BlogMigrationProps {
    blogService: BlogAdminService;
    mediaService: MediaService;
    /**
     * URL of the legacy index JSON — the file must return an array of
     * `LegacyBlogItem`. Default matches the existing exp-web layout
     * (`/blog_items/index.json`); other hosts can point elsewhere.
     */
    sourceUrl?: string;
    /** Category applied to imported posts. Defaults to "All". */
    defaultCategory?: string;
}

export const BlogMigration: React.FC<BlogMigrationProps> = ({
    blogService,
    mediaService,
    sourceUrl = '/blog_items/index.json',
    defaultCategory = 'All',
}) => {
    const [status, setStatus] = useState<string>('Ready');
    const [progress, setProgress] = useState(0);

    const runMigration = async () => {
        if (!confirm(`This will migrate all blog posts from ${sourceUrl} to Firestore. Continue?`)) return;

        setStatus('Starting...');
        try {
            const response = await fetch(sourceUrl);
            const items = await response.json() as LegacyBlogItem[];

            setStatus(`Found ${items.length} items. Processing...`);
            let count = 0;

            for (const item of items) {
                setStatus(`Migrating: ${item.title}`);

                // 1. Ensure a legacy media item exists for the thumbnail.
                let coverImageId: string | undefined;
                const coverImageUrl: string | undefined = item.thumbnail;

                if (item.thumbnail) {
                    const mediaId = `legacy-${item.id}`;
                    const existingMedia = await mediaService.getById(mediaId);
                    if (!existingMedia) {
                        await mediaService.addItem({
                            id: mediaId,
                            name: `${item.title} Cover`,
                            url: item.thumbnail,
                            type: 'image',
                            author: 'Migration',
                        });
                    }
                    coverImageId = mediaId;
                }

                // 2. Pull the markdown body.
                const mdResponse = await fetch(item.markdownUrl);
                const markdown = await mdResponse.text();

                // 3. Import with preserved publish date.
                const meta: Omit<BlogPostMeta, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'> = {
                    id: item.id,
                    title: item.title,
                    slug: item.id,
                    description: item.description,
                    author: item.author,
                    category: defaultCategory,
                    tags: [],
                    coverImageId,
                    coverImageUrl,
                    contentId: `content-${item.id}`,
                };
                await blogService.importLegacyPost(meta, markdown, new Date(item.date));

                count++;
                setProgress(Math.round((count / items.length) * 100));
            }

            setStatus(`Migration Complete! Migrated ${count} posts.`);
        } catch (error) {
            console.error(error);
            setStatus(`Error: ${(error as Error).message}`);
        }
    };

    return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md mb-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Data Migration</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Migrate legacy posts from <code className="font-mono text-xs">{sourceUrl}</code> into Firestore.
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={runMigration}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                >
                    Run Migration
                </button>
                <div className="text-sm font-medium admin-text-body">
                    {status} {progress > 0 && `(${progress}%)`}
                </div>
            </div>
        </div>
    );
};
