# Thuli 2.0 Architecture

`@comify.art/thuli` v2.0 separates code into four containers. Each container only imports from containers below it:

```text
core  <--  ui  <--  integrations  <--  features
```

## 1. The 4 Containers

### Container 1: `core` (`@comify.art/thuli/core`)
- Contains pure TypeScript functions and CSS token constants.
- Has zero React or DOM component dependencies.
- Includes `tokens.ts`, `currency.ts`, `csv.ts`, `phone.ts`, `cookies.ts`, `images.ts`, `share.ts`, and `metadata.ts`.

### Container 2: `ui` (`@comify.art/thuli/ui`)
- Contains reusable visual React components without app-specific business logic.
- Organized into three folders:
  - `primitives/`: `Modal`, `ConfirmationModal`, `Alert`, `Drawer`, `DataTable`, `SortableHeader`, `MetricStrip`, `ProgressMeter`, `StatusBadge`, `FormField`, `KpiCard`, `PageHeader`, `EmptyState`, `CopyButton`, `PaginationFooter`, `useCursorPagination`.
  - `feedback/`: `ComingSoon`, `MarkdownRenderer`.
  - `layout/`: `AppShell`, `Navbar`, `Footer`, `Sidebar`, `TwoColumnLayout`, `MasterDetailLayout`, `PageMeta`.

### Container 3: `integrations` (`@comify.art/thuli/integrations`)
- Connects your app to external tools and cloud services:
  - `calendar/`: Builds RFC 5545 `.ics` files and Google/Outlook calendar links.
  - `whatsapp/`: Builds `wa.me` links, group manifests, `WhatsAppSyndicateCard`, and `WhatsAppBroadcastConsole`.
  - `zoom/`: Provides `ZoomSchedulePanel` and `ZoomRecordingPanel` UI controls. (Store API keys and OAuth tokens on your backend server, not in the browser.)
  - `firebase/`: Provides `BaseAdminService` for Firestore CRUD and cursor pagination, plus `TriggerEmailService` for the Firebase Trigger Email extension.

### Container 4: `features` (`@comify.art/thuli/features`)
- Combines UI, state, and services into complete product modules:
  - `access/`: `AdminGate`, `useAdminGate`, `PrivateRoute`, `RoleGate`, `AccessGateCard`, `LoginCard`, `UserProfileMenu`, `useAuthSession`, `LockedPitchRecordingBanner`.
  - `publishing/`: Blog reader, markdown editor, media library, and Firestore/Storage services.
  - `literature/`: Book and verse reader, table of contents, pack-format parser, and services.
  - `tracker/`: Activity dashboard, trend helpers, and logging service.
  - `documents/`: `DocumentViewer` for PDFs with download fallback.

---

## 2. Dark-First Theme Tokens

In v1, `Modal` used light-mode classes (`bg-white dark:bg-gray-800`). Dark-themed apps without `<html class="dark">` showed a white modal background.

In v2, all UI components read CSS custom properties defined in `src/index.css` and `src/core/tokens.ts`:

| CSS Variable | Default Value | Used For |
| :--- | :--- | :--- |
| `--surface-canvas` | `#0f172a` | Page background |
| `--surface-panel` | `#1e293b` | Sidebars, panels, drawers |
| `--surface-modal` | `#1e293b` | Modal and confirmation dialogs |
| `--surface-card` | `#1e293b` | Card containers |
| `--surface-input` | `#182236` | Text inputs, selects, textareas |
| `--border-default` | `rgba(255, 255, 255, 0.08)` | Container borders |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Hairline dividers |
| `--accent-primary` | `#3b82f6` | Primary buttons and focus rings |

---

## 3. Backwards Compatibility

`package.json` exports both ESM (`import`) and TypeScript (`types`) entry points for every container.

Legacy v1 paths (`/layout`, `/blog`, `/verse-books`, `/services`, `/tracker`, `/auth`, `/ui`, `/utils`, `/router`) stay active as thin re-export files that point to the v2 containers.
