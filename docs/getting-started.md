# Getting Started with @comify.art/thuli

`@comify.art/thuli` provides shared UI components, layout structures, content publishing tools, and Firebase utilities for web applications built with React and Tailwind CSS.

---

## 1. Installation

Install the library from npm:

```bash
npm install @comify.art/thuli
```

### Peer Dependencies

Install the required peer dependencies in your host application:

```bash
npm install react react-dom react-router-dom firebase lucide-react \
  react-markdown katex rehype-katex remark-gfm remark-math
```

---

## 2. Style Integration

`@comify.art/thuli` is designed with Tailwind CSS v4 and provides precompiled stylesheet distribution.

### Option A: Import Compiled CSS (Recommended)
Import the precompiled stylesheet in your application's entrypoint (e.g., `main.tsx` or `App.tsx`):

```tsx
import '@comify.art/thuli/style.css';
```

### Option B: Theme Variables Configuration
Ensure your application provides or overrides the expected CSS custom properties in your root CSS:

```css
:root {
  --foreground: #0f172a;
  --background: #ffffff;
  --primary: #2563eb;
  --accent: #f59e0b;
}

.dark {
  --foreground: #f8fafc;
  --background: #0f172a;
  --primary: #3b82f6;
  --accent: #fbbf24;
}
```

---

## 3. Basic Usage Example

```tsx
import React from 'react';
import { AppShell } from '@comify.art/thuli/layout';
import { BlogPostComponent } from '@comify.art/thuli/blog';
import '@comify.art/thuli/style.css';

export function BlogPostPage({ slug }: { slug: string }) {
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

## 4. Sample Application

A complete reference application demonstrating select `@comify.art/thuli` components is available in the [`samples/`](../samples) directory:

- **[`samples/simple-app`](../samples/simple-app)**: Demonstrates `Navbar`, `Footer`, `Modal`, `ConfirmationModal`, `ComingSoon`, `shareUtils`, and `@comify.art/thuli/style.css` in an interactive Vite + React app.

See the [Samples Guide](../samples/README.md) for instructions on running the sample.

---

## 5. Next Steps

- Explore [Module Overview](modules.md) for full documentation on subpath entrypoints.
- Review [Architecture Guide](architecture.md) for design patterns and dependency structures.
- Explore [Sample Application](../samples/simple-app) for practical integration code.

