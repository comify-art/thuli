# Getting Started with `@comify.art/thuli`

This guide shows you how to install `@comify.art/thuli`, add its peer dependencies, and configure dark-first CSS tokens.

## 1. Install the Package

Run this command in your project root:

```bash
npm install @comify.art/thuli
```

## 2. Install Peer Dependencies

Install the required peer dependencies in your host app:

```bash
npm install react react-dom react-router-dom firebase lucide-react \
  react-markdown remark-gfm
```

If you render math formulas with `MarkdownRenderer`, also install the KaTeX packages:

```bash
npm install katex rehype-katex remark-math
```

## 3. Import the Stylesheet

Import the compiled Thuli stylesheet once in your app entry file (`src/main.tsx` or `src/index.css`):

```tsx
import '@comify.art/thuli/style.css';
```

This stylesheet sets default dark-first CSS variables on `:root`:

```css
:root {
  --surface-canvas: #0f172a;
  --surface-panel: #1e293b;
  --surface-modal: #1e293b;
  --surface-card: #1e293b;
  --surface-input: #182236;
  --border-default: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --accent-primary: #3b82f6;
}
```

To change the theme colors, override these variables in your own CSS file after you import `@comify.art/thuli/style.css`.

To enable class-based dark mode in Tailwind v4, add `class="dark"` to your `<html>` element.

## 4. Import from the 4 Containers

Import modules from their container subpaths to keep your bundle small:

- `@comify.art/thuli/core` — Pure TypeScript utilities and CSS token names.
- `@comify.art/thuli/ui/primitives`, `/ui/feedback`, `/ui/layout` — React UI components.
- `@comify.art/thuli/integrations/calendar`, `/whatsapp`, `/zoom`, `/firebase` — External service helpers and UI panels.
- `@comify.art/thuli/features/access`, `/publishing`, `/literature`, `/tracker`, `/documents` — Complete feature modules.
