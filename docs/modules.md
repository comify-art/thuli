# Module Reference

`@comify.art/thuli` offers granular subpath entry points configured through standard Node / Vite package exports. This enables optimal tree-shaking and isolation of dependencies.

---

## 1. `@comify.art/thuli/layout`

Responsive layout primitives, navigation, and structural wrappers.

### Components
- **`AppShell`**: Main wrapper providing fixed header, dynamic main content area, and footer layout.
- **`Navbar`**: Responsive navigation bar with mobile slideout menu, theme toggling, and branding.
- **`Footer`**: Multi-column footer with social links, copyright, and navigation sections.
- **`Sidebar`**: Collapsible administrative and contextual navigation sidebar.
- **`TwoColumnLayout`**: Left-anchored or split layout for content with sidebars.
- **`MasterDetailLayout`**: Split-pane view for master list items and detail inspection.
- **`PageMeta`**: Header utility component for document titles and metadata.

### Example
```tsx
import { AppShell, Navbar, Footer } from '@comify.art/thuli/layout';
```

---

## 2. `@comify.art/thuli/blog`

Full-featured blog and publishing engine with markdown editing, media management, and optimization.

### Public UI
- **`BlogPostComponent`**: Full article renderer with KaTeX math and markdown formatting.
- **`BlogList`**: Paginated post grid with tags, reading times, and cover images.
- **`AsyncImage`**: Lazy-loaded image component with skeleton states and fallback handling.

### Admin Surfaces
- **`BlogAdminList`**: Management dashboard for drafts, published articles, and revisions.
- **`BlogEditor`**: Markdown editor with live preview, asset picker, and metadata controls.
- **`BlogStatsWidget`**: Summary analytics for published content.
- **`MediaLibrary`**: Asset manager with client-side canvas thumbnail generation.
- **`MediaPicker`**: Modal asset picker for inserting media into markdown content.

### Example
```tsx
import { BlogList, BlogPostComponent, BlogEditor, MediaLibrary } from '@comify.art/thuli/blog';
```

---

## 3. `@comify.art/thuli/verse-books`

Structured literature, verse, and chapter reader and administrative suite.

### Components
- **`BookHome`**: Landing page for a book with chapter index and metadata.
- **`BookListPublic`**: Catalog view of available books and collections.
- **`ChapterTOC`**: Chapter table of contents and navigation grid.
- **`VersePage`**: Verse inspection view with translations, commentary, and deep linking.
- **`VerseNavigator`**: Floating or anchored previous/next navigation.
- **`VerseImporter`**: Batch importer supporting JSON and pack formats.

### Example
```tsx
import { BookHome, ChapterTOC, VersePage, VerseImporter } from '@comify.art/thuli/verse-books';
```

---

## 4. `@comify.art/thuli/services`

Clean Firebase Firestore and Cloud Storage service layer abstractions.

### Services
- **`BaseAdminService`**: Abstract base class providing common CRUD operations and cursor pagination.
- **`BlogAdminService`**: Blog post management, draft publishing, and post querying.
- **`MediaService`**: Cloud Storage image uploads, automatic thumbnailing, and orphan cleanup.
- **`BookService`**: Book hierarchy and metadata management.
- **`ChapterService`**: Chapter indexing and ordering.
- **`VerseService`**: Verse retrieval, translation mapping, and querying.

### Example
```tsx
import { BlogAdminService, MediaService, BookService } from '@comify.art/thuli/services';
```

---

## 5. `@comify.art/thuli/tracker`

Habit, metric, and activity tracking application components.

### Components
- **`TrackerApp`**: Integrated tracker dashboard and logging interface.
- **`Dashboard`**: Visual summary with streak counters and trend graphs.
- **`MetricCard` / `MetricRow`**: Modular metric display widgets.
- **`EntryForm`**: Activity submission form.

### Example
```tsx
import { TrackerApp, Dashboard } from '@comify.art/thuli/tracker';
```

---

## 6. `@comify.art/thuli/auth`

Route protection and administrative access gates.

### Components & Hooks
- **`AdminGate`**: Access control wrapper that renders children only when the authenticated user meets administrative criteria.
- **`useAdminGate`**: Hook providing status, user identity, and authentication checks.

### Example
```tsx
import { AdminGate, useAdminGate } from '@comify.art/thuli/auth';
```

---

## 7. `@comify.art/thuli/ui`

Common UI primitives and design components.

### Primitives
- **`Modal`**: Accessible overlay dialog.
- **`ConfirmationModal`**: Action prompt for confirmations and deletions.
- **`ComingSoon`**: Placeholder view for feature stubs.
- **`MarkdownRenderer`**: Standalone markdown renderer with syntax highlighting.
- **`PaginationFooter`**: Cursor-based and offset pagination controls.

### Example
```tsx
import { Modal, ConfirmationModal, MarkdownRenderer } from '@comify.art/thuli/ui';
```

---

## 8. `@comify.art/thuli/utils`

Client-side utility functions.

- **`imageUtils`**: Canvas-based client-side image resizing and thumbnail generation.
- **`shareUtils`**: Native Web Share API integration with clipboard fallbacks.

### Example
```tsx
import { generateThumbnail, copyToClipboard } from '@comify.art/thuli/utils';
```
