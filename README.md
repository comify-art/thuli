# @comify.art/thuli

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> Shared UI components, layout structures, content publishing engines, and Firebase service utilities for **comify.art** web applications.

`@comify.art/thuli` is a modular, tree-shakable React component and utility library designed for applications built with React, Vite, and Tailwind CSS.

---

## 📚 Documentation & Samples

Detailed documentation and reference implementations:

- 🚀 **[Getting Started](./docs/getting-started.md)**: Installation, peer dependencies, and styling setup.
- 🔌 **[Integration Guide](./docs/integration-guide.md)**: Comprehensive host app wiring and usage manual.
- 🔥 **[Firebase Backend Setup](./docs/setup-firebase.md)**: Firestore collections, security rules, Storage CORS, and Auth.
- 📊 **[Analytics & Tracking](./docs/setup-analytics.md)**: Google Analytics setup, page views, and activity tracking.
- 📦 **[Module Reference](./docs/modules.md)**: Comprehensive guide to subpath entrypoints (`/layout`, `/blog`, `/services`, etc.).
- 🏗️ **[Architecture & Design](./docs/architecture.md)**: Dependency tiering, styling architecture, and build pipeline.
- 🚀 **[Publishing & Governance](./docs/publishing-guide.md)**: First-time publishing instructions, branch protection (`main`), and CI/CD.
- 💻 **[Sample Applications](./samples)**: Working reference implementation in [`samples/simple-app`](./samples/simple-app) demonstrating select components (`Navbar`, `Footer`, `Modal`, `ConfirmationModal`, `ComingSoon`).

---

## 📦 Subpath Modules

`@comify.art/thuli` provides clean, native subpath imports for maximum flexibility and minimal bundle overhead:

| Import Path | Description | Key Exports |
| :--- | :--- | :--- |
| `@comify.art/thuli` | Root entrypoint | Common components, modal primitives, and utilities |
| `@comify.art/thuli/layout` | Application shells & navigation | `AppShell`, `Navbar`, `Footer`, `Sidebar`, `TwoColumnLayout`, `PageMeta` |
| `@comify.art/thuli/blog` | Blog publishing & media engine | `BlogList`, `BlogPostComponent`, `BlogEditor`, `MediaLibrary`, `MediaPicker` |
| `@comify.art/thuli/verse-books` | Structured literature & verse reader | `BookHome`, `BookListPublic`, `ChapterTOC`, `VersePage`, `VerseImporter` |
| `@comify.art/thuli/services` | Firebase Firestore & Storage services | `BlogAdminService`, `MediaService`, `BookService`, `ChapterService`, `VerseService` |
| `@comify.art/thuli/tracker` | Activity & metric tracking | `TrackerApp`, `Dashboard`, `MetricCard`, `MetricRow`, `EntryForm` |
| `@comify.art/thuli/auth` | Route protection & gates | `AdminGate`, `useAdminGate` |
| `@comify.art/thuli/ui` | Generic UI primitives | `Modal`, `ConfirmationModal`, `ComingSoon`, `MarkdownRenderer` |
| `@comify.art/thuli/utils` | Shared helper functions | `imageUtils` (canvas thumbnails), `shareUtils` (Web Share API) |
| `@comify.art/thuli/style.css` | Precompiled Tailwind CSS | Compiled stylesheets, custom dark mode variant, CSS variable tokens |

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install @comify.art/thuli
```

### 2. Peer Dependencies

Install required peer dependencies in your host application:

```bash
npm install react react-dom react-router-dom firebase lucide-react \
  react-markdown katex rehype-katex remark-gfm remark-math
```

### 3. Usage Example

```tsx
import React from 'react';
import { AppShell } from '@comify.art/thuli/layout';
import { BlogPostComponent } from '@comify.art/thuli/blog';
import { BlogAdminService, MediaService } from '@comify.art/thuli/services';
import '@comify.art/thuli/style.css';

export function BlogArticle({ slug }: { slug: string }) {
  return (
    <AppShell>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <BlogPostComponent slug={slug} />
      </main>
    </AppShell>
  );
}
```

---

## 🛠️ Project Structure

```
thuli/
├── docs/                   # Documentation guides
│   ├── getting-started.md  # Quickstart and peer dependency setup
│   ├── integration-guide.md# Complete host application wiring guide
│   ├── setup-firebase.md   # Firestore rules, Storage CORS, and Auth
│   ├── setup-analytics.md  # Google Analytics and activity tracking
│   ├── modules.md          # Subpath reference and API exports
│   └── architecture.md     # Architectural principles and styling
├── samples/                # Reference applications
│   ├── README.md           # Samples documentation
│   └── simple-app/         # Working Vite + React demonstration app
├── src/                    # Source code
│   ├── auth/               # Route authorization gates
│   ├── blog/               # Blog UI, admin, and media library
│   ├── layout/             # Shell, headers, footers, layouts
│   ├── services/           # Firestore & Storage services
│   ├── tracker/            # Activity tracking modules
│   ├── types/              # TypeScript definitions
│   ├── ui/                 # Reusable UI primitives
│   ├── utils/              # Canvas & sharing utilities
│   ├── verse-books/        # Literature and verse reader/editor
│   ├── index.css           # Tailwind CSS entrypoint
│   └── index.ts            # Main package entrypoint
├── README.md               # Package overview
├── package.json            # Manifest with modern subpath exports
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Multi-entry library bundler configuration
```

---

## 📄 License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)
