# `@comify.art/thuli` Sample Applications

This directory hosts a **dual sample application harness** verifying both legacy v1 backwards compatibility and the Thuli 2.0 4-container architecture.

## 1. `v1-classic-starter` (v1 Compatibility Harness)

- **Purpose**: Continuous backwards-compatibility regression testing for `@comify.art/thuli` v1 subpath imports (`/layout`, `/ui`, `/utils`) against the Thuli 2.0 release tarball.
- **Run locally**:
  ```bash
  cd samples/v1-classic-starter
  npm install
  npm run dev
  ```
- **Verify production build**:
  ```bash
  npm run build
  ```

## 2. `v2-modern-portal` (v2 Architecture Showcase)

- **Purpose**: Interactive multi-tab executive portal built with Vite, React 19, and Tailwind CSS v4 demonstrating all 4 canonical containers:
  1. **Executive Dashboard**: `MetricStrip`, `ProgressMeter`, `Alert`, `Drawer`, `formatCompactCurrency`.
  2. **Data Table & CSV**: Generic `DataTable<T>`, `StatusBadge`, and RFC 4180 `downloadCsvFile`.
  3. **Dialogs & Forms**: `FormField` suite, dark-first `Modal`, `ConfirmationModal`, and `CopyButton`.
  4. **Headless Integrations**: RFC 5545 `.ics` calendar export, Google Calendar deep links, `WhatsAppSyndicateCard`, and `WhatsAppBroadcastConsole`.
  5. **Turnkey Features**: `AccessGateCard`, `DocumentViewer`, and `UserProfileMenu`.
- **Run locally**:
  ```bash
  cd samples/v2-modern-portal
  npm install
  npm run dev
  ```
- **Verify production build**:
  ```bash
  npm run build
  ```
