# @comify.art/thuli

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![npm version](https://img.shields.io/npm/v/@comify.art/thuli.svg)](https://www.npmjs.com/package/@comify.art/thuli)

> Modular, dark-first React UI primitives, core utilities, integrations, and turnkey feature engines for modern web applications.

---

## 📦 4 Canonical Containers

| Container | Import Path | Highlights |
| :--- | :--- | :--- |
| **1. Core** | `@comify.art/thuli/core` | `THULI_TOKENS`, currency & E.164 phone formatters, RFC 4180 CSV, cookies, image/share helpers |
| **2. UI** | `@comify.art/thuli/ui` (`/primitives`, `/feedback`, `/layout`) | `Modal`, `ConfirmationModal`, `Alert`, `Drawer`, `DataTable`, `MetricStrip`, `ProgressMeter`, `StatusBadge`, `FormField`, `ComingSoon`, `MarkdownRenderer`, `AppShell`, `Navbar`, `Footer` |
| **3. Integrations** | `@comify.art/thuli/integrations` (`/calendar`, `/whatsapp`, `/zoom`, `/firebase`) | `.ics` & calendar deep links, `WhatsAppSyndicateCard`, `WhatsAppBroadcastConsole`, `ZoomSchedulePanel`, `ZoomRecordingPanel`, `BaseAdminService` |
| **4. Features** | `@comify.art/thuli/features` (`/access`, `/publishing`, `/literature`, `/tracker`, `/documents`) | `AdminGate`, `RoleGate`, `AccessGateCard`, `UserProfileMenu`, `BlogList`/`Editor`, `BookHome`/`VersePage`, `TrackerApp`, `DocumentViewer` |
| **Styles** | `@comify.art/thuli/style.css` | Precompiled Tailwind CSS v4 bundle with dark-first `:root` token fallbacks |

> Legacy v1 subpaths (`/layout`, `/blog`, `/verse-books`, `/services`, `/tracker`, `/auth`, `/ui`, `/utils`, `/router`) remain supported via thin re-export shims.

---

## 🚀 Quick Start

```bash
npm install @comify.art/thuli
```

```tsx
import '@comify.art/thuli/style.css';
import { formatCompactCurrency } from '@comify.art/thuli/core';
import { Alert, MetricStrip } from '@comify.art/thuli/ui/primitives';
import { Navbar, Footer } from '@comify.art/thuli/ui/layout';
```

---

## 📚 Documentation & Samples

- **[Getting Started](./docs/getting-started.md)** — Installation, peer dependencies, and dark-first CSS token setup
- **[Module Reference](./docs/modules.md)** — Full API and subpath reference for all 4 containers & legacy shims
- **[Architecture & Design](./docs/architecture.md)** — 4-tier container topology, dependency flow, and token contracts
- **[Integration Guide](./docs/integration-guide.md)** — Host application wiring and usage patterns
- **[Firebase Backend Setup](./docs/setup-firebase.md)** & **[Analytics](./docs/setup-analytics.md)** — Backend collections, rules, and tracking
- **[Publishing & Governance](./docs/publishing-guide.md)** — Release workflow and CI/CD
- **[Sample Applications](./samples/README.md)** — `v1-classic-starter` (v1 compat) & `v2-modern-portal` (4-container showcase)
