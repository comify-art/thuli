import { Firestore, doc, getDoc, setDoc, deleteDoc, query, where, getCountFromServer, Timestamp, orderBy, QueryConstraint, collection, getDocs } from 'firebase/firestore';
import { BaseAdminService, Page, PageCursor } from './baseService';
import { BlogPostMeta, BlogContent, BlogServiceConfig, BlogStats } from '../types/blog';

export class BlogAdminService extends BaseAdminService<BlogPostMeta> {
    private config: BlogServiceConfig;
    private cachedStats: BlogStats | null = null;

    constructor(
        db: Firestore,
        config: BlogServiceConfig = {
            postsCollection: 'blog_posts',
            contentsCollection: 'blog_contents',
            mediaCollection: 'media_items',
            taxonomiesCollection: 'blog_taxonomies'
        }
    ) {
        super(db, config.postsCollection);
        this.config = config;
    }

    async listPosts(filter?: { status?: 'draft' | 'published', category?: string }): Promise<BlogPostMeta[]> {
        const constraints: QueryConstraint[] = [
            orderBy('createdAt', 'desc')
        ];

        if (filter?.status) {
            constraints.push(where('status', '==', filter.status));
        }
        if (filter?.category) {
            constraints.push(where('category', '==', filter.category));
        }

        return this.getAll(constraints);
    }

    /**
     * Cursor-paginated variant of `listPosts`. Prefer this over `listPosts`
     * for any list surface — the unpaginated variant fetches every row and
     * does not scale.
     *
     * A `status` or `category` filter requires a composite Firestore index
     * on `(status|category ASC, createdAt DESC)`. See
     * [exp-web/firestore.indexes.json](../../../../exp-web/firestore.indexes.json).
     */
    async listPostsPage(opts: {
        filter?: { status?: 'draft' | 'published', category?: string },
        limit?: number,
        cursor?: PageCursor | null,
    } = {}): Promise<Page<BlogPostMeta>> {
        const { filter, limit = 25, cursor } = opts;
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
        if (filter?.status) constraints.push(where('status', '==', filter.status));
        if (filter?.category) constraints.push(where('category', '==', filter.category));
        return this.getAllPage(constraints, limit, cursor);
    }

    /**
     * Public-facing paginated feed of published posts, ordered by
     * `publishedAt` descending. Returns a `BlogItem`-shaped row so callers
     * on the public site do not need to touch Firestore types.
     *
     * Requires a composite index on `(status ASC, publishedAt DESC)`.
     */
    async listPublishedPostsPage(opts: {
        limit?: number,
        cursor?: PageCursor | null,
    } = {}): Promise<Page<{
        id: string;
        title: string;
        description: string;
        date: string;
        author: string;
        thumbnail?: string;
        markdownUrl: string;
    }>> {
        const { limit = 12, cursor } = opts;
        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
        ];
        const page = await this.getAllPage(constraints, limit, cursor);
        return {
            items: page.items.map((meta) => ({
                id: meta.id,
                title: meta.title,
                description: meta.description,
                date: meta.publishedAt
                    ? meta.publishedAt.toDate().toISOString()
                    : meta.createdAt.toDate().toISOString(),
                author: meta.author,
                thumbnail: meta.coverImageUrl,
                markdownUrl: '',
            })),
            nextCursor: page.nextCursor,
        };
    }

    async getPostWithContent(id: string): Promise<{ meta: BlogPostMeta, content: BlogContent } | null> {
        const meta = await this.getById(id);
        if (!meta) return null;

        const contentRef = doc(this.db, this.config.contentsCollection, meta.contentId);
        const contentSnap = await getDoc(contentRef);

        if (!contentSnap.exists()) {
            return { meta, content: { id: meta.contentId, markdown: '' } };
        }

        return {
            meta,
            content: contentSnap.data() as BlogContent
        };
    }

    async saveDraft(
        meta: Omit<BlogPostMeta, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'>,
        markdown: string
    ): Promise<void> {
        // 1. Save Content
        const contentRef = doc(this.db, this.config.contentsCollection, meta.contentId);
        await setDoc(contentRef, {
            id: meta.contentId,
            markdown
        } as BlogContent);

        // 2. Save Meta (Draft)
        const now = Timestamp.now();
        const existing = await this.getById(meta.id);

        const data: BlogPostMeta = {
            ...meta,
            status: 'draft',
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
            // publishedAt is omitted here.
        };

        if (existing) {
            await this.update(meta.id, data);
        } else {
            await this.create(data);
        }
    }

    async publish(
        meta: Omit<BlogPostMeta, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'>,
        markdown: string
    ): Promise<void> {
        // 1. Save Content
        const contentRef = doc(this.db, this.config.contentsCollection, meta.contentId);
        await setDoc(contentRef, {
            id: meta.contentId,
            markdown
        } as BlogContent);

        // 2. Save Meta (Published)
        const now = Timestamp.now();
        const existing = await this.getById(meta.id);

        const data: BlogPostMeta = {
            ...meta,
            status: 'published',
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
            publishedAt: existing?.publishedAt || now
        };

        if (existing) {
            await this.update(meta.id, data);
        } else {
            await this.create(data);
        }
    }

    async getStats(forceRefresh: boolean = false): Promise<BlogStats> {
        if (!forceRefresh && this.cachedStats) {
            return this.cachedStats;
        }

        const coll = this.collectionRef;
        const totalSnap = await getCountFromServer(coll);

        const qPub = query(coll, where('status', '==', 'published'));
        const pubSnap = await getCountFromServer(qPub);

        const qDraft = query(coll, where('status', '==', 'draft'));
        const draftSnap = await getCountFromServer(qDraft);

        const mediaColl = collection(this.db, this.config.mediaCollection);
        const mediaSnap = await getCountFromServer(mediaColl);

        // Calculate orphaned contents
        const postsDocs = await getDocs(coll);
        const usedContentIds = new Set(postsDocs.docs.map(d => d.data().contentId));

        const contentsColl = collection(this.db, this.config.contentsCollection);
        const contentsDocs = await getDocs(contentsColl);

        let orphanedContents = 0;
        contentsDocs.forEach(docSnap => {
            if (!usedContentIds.has(docSnap.id)) {
                orphanedContents++;
            }
        });

        this.cachedStats = {
            total: totalSnap.data().count,
            published: pubSnap.data().count,
            drafts: draftSnap.data().count,
            mediaItems: mediaSnap.data().count,
            orphanedContents
        };

        return this.cachedStats;
    }

    async getOrphanedContents(): Promise<BlogContent[]> {
        const coll = this.collectionRef;
        const postsDocs = await getDocs(coll);
        const usedContentIds = new Set(postsDocs.docs.map(d => d.data().contentId));

        const contentsColl = collection(this.db, this.config.contentsCollection);
        const contentsDocs = await getDocs(contentsColl);

        const orphaned: BlogContent[] = [];
        contentsDocs.forEach(docSnap => {
            if (!usedContentIds.has(docSnap.id)) {
                orphaned.push(docSnap.data() as BlogContent);
            }
        });

        return orphaned;
    }

    async deleteBlogContent(contentId: string): Promise<void> {
        const contentRef = doc(this.db, this.config.contentsCollection, contentId);
        await deleteDoc(contentRef);
        // Invalidate cache since we modified stats implicitly
        this.cachedStats = null;
    }

    /**
     * Flip a post's status to "published" and stamp `publishedAt` with the
     * current time. Thin wrapper so callers don't need to import
     * `Timestamp` from `firebase/firestore`.
     */
    async publishPost(id: string): Promise<void> {
        await this.update(id, {
            status: 'published',
            publishedAt: Timestamp.now(),
        });
    }

    /**
     * Import a legacy post with its original publish date preserved. Used
     * by the migration tool; bundles the `publish` + date-override into a
     * single call so migration code never touches `Timestamp` directly.
     */
    async importLegacyPost(
        meta: Omit<BlogPostMeta, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'>,
        markdown: string,
        originalDate: Date,
    ): Promise<void> {
        await this.publish(meta, markdown);
        const stamp = Timestamp.fromDate(originalDate);
        await this.update(meta.id, {
            createdAt: stamp,
            publishedAt: stamp,
        });
    }

    async getPublishedPosts(limitCount?: number): Promise<any[]> {
        // Fetch published posts
        const metaList = await this.listPosts({ status: 'published' });

        const mapped = metaList.map(meta => ({
            id: meta.id,
            title: meta.title,
            description: meta.description,
            date: meta.publishedAt
                ? meta.publishedAt.toDate().toISOString()
                : meta.createdAt.toDate().toISOString(),
            // Ensure we have a valid date for sorting
            author: meta.author,
            thumbnail: meta.coverImageUrl,
            markdownUrl: ''
        }));

        // Sort by date desc
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (limitCount && limitCount > 0) {
            return mapped.slice(0, limitCount);
        }

        return mapped;
    }

    async checkAndModifyCoverImage(postMeta: BlogPostMeta,
        urlToSlugMap: Map<string, string>,
        filenameToSlugMap: Map<string, string>,
        addLog: (msg: string) => void): Promise<boolean> {

        let coverImageModified = false;
        if (postMeta.coverImageUrl) {
            const url = postMeta.coverImageUrl;
            if (!url.startsWith('slug:')) {
                addLog(`  -> Checking Cover Image: "${url}"`);

                let slug = urlToSlugMap.get(url);

                // Try normalization
                if (!slug && url.startsWith('//')) {
                    const normalized = url.substring(1);
                    slug = urlToSlugMap.get(normalized);
                }

                // Try filename match
                if (!slug) {
                    const parts = url.split('/');
                    const filename = parts[parts.length - 1];
                    if (filename) {
                        const decoded = decodeURIComponent(filename);
                        // Try exact filename or "filename + extension" logic if maps are imperfect
                        slug = filenameToSlugMap.get(decoded) || filenameToSlugMap.get(filename);
                        if (slug) addLog(`     -> Matched cover by filename "${filename}" to slug: ${slug}`);
                    }
                }

                // Try Firebase token url matching (if filename is inside)
                // ...%2Ffilename.png?...
                if (!slug && url.includes('%2F')) {
                    const generatedFilename = url.split('%2F').pop()?.split('?')[0];
                    if (generatedFilename) {
                        // Often firebase storage names are timestamp-name. remove timestamp
                        // e.g. 1768694982630-critical-thinking.png
                        const parts = generatedFilename.split('-');
                        // heuristic: if first part is numeric and long, it's a timestamp
                        const possibleTimestamp = parts[0];
                        if (/^\d+$/.test(possibleTimestamp) && possibleTimestamp.length > 10) {
                            const originalName = parts.slice(1).join('-'); // critical-thinking.png
                            slug = filenameToSlugMap.get(originalName); // check maps again locally or we can decode
                            // Try decoding the original name too if needed
                            const decodedOriginal = decodeURIComponent(originalName);
                            if (!slug) slug = filenameToSlugMap.get(decodedOriginal);

                            if (slug) addLog(`     -> Matched Token URL by parsed filename "${originalName}" to slug: ${slug}`);
                        }
                    }
                }

                if (slug) {
                    postMeta.coverImageUrl = `slug:${slug}`;
                    coverImageModified = true;
                    addLog(`     -> Updated Cover URL to: slug:${slug}`);
                } else {
                    addLog(`     -> WARNING: Could not resolve cover image URL to a slug.`);
                }
            }
        }
        return coverImageModified;
    }

}
