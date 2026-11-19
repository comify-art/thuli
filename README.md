# @comify.art/thuli

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)  [![npm version](https://img.shields.io/npm/v/@comify.art/thuli.svg)](https://www.npmjs.com/package/@comify.art/thuli)

> Modular, dark-first React UI primitives, core utilities, headless integrations, and turnkey feature engines for modern web applications.

`@comify.art/thuli` v2.0 organizes its ecosystem into **four canonical, decoupled containers** with 100% backwards-compatible v1 subpath shims.

---

## 📚 Documentation & Samples

- 🚀 **[Getting Started](./docs/getting-started.md)**: Installation, peer dependencies, and dark-first CSS variable token setup.
- 📦 **[Module Reference](./docs/modules.md)**: Comprehensive API and subpath reference for all 4 canonical containers and legacy shims.
- 🏗️ **[Architecture & Design](./docs/architecture.md)**: 4-tier container topology, dependency flow, and token contracts.
- 🔌 **[Integration Guide](./docs/integration-guide.md)**: Host application wiring and usage manual.
- 🔥 **[Firebase Backend Setup](./docs/setup-firebase.md)**: Firestore collections, security rules, Storage CORS, and Auth.
- 📊 **[Analytics & Tracking](./docs/setup-analytics.md)**: Google Analytics setup, page views, and activity tracking.
- 🚀 **[Publishing & Governance](./docs/publishing-guide.md)**: Release workflow, branch protection, and CI/CD.
- 💻 **[Sample Applications](./samples)**: Dual reference harness (`v1-classic-starter` for legacy v1 compatibility and `v2-modern-portal` for the v2 4-container showcase).

---

## 📦 Canonical Container Subpaths (v2.0)

| Container | Import Path | Key Exports |
| :--- | :--- | :--- |
| **1. Core** | `@comify.art/thuli/core` | `THULI_TOKENS`, `formatCurrency`, `formatCompactCurrency`, `buildCsvContent`, `downloadCsvFile`, `formatPhoneNumberE164`, `sessionCookie`, `resizeImage`, `shareContent` |
| **2. UI** | `@comify.art/thuli/ui`<br>`@comify.art/thuli/ui/primitives`<br>`@comify.art/thuli/ui/feedback`<br>`@comify.art/thuli/ui/layout` | `Modal`, `ConfirmationModal`, `Alert`, `Drawer`, `DataTable`, `SortableHeader`, `MetricStrip`, `ProgressMeter`, `StatusBadge`, `FormField`, `EmptyState`, `CopyButton`, `ComingSoon`, `MarkdownRenderer`, `AppShell`, `Navbar`, `Footer`, `Sidebar`, `PageMeta` |
| **3. Integrations** | `@comify.art/thuli/integrations`<br>`@comify.art/thuli/integrations/calendar`<br>`@comify.art/thuli/integrations/whatsapp`<br>`@comify.art/thuli/integrations/firebase` | `downloadIcsFile`, `buildGoogleCalendarUrl`, `WhatsAppSyndicateCard`, `WhatsAppBroadcastConsole`, `BaseAdminService` |
| **4. Features** | `@comify.art/thuli/features`<br>`@comify.art/thuli/features/access`<br>`@comify.art/thuli/features/publishing`<br>`@comify.art/thuli/features/literature`<br>`@comify.art/thuli/features/tracker`<br>`@comify.art/thuli/features/documents` | `AdminGate`, `RoleGate`, `AccessGateCard`, `UserProfileMenu`, `useAuthSession`, `PrivateRoute`, `BlogList`, `BlogEditor`, `MediaLibrary`, `BookHome`, `VersePage`, `TrackerApp`, `DocumentViewer` |
| **Styles** | `@comify.art/thuli/style.css` | Precompiled Tailwind CSS v4 bundle with dark-first `:root` token fallbacks |

> **Legacy v1 Subpaths**: `@comify.art/thuli/layout`, `/blog`, `/verse-books`, `/services`, `/tracker`, `/auth`, `/ui`, `/utils`, and `/router` remain available as zero-breaking-change re-export shims.

---

## 🚀 Quick Start

```bash
npm install @comify.art/thuli
```

```tsx
import React from 'react';
import { formatCompactCurrency } from '@comify.art/thuli/core';
import { MetricStrip, Alert, Modal } from '@comify.art/thuli/ui/primitives';
import { Navbar, Footer } from '@comify.art/thuli/ui/layout';
import '@comify.art/thuli/style.css';

export function ExecutiveView() {
  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-white">
      <Navbar brandName="Acme Portal" />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <Alert variant="info" title="System Ready">
          Thuli 2.0 dark-first tokens are active.
        </Alert>
        <MetricStrip
          items={[
            { label: 'Total Volume', value: formatCompactCurrency(250000, 'USD'), color: 'emerald' },
            { label: 'Active Users', value: '1,420', color: 'blue' },
          ]}
        />
      </main>
      <Footer brandName="Acme Corporation" />
    </div>
  );
}
```
