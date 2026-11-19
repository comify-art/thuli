# Module Reference (`@comify.art/thuli` v2.0)

## Container 1: Core (`@comify.art/thuli/core`)

- **Tokens**: `THULI_TOKENS`, `THEME_TOKENS`
- **Currency**: `formatCurrency(amount, currency)`, `formatCompactCurrency(amount, currency)`, `convertCurrency(amount, from, to, rate?)`, `formatBlendedTotal(usd, inr, rate?)`
- **CSV (RFC 4180)**: `formatCsvCell(value)`, `buildCsvContent(headers, rows)`, `downloadCsvFile(filename, headers, rows)`, `copyCsvToClipboard(headers, rows)`
- **Phone (E.164)**: `formatPhoneNumberE164(phone, defaultCountry?)`, `formatPhoneForDialer(phone)`, `formatPhoneForWhatsApp(phone)`, `normalizeToE164`, `isValidE164`, `formatDisplayPhone`
- **Cookies**: `sessionCookie` (`get`, `set`, `remove`, `hasActiveSession`), `getEffectiveCookieDomain(hostname?, rootDomain?)`, `SESSION_COOKIE_NAME` (`'app_session'`)
- **Media & Share**: `resizeImage`, `blobToFile`, `shareContent`, `copyToClipboard`

---

## Container 2: UI (`@comify.art/thuli/ui`)

### Primitives (`@comify.art/thuli/ui/primitives`)
- `Modal` (`isOpen`, `onClose`, `title`, `subtitle?`, `icon?`, `actions?`, `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'`)
- `ConfirmationModal` (`isOpen`, `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel?`, `cancelLabel?`, `isDangerous?`, `isLoading?`)
- `Alert` (`variant?: 'info' | 'success' | 'warning' | 'error'`, `title?`, `onDismiss?`, `children`)
- `Drawer` (`isOpen`, `onClose`, `title`, `size?`, `position?: 'left' | 'right'`, `children`)
- `DataTable<T>` (`data`, `columns`, `sortKey?`, `sortDirection?`, `onSort?`, `searchable?`, `emptyState?`)
- `SortableHeader` (`label`, `sortKey`, `activeKey`, `direction`, `onSort`)
- `MetricStrip` (`items: MetricStripItem[]`)
- `ProgressMeter` (`value`, `max?`, `label?`, `color?`, `showPercentage?`)
- `StatusBadge` (`variant`, `label`, `pulse?`) & `getStatusBadgeVariant(status)`
- `FormField`, `TextInput`, `SelectInput`, `Textarea`, `Checkbox`, `ToggleSwitch`
- `KpiCard`, `PageHeader`, `EmptyState`, `CopyButton`
- `PaginationFooter`, `useCursorPagination`

### Feedback (`@comify.art/thuli/ui/feedback`)
- `ComingSoon` (`title`, `description?`, `badge?`, `showBackButton?`)
- `MarkdownRenderer` (`content`, `linkResolvers?`, `className?`)

### Layout (`@comify.art/thuli/ui/layout`)
- `AppShell`, `Navbar`, `Footer`, `Sidebar`, `TwoColumnLayout`, `MasterDetailLayout`, `PageMeta`

---

## Container 3: Integrations (`@comify.art/thuli/integrations`)

### Calendar (`@comify.art/thuli/integrations/calendar`)
- `generateIcsContent(event)`
- `downloadIcsFile(event, filename?)`
- `buildGoogleCalendarUrl(event)`
- `buildOutlookCalendarUrl(event)`

### WhatsApp (`@comify.art/thuli/integrations/whatsapp`)
- `formatDealGroupName(slug, prefixOrYear?, optionalPrefix?)`
- `formatWhatsAppGroupUrl(inviteCodeOrUrl?)`
- `createSyndicateCommitmentIntent(params)`
- `createBroadcastIntent(params)`
- `createDealPrepBroadcastSnippet(params)`
- `WHATSAPP_GROUPS_MANIFEST`, `getAllPresetWhatsAppGroups`, `getWhatsAppGroupByTier`, `getWhatsAppGroupById`, `resolveWhatsAppGroupName`
- `WhatsAppSyndicateCard`, `WhatsAppBroadcastConsole`

### Firebase (`@comify.art/thuli/integrations/firebase`)
- `BaseAdminService` (`getById`, `getAll`, `getAllPage`, `create`, `update`, `delete`)
- `Page<T>`, `PageCursor`

---

## Container 4: Features (`@comify.art/thuli/features`)

- **Access (`@comify.art/thuli/features/access`)**: `AdminGate`, `useAdminGate`, `PrivateRoute`, `RoleGate`, `AccessGateCard`, `UserProfileMenu`, `useAuthSession`, `LockedPitchRecordingBanner`
- **Publishing (`@comify.art/thuli/features/publishing`)**: `BlogList`, `BlogPostComponent`, `BlogMarkdownRenderer`, `AsyncImage`, `BlogAdminList`, `BlogEditor`, `BlogStatsWidget`, `OrphanedContentManager`, `OrphanedMediaManager`, `BlogMigration`, `BlogRemediation`, `MediaLibrary`, `MediaPicker`, `BlogAdminService`, `MediaService`
- **Literature (`@comify.art/thuli/features/literature`)**: `BookHome`, `BookListPublic`, `ChapterTOC`, `VersePage`, `VerseNavigator`, `BookList`, `BookEditor`, `VerseList`, `VerseEditor`, `VerseImporter`, `parsePackText`, `parsePackBatch`, `verseLinkResolver`, `BookService`, `ChapterService`, `VerseService`
- **Tracker (`@comify.art/thuli/features/tracker`)**: `TrackerApp`, `Dashboard`, `EntryForm`, `Configuration`, `MetricCard`, `TrackerService`
- **Documents (`@comify.art/thuli/features/documents`)**: `DocumentViewer`

---

## Legacy Backwards-Compatibility Shims

All v1 subpaths remain supported and forward to the canonical containers above:
- `@comify.art/thuli/layout` → `ui/layout`
- `@comify.art/thuli/ui` → `ui`
- `@comify.art/thuli/utils` → `core`
- `@comify.art/thuli/services` → `integrations/firebase` + `features/*/services`
- `@comify.art/thuli/auth` & `/router` → `features/access`
- `@comify.art/thuli/blog` → `features/publishing`
- `@comify.art/thuli/verse-books` → `features/literature`
- `@comify.art/thuli/tracker` → `features/tracker`
