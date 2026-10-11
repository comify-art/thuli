# Comprehensive Integration Guide

This guide details how to integrate `@comify.art/thuli` into modern React applications built with Vite, Next.js, or Single Page Application architectures.

---

## 1. Installation

Install the package and peer dependencies:

```bash
# Core package
npm install @comify.art/thuli

# Required Peer Dependencies
npm install react react-dom react-router-dom firebase lucide-react \
  react-markdown katex rehype-katex remark-gfm remark-math
```

---

## 2. Styling & Theme Configuration

### 2.1 Precompiled CSS
Import the precompiled CSS in your root entrypoint (`main.tsx` or `App.tsx`) **before** your local stylesheets:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@comify.art/thuli/style.css'; // MUST come first
import './index.css';                 // App-specific overrides
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

### 2.2 Dark Mode & Brand Colors
`@comify.art/thuli` is designed with Tailwind CSS v4 and respects custom CSS variables:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-foreground: #0f172a;
  --color-background: #ffffff;
  --color-primary: #2563eb;
  --color-accent: #f59e0b;
}

/* Enable always-on dark mode if desired */
.dark {
  --color-foreground: #f8fafc;
  --color-background: #0f172a;
  --color-primary: #3b82f6;
  --color-accent: #fbbf24;
}
```

---

## 3. Subpath Imports

`@comify.art/thuli` uses standard package `exports`. Import directly from subpaths:

```typescript
// Layouts
import { AppShell, Navbar, Footer, PageMeta } from '@comify.art/thuli/layout';

// Content & Publishing
import { BlogPostComponent, BlogList, BlogEditor, MediaLibrary } from '@comify.art/thuli/blog';

// Structured Literature
import { BookHome, ChapterTOC, VersePage } from '@comify.art/thuli/verse-books';

// Firebase Service Layer
import { BlogAdminService, MediaService, BookService } from '@comify.art/thuli/services';

// Auth Gates
import { AdminGate, useAdminGate } from '@comify.art/thuli/auth';

// UI Primitives
import { Modal, ConfirmationModal, ComingSoon } from '@comify.art/thuli/ui';

// Utility Functions
import { shareContent } from '@comify.art/thuli/utils/shareUtils';
```

---

## 4. End-to-End Component Wiring

### 4.1 Blog Reader & Post Viewer
```tsx
import React, { useEffect, useState } from 'react';
import { BlogPostComponent } from '@comify.art/thuli/blog';
import { AppShell } from '@comify.art/thuli/layout';

export function BlogPostPage({ slug }: { slug: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BlogPostComponent slug={slug} />
    </div>
  );
}
```

### 4.2 Admin Content Management
```tsx
import React, { useState } from 'react';
import { AdminGate } from '@comify.art/thuli/auth';
import { BlogEditor, BlogAdminList, MediaLibrary } from '@comify.art/thuli/blog';
import { blogService, mediaService } from '../services';

export function AdminDashboard() {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  return (
    <AdminGate>
      <div className="p-6">
        {editingPostId ? (
          <BlogEditor
            postId={editingPostId}
            blogService={blogService}
            mediaService={mediaService}
            defaultAuthor="Editor"
            onClose={() => setEditingPostId(null)}
          />
        ) : (
          <BlogAdminList
            blogService={blogService}
            onEditPost={(id) => setEditingPostId(id)}
          />
        )}
      </div>
    </AdminGate>
  );
}
```

---

## 5. Troubleshooting & FAQ

### Issue: Duplicate React or Context Errors
- Ensure your host application does not bundle multiple versions of React.
- Run `npm ls react` to confirm only one top-level React version exists.

### Issue: Canvas Tainted Error on Image Thumbnail Generation
- Occurs when Firebase Storage lacks CORS headers.
- Follow the instructions in [Firebase Backend Setup Guide](./setup-firebase.md#33-storage-cors-configuration-critical-for-thumbnails) to upload `cors.json`.

### Issue: Math Equations (LaTeX) Not Rendering
- Ensure `katex/dist/katex.min.css` is imported if rendering complex equations, or verify `rehype-katex` peer dependency is installed.
