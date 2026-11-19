# Getting Started with `@comify.art/thuli`

## 1. Installation

```bash
npm install @comify.art/thuli
```

## 2. Peer Dependencies

Install the peer dependencies required by your application:

```bash
npm install react react-dom react-router-dom firebase lucide-react \
  react-markdown remark-gfm
```

If you use mathematical rendering in `MarkdownRenderer`, also install the optional KaTeX peers:

```bash
npm install katex rehype-katex remark-math
```

## 3. Dark-First CSS & Theme Token Setup

Import the compiled Thuli stylesheet once in your application entrypoint (`main.tsx` or `index.css`):

```tsx
import '@comify.art/thuli/style.css';
```

`@comify.art/thuli/style.css` includes default `:root` CSS variable fallbacks for dark-first surfaces and borders:

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

To customize the palette for your brand, override these CSS variables in your host stylesheet after importing `@comify.art/thuli/style.css`.

For class-based dark mode with Tailwind v4, add `class="dark"` to your `<html>` element.

## 4. Importing from Canonical Containers

Prefer importing from the 4 canonical containers for optimal tree-shaking:

- `@comify.art/thuli/core` — Pure TypeScript utilities & token contracts (zero React dependencies)
- `@comify.art/thuli/ui/primitives`, `/ui/feedback`, `/ui/layout` — Visual UI components
- `@comify.art/thuli/integrations/calendar`, `/integrations/whatsapp`, `/integrations/firebase` — 3rd-party protocol & SDK bridges
- `@comify.art/thuli/features/access`, `/features/publishing`, `/features/literature`, `/features/tracker`, `/features/documents` — Turnkey domain modules
