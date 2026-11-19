# @thuli/blog

A self-contained React + Firestore blog stack — UI components, admin tooling, and services. Designed to drop into any host app that has a Firebase project. No `firebase` imports leak into components; callers own the SDK.

## What's in here

```
thuli/src/blog/
├── ui/                        # public surfaces
│   ├── BlogList.tsx           # paginated "Load more" card grid
│   ├── BlogPost.tsx           # single-post page
│   ├── BlogMarkdownRenderer.tsx
│   └── AsyncImage.tsx         # image with slug: → URL resolution
├── admin/                     # admin tooling (requires an admin-gated route)
│   ├── BlogAdminList.tsx      # paginated list with inline quick-publish
│   ├── BlogEditor.tsx         # split-pane markdown editor + settings
│   ├── BlogStatsWidget.tsx    # overview cards: total / published / drafts / media / orphaned
│   ├── OrphanedContentManager.tsx  # sweeps unreferenced blog_contents rows
│   ├── OrphanedMediaManager.tsx    # sweeps unreferenced Storage blobs under media/
│   ├── BlogMigration.tsx      # legacy JSON → Firestore one-shot importer
│   ├── BlogRemediation.tsx    # fuzzy-fix legacy image URLs → slug:… refs
│   └── admin-surface.css      # design-token palette (see docs/design/thuli-admin-palette.md)
├── media/
│   ├── MediaLibrary.tsx       # paginated image grid + bulk upload
│   └── MediaPicker.tsx        # modal wrapper for embedding in the editor
├── services.ts                # public `BlogItem` + `fetchBlogPosts` surface
├── index.ts                   # barrel — prefer these imports
└── README.md                  # you are here
```

Services live one level up, at `thuli/src/services/` — `BlogAdminService`, `MediaService`, and their base class. They're imported by the components here, but also exported separately so hosts can construct them and call them directly.

## Quick-start for a new host app

```tsx
// 1. Initialize Firebase as usual.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import '@thuli/core/style.css';   // bring in the admin palette + base styles

const app = initializeApp(config);
const db = getFirestore(app);
const storage = getStorage(app);

// 2. Hand db/storage to the services.
import { BlogAdminService } from '@thuli/services/blogService';
import { MediaService } from '@thuli/services/mediaService';

const blogService = new BlogAdminService(db);
const mediaService = new MediaService(db, storage);

// 3. Render.
import { BlogList, BlogEditor, BlogAdminList, MediaLibrary } from '@thuli/blog';

// Public feed
<BlogList title="Notes" subtitle="Thoughts" basePath="/blog"
          blogService={blogService} mediaService={mediaService} />

// Admin surfaces (gate the route with @thuli/auth/AdminGate)
<BlogAdminList service={blogService} onEdit={id => ...} />
<BlogEditor    service={blogService} mediaService={mediaService}
               postId={id} onClose={...} />
<MediaLibrary  service={mediaService} />
```

That's the whole contract. No global state, no context providers.

## Service API cheat-sheet

### `BlogAdminService`

| Method | Purpose |
|---|---|
| `listPosts(filter?)` | All posts (⚠️ unpaginated; prefer `listPostsPage`). |
| `listPostsPage({ filter?, limit, cursor })` | Cursor-paginated admin list. |
| `listPublishedPostsPage({ limit, cursor })` | Cursor-paginated public feed, `BlogItem`-shaped. |
| `getPublishedPosts(limit?)` | Legacy list-all with client-side sort. Kept for home-page callers. |
| `getPostWithContent(id)` | Meta + markdown body in one call. |
| `saveDraft(meta, markdown)` / `publish(meta, markdown)` | Editor persistence. |
| `publishPost(id)` | One-shot publish (used by the admin list's quick-publish). |
| `importLegacyPost(meta, markdown, date)` | For migration tools — preserves the legacy date. |
| `getStats(forceRefresh?)` | `{ total, published, drafts, mediaItems, orphanedContents }`. |
| `getOrphanedContents()` / `deleteBlogContent(id)` | Orphan cleanup. |

### `MediaService`

| Method | Purpose |
|---|---|
| `listMedia(sortDesc?)` | All media (⚠️ prefer `listMediaPage`). |
| `listMediaPage({ limit, cursor, sortDesc? })` | Cursor-paginated grid. |
| `getBySlug(slug)` | Cached single-slug lookup. |
| `resolveSlugs(slugs[])` | Batch lookup, 30-per-query. Returns `{ slug: url }`. |
| `resolvePostThumbnails(posts[])` | Replaces N+1 thumbnail resolution at list surfaces. |
| `uploadFile(file, path?)` | Storage upload + thumbnail generation. |
| `addItem(input)` | Catalog a media item (URL-only or post-upload); fills timestamps + UUID, strips `undefined` fields so Firestore accepts the write. |
| `bulkUpload(files)` | Upload + catalog a batch; dedups slugs. Returns `{ successCount, failures: [{ file, error }] }` so callers can surface per-file errors. |
| `renameItem(id, name, slug?)` | Rename an existing item. Auto-derives slug from name if blank; suffixes on collision (skipping the doc's own slug). |
| `regenerateMissingThumbnails(onProgress?)` | Re-crunch thumbnails for items that lack them. Generates 480px-max thumbs (sharp on retina 200px tiles). |
| `listOrphanedMediaBlobs(rootPath?)` | Diff `media/**` storage blobs against `media_items` references. Powers the Orphaned Media admin surface. |
| `deleteStorageBlob(fullPath)` | Delete a single storage blob by its full path. |

## Conventions consumers should know

### The `slug:` URL convention

Images stored inside blog markdown — and the `coverImageUrl` metadata field — use `slug:my-image-name` instead of a raw Firebase Storage URL. `MediaService.resolveSlugs` turns the slug into a live download URL at render time. This makes content **portable across Firebase projects** — moving a Firestore export to a new project doesn't break anything as long as the media items get imported under the same slugs.

### Admin palette

Admin components use semantic classes (`admin-card`, `admin-text-muted`, etc.) defined in [`admin/admin-surface.css`](./admin/admin-surface.css). The palette flips automatically when `<html class="dark">` is set. See [docs/design/thuli-admin-palette.md](../../../docs/design/thuli-admin-palette.md) for the full convention.

### Pagination

Cursor-based. The cursor is opaque (`PageCursor = unknown`) — pass it back to the next call, don't inspect it. Legacy `listPosts()` / `listMedia()` remain for now and fetch the full collection; they'll be deprecated in a future release. All new code should use the `*Page` variants.

### Composite indexes required

`listPublishedPostsPage` runs `where status == 'published' orderBy publishedAt desc`. Host apps need this composite index in their Firestore project:

```json
{
  "collectionGroup": "blog_posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
  ]
}
```

See [exp-web/firestore.indexes.json](../../../exp-web/firestore.indexes.json) for the complete set.

## Related docs

- [docs/design/blog-tools.md](../../../docs/design/blog-tools.md) — higher-level feature overview and workflows.
- [docs/design/thuli-admin-palette.md](../../../docs/design/thuli-admin-palette.md) — the admin color tokens.
- [docs/specs/blog-stack-v2-prd.md](../../../docs/specs/blog-stack-v2-prd.md) — history of the Phase 1 & 2 refactors that produced this layout.
