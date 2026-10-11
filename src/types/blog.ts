import { Timestamp } from 'firebase/firestore';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPostMeta {
    id: string; // Slug-based ID
    title: string;
    slug: string;
    description: string;
    coverImageId?: string; // Reference to media_items
    coverImageUrl?: string; // Fallback direct URL
    coverImageThumbnailUrl?: string; // Optimized thumbnail for list view
    status: BlogPostStatus;
    author: string;
    tags: string[];
    category: string;
    contentId: string; // Reference to blog_contents
    publishedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface BlogContent {
    id: string;
    markdown: string;
}

export type MediaType = 'image' | 'video';

export interface MediaItem {
    id: string;
    slug?: string; // Friendly identifier
    name: string; // Display name
    url: string; // Public URL
    thumbnailUrl?: string; // Optimized thumbnail (h-48 = 192px)
    type: MediaType;
    mimeType?: string;
    width?: number;
    height?: number;
    author: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface BlogStats {
    total: number;
    published: number;
    drafts: number;
    mediaItems: number;
    orphanedContents: number;
}

export interface BlogServiceConfig {
    postsCollection: string;
    contentsCollection: string;
    mediaCollection: string;
    taxonomiesCollection: string;
}
