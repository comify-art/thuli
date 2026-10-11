import { Firestore, Timestamp, orderBy, QueryConstraint, where } from 'firebase/firestore';
import { FirebaseStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { BaseAdminService, Page, PageCursor } from './baseService';
import { MediaItem, MediaType } from '../types/blog';
import { resizeImage, blobToFile } from '../utils/imageUtils';

// Firestore `in` queries accept up to 30 values per call. Anything larger
// gets split into batches.
const FS_IN_LIMIT = 30;

/** Input shape for `addItem` — all Firebase-type fields are filled in by
 *  the service, so consumers never need to touch `Timestamp`. */
export interface MediaItemInput {
    id?: string;
    name: string;
    url: string;
    slug?: string;
    type?: MediaType;
    thumbnailUrl?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    author?: string;
}

/** Result of a bulk upload pass. */
export interface BulkUploadResult {
    successCount: number;
    failures: Array<{ file: string; error: string }>;
}

/** Result of a thumbnail-regeneration pass. */
export interface RegenerateResult {
    regenerated: number;
    failed: number;
}

/** A storage blob that has no corresponding `media_items` document. */
export interface OrphanedBlob {
    /** Full storage path (e.g. `media/1714521234-foo.png`). */
    fullPath: string;
    /** File name only (e.g. `1714521234-foo.png`). */
    name: string;
    /** Bytes, when metadata is available. */
    size?: number;
    /** ISO timestamp from storage metadata, when available. */
    updated?: string;
}

export class MediaService extends BaseAdminService<MediaItem> {
    private storage?: FirebaseStorage;
    private slugCache: Map<string, MediaItem> = new Map();

    constructor(db: Firestore, storage?: FirebaseStorage, collectionName: string = 'media_items') {
        super(db, collectionName);
        this.storage = storage;
    }

    async uploadFile(file: File, path: string = 'media'): Promise<{ url: string, thumbnailUrl?: string, slug: string }> {
        if (!this.storage) throw new Error("Storage not initialized");

        // Sanitize filename: timestamp-slugified-name
        const timestamp = Date.now();
        const baseSlug = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
        const storagePath = `${path}/${timestamp}-${safeName}`;

        // Upload original image
        const storageRef = ref(this.storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        // Generate and upload thumbnail for images
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith('image/')) {
            try {
                const thumbnailBlob = await resizeImage(file, { maxHeight: 480 });
                const thumbnailFile = blobToFile(thumbnailBlob, `thumb-${safeName}`);
                const thumbnailPath = `${path}/thumbnails/${timestamp}-${safeName}`;
                const thumbnailRef = ref(this.storage, thumbnailPath);
                const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile);
                thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);
            } catch (e) {
                console.warn('Failed to generate thumbnail, using original:', e);
            }
        }

        return { url, thumbnailUrl, slug: baseSlug };
    }

    async getBySlug(slug: string): Promise<MediaItem | null> {
        if (this.slugCache.has(slug)) {
            return this.slugCache.get(slug)!;
        }

        const constraints: QueryConstraint[] = [
            where('slug', '==', slug)
        ];
        const results = await this.getAll(constraints);
        const item = results.length > 0 ? results[0] : null;

        if (item) {
            this.slugCache.set(slug, item);
        }
        return item;
    }

    async listMedia(
        sortDesc: boolean = true
    ): Promise<MediaItem[]> {
        const constraints: QueryConstraint[] = [
            orderBy('createdAt', sortDesc ? 'desc' : 'asc')
        ];
        return this.getAll(constraints);
    }

    /**
     * Cursor-paginated variant of `listMedia`. Prefer this for list surfaces.
     */
    async listMediaPage(opts: {
        limit?: number,
        cursor?: PageCursor | null,
        sortDesc?: boolean,
    } = {}): Promise<Page<MediaItem>> {
        const { limit = 24, cursor, sortDesc = true } = opts;
        const constraints: QueryConstraint[] = [orderBy('createdAt', sortDesc ? 'desc' : 'asc')];
        return this.getAllPage(constraints, limit, cursor);
    }

    /**
     * Resolve a batch of slugs to their preferred display URL (thumbnail if
     * present, otherwise the full image URL). One Firestore `in` query per
     * batch of 30 slugs — replaces N+1 `getBySlug` patterns at list surfaces.
     */
    async resolveSlugs(slugs: string[]): Promise<Record<string, string>> {
        const unique = [...new Set(slugs.filter(Boolean))];
        if (unique.length === 0) return {};

        const out: Record<string, string> = {};
        const toFetch: string[] = [];
        for (const s of unique) {
            const cached = this.slugCache.get(s);
            if (cached) out[s] = cached.thumbnailUrl || cached.url;
            else toFetch.push(s);
        }
        if (toFetch.length === 0) return out;

        for (let i = 0; i < toFetch.length; i += FS_IN_LIMIT) {
            const batch = toFetch.slice(i, i + FS_IN_LIMIT);
            const results = await this.getAll([where('slug', 'in', batch)]);
            for (const item of results) {
                if (item.slug) {
                    this.slugCache.set(item.slug, item);
                    out[item.slug] = item.thumbnailUrl || item.url;
                }
            }
        }
        return out;
    }

    /**
     * Convenience wrapper over `resolveSlugs` for the common case where a
     * list view holds posts whose `thumbnail` field is either a full URL or
     * a `slug:<slug>` reference. Returns a new array with `thumbnail`
     * replaced by the resolved URL when the reference could be resolved.
     */
    async resolvePostThumbnails<T extends { thumbnail?: string }>(posts: T[]): Promise<T[]> {
        const slugs = posts
            .map((p) => p.thumbnail)
            .filter((t): t is string => !!t && t.startsWith('slug:'))
            .map((t) => t.substring(5));
        if (slugs.length === 0) return posts;
        const map = await this.resolveSlugs(slugs);
        return posts.map((p) => {
            if (!p.thumbnail || !p.thumbnail.startsWith('slug:')) return p;
            const slug = p.thumbnail.substring(5);
            const resolved = map[slug];
            return resolved ? { ...p, thumbnail: resolved } : p;
        });
    }

    /**
     * Rename a media item. Updates `name` and (optionally) `slug`. If `slug`
     * is omitted we derive one from the name. Ensures the resulting slug is
     * unique by suffixing on collision (skipping the doc's own existing slug).
     */
    async renameItem(id: string, name: string, slug?: string): Promise<void> {
        const trimmedName = (name ?? '').trim();
        if (!trimmedName) throw new Error('Name cannot be empty');

        const desired = (slug?.trim() || toSlug(trimmedName) || 'untitled');
        let finalSlug = desired;
        let counter = 1;
        while (true) {
            const existing = await this.getBySlug(finalSlug);
            if (!existing || existing.id === id) break;
            finalSlug = `${desired}-${counter++}`;
        }

        // The slug cache may hold the previous slug under a different key;
        // easier to drop it entirely than to track which key to evict.
        this.slugCache.clear();

        await this.update(id, {
            name: trimmedName,
            slug: finalSlug,
        } as Partial<MediaItem>);
    }

    /**
     * Add a media item (e.g. from "Add by URL" flow). Fills in timestamps,
     * defaults type to "image", and generates an ID/slug if omitted so
     * consumers don't need to touch `Timestamp` or `crypto.randomUUID`.
     */
    async addItem(input: MediaItemInput): Promise<MediaItem> {
        const name = input.name || 'Untitled';
        const slug = input.slug || toSlug(name) || 'untitled';
        const now = Timestamp.now();
        // Firestore rejects fields whose value is `undefined`, so we only
        // include the optional ones when the caller actually provided them.
        const item: MediaItem = {
            id: input.id ?? crypto.randomUUID(),
            name,
            slug,
            url: input.url,
            type: input.type ?? 'image',
            author: input.author ?? 'Admin',
            createdAt: now,
            updatedAt: now,
            ...(input.thumbnailUrl !== undefined && { thumbnailUrl: input.thumbnailUrl }),
            ...(input.mimeType !== undefined && { mimeType: input.mimeType }),
            ...(input.width !== undefined && { width: input.width }),
            ...(input.height !== undefined && { height: input.height }),
        };
        await this.create(item);
        return item;
    }

    /**
     * Upload a batch of files, generating unique slugs and thumbnails,
     * and catalog each one as a MediaItem. Returns per-file success
     * counts. Replaces the ad-hoc loop that used to live in MediaLibrary.
     */
    async bulkUpload(files: FileList | File[]): Promise<BulkUploadResult> {
        const fileArr = Array.from(files as FileList);
        const result: BulkUploadResult = { successCount: 0, failures: [] };

        for (const file of fileArr) {
            try {
                const { url, thumbnailUrl, slug } = await this.uploadFile(file);
                // Ensure slug is unique by suffixing if a collision exists.
                let finalSlug = slug;
                let counter = 1;
                while (await this.getBySlug(finalSlug)) {
                    finalSlug = `${slug}-${counter++}`;
                }
                await this.addItem({
                    name: file.name,
                    slug: finalSlug,
                    url,
                    thumbnailUrl,
                    type: 'image',
                    mimeType: file.type || undefined,
                });
                result.successCount++;
            } catch (e) {
                result.failures.push({ file: file.name, error: (e as Error).message });
            }
        }
        return result;
    }

    /**
     * Find storage blobs under `rootPath` (recursive) that no `media_items`
     * row references via `url` or `thumbnailUrl`. These typically come from
     * uploads where the storage write succeeded but the Firestore write
     * failed — the blob is then leaked.
     */
    async listOrphanedMediaBlobs(rootPath: string = 'media'): Promise<OrphanedBlob[]> {
        if (!this.storage) throw new Error('Storage not initialized');

        const allBlobs = await this.collectStorageBlobs(rootPath);

        const items = await this.listMedia();
        const referenced = new Set<string>();
        for (const item of items) {
            const u = extractStoragePath(item.url);
            if (u) referenced.add(u);
            const t = extractStoragePath(item.thumbnailUrl);
            if (t) referenced.add(t);
        }

        return allBlobs.filter((b) => !referenced.has(b.fullPath));
    }

    /**
     * Delete a single storage blob by its full path. Used by the
     * Orphaned Media admin surface; consumers shouldn't reach into
     * `firebase/storage` directly.
     */
    async deleteStorageBlob(fullPath: string): Promise<void> {
        if (!this.storage) throw new Error('Storage not initialized');
        await deleteObject(ref(this.storage, fullPath));
    }

    /** Recursively collect every blob under `rootPath` with best-effort metadata. */
    private async collectStorageBlobs(rootPath: string): Promise<OrphanedBlob[]> {
        if (!this.storage) return [];
        const out: OrphanedBlob[] = [];
        const stack: string[] = [rootPath];
        while (stack.length > 0) {
            const cur = stack.pop()!;
            const folder = ref(this.storage, cur);
            const list = await listAll(folder);
            for (const itemRef of list.items) {
                let size: number | undefined;
                let updated: string | undefined;
                try {
                    const meta = await getMetadata(itemRef);
                    size = meta.size;
                    updated = meta.updated;
                } catch {
                    // metadata is best-effort
                }
                out.push({
                    fullPath: itemRef.fullPath,
                    name: itemRef.name,
                    size,
                    updated,
                });
            }
            for (const sub of list.prefixes) stack.push(sub.fullPath);
        }
        return out;
    }

    /**
     * Scan for media items missing a `thumbnailUrl` and regenerate one for
     * each by re-fetching the source, downscaling, and uploading. Reports
     * progress via the optional callback (useful for spinner UIs).
     *
     * Owns the storage interaction so consumers don't `(service as any).storage`.
     */
    async regenerateMissingThumbnails(
        onProgress?: (done: number, total: number, currentName?: string) => void,
    ): Promise<RegenerateResult> {
        if (!this.storage) throw new Error('Storage not initialized');

        const all = await this.listMedia();
        const needsThumbs = all.filter((m) => (!m.thumbnailUrl || m.thumbnailUrl === '') && m.url);

        const result: RegenerateResult = { regenerated: 0, failed: 0 };
        for (let i = 0; i < needsThumbs.length; i++) {
            const item = needsThumbs[i];
            onProgress?.(i, needsThumbs.length, item.name);
            try {
                const response = await fetch(item.url);
                const blob = await response.blob();
                const sourceFile = new File([blob], item.name || 'image.jpg', { type: blob.type });

                const thumbnailBlob = await resizeImage(sourceFile, { maxHeight: 480 });
                const thumbnailFile = blobToFile(thumbnailBlob, `thumb-${item.name}`);

                const timestamp = Date.now();
                const safeName = (item.name || 'image').replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
                const thumbPath = `media/thumbnails/${timestamp}-${safeName}`;
                const thumbRef = ref(this.storage, thumbPath);
                const snap = await uploadBytes(thumbRef, thumbnailFile);
                const thumbnailUrl = await getDownloadURL(snap.ref);

                await this.update(item.id, { thumbnailUrl });
                result.regenerated++;
            } catch (e) {
                console.warn(`Regenerate failed for ${item.name}:`, e);
                result.failed++;
            }
        }
        onProgress?.(needsThumbs.length, needsThumbs.length);
        return result;
    }
}

/** Slugify helper — lowercase, collapse to dashes, strip leading/trailing dashes. */
function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');
}

/**
 * Extract the storage object path (e.g. `media/1714521234-foo.png`) from a
 * Firebase Storage download URL. Returns null for non-Firebase URLs and any
 * input that fails to parse.
 *
 * Firebase URLs have the shape:
 *   https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<URL-encoded-path>?alt=media&token=...
 */
function extractStoragePath(downloadUrl: string | undefined): string | null {
    if (!downloadUrl) return null;
    try {
        const url = new URL(downloadUrl);
        if (!url.hostname.includes('firebasestorage')) return null;
        const match = url.pathname.match(/\/o\/(.+)$/);
        if (!match) return null;
        return decodeURIComponent(match[1]);
    } catch {
        return null;
    }
}
