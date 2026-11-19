# Thuli 2.0 Architecture & Design

## 4-Tier Canonical Container Topology

`@comify.art/thuli` v2.0 is structured into four strictly decoupled containers with unidirectional dependencies:

```text
core  <--  ui  <--  integrations  <--  features
```

### Container 1: `core` (`@comify.art/thuli/core`)
- **Responsibility**: Pure TypeScript logic, design token contracts, formatters, and browser helpers.
- **Dependencies**: Zero React or visual UI dependencies.
- **Modules**: `tokens.ts`, `currency.ts`, `csv.ts`, `phone.ts`, `cookies.ts`, `images.ts`, `share.ts`.

### Container 2: `ui` (`@comify.art/thuli/ui`)
- **Responsibility**: Domain-neutral visual presentation components.
- **Sub-layers**:
  - `primitives/`: `Modal`, `ConfirmationModal`, `Alert`, `Drawer`, `DataTable`, `SortableHeader`, `MetricStrip`, `ProgressMeter`, `StatusBadge`, `FormField` suite, `KpiCard`, `PageHeader`, `EmptyState`, `CopyButton`, `PaginationFooter`, `useCursorPagination`.
  - `feedback/`: `ComingSoon`, `MarkdownRenderer`.
  - `layout/`: `AppShell`, `Navbar`, `Footer`, `Sidebar`, `TwoColumnLayout`, `MasterDetailLayout`, `PageMeta`.

### Container 3: `integrations` (`@comify.art/thuli/integrations`)
- **Responsibility**: Headless protocol compilers and 3rd-party SDK bridges.
- **Modules**:
  - `calendar/`: RFC 5545 `.ics` generator (`ics.ts`) and Google/Outlook/Apple deep-link builders (`deepLinks.ts`).
  - `whatsapp/`: `linkBuilder.ts`, `manifest.ts`, `WhatsAppSyndicateCard`, `WhatsAppBroadcastConsole`.
  - `firebase/`: `BaseAdminService` generic Firestore CRUD & pagination layer.

### Container 4: `features` (`@comify.art/thuli/features`)
- **Responsibility**: Turnkey composite modules combining UI, state, and services.
- **Modules**:
  - `access/`: `AdminGate`, `useAdminGate`, `PrivateRoute`, `RoleGate`, `AccessGateCard`, `UserProfileMenu`, `useAuthSession`, `LockedPitchRecordingBanner`.
  - `publishing/`: Blog reader, markdown editor, media library, and Firestore/Storage services.
  - `literature/`: Verse-books reader, chapter TOC, pack-format importer, and book/chapter/verse services.
  - `tracker/`: Activity dashboard, trend utilities, and logging service.
  - `documents/`: `DocumentViewer` PDF viewer with external/download fallback.

---

## Dark-First Theme Token Contracts

To prevent theme-inversion bugs (e.g., white modal dialogs inside dark-themed host applications), all Thuli primitives bind directly to semantic CSS variables defined in `src/index.css` and documented in `THULI_TOKENS` (`src/core/tokens.ts`):

| CSS Variable | Default Fallback | Purpose |
| :--- | :--- | :--- |
| `--surface-canvas` | `#0f172a` | Root application background |
| `--surface-panel` | `#1e293b` | Sidebars, elevated panels, drawers |
| `--surface-modal` | `#1e293b` | Modal & confirmation dialog surfaces |
| `--surface-card` | `#1e293b` | Card containers |
| `--surface-input` | `#182236` | Form input backgrounds |
| `--border-default` | `rgba(255, 255, 255, 0.08)` | Standard container borders |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Hairline dividers |
| `--accent-primary` | `#3b82f6` | Primary interactive accent |

---

## Subpath Packaging & Backwards Compatibility

Every canonical container and sub-container is exposed via `package.json` `exports` with both ESM (`import`) and TypeScript (`types`) entrypoints. Legacy v1 top-level subpaths (`/layout`, `/blog`, `/verse-books`, `/services`, `/tracker`, `/auth`, `/ui`, `/utils`, `/router`) are preserved as thin re-export shims forwarding to the canonical containers.
