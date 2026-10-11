# Google Analytics & Tracking Setup Guide

`@comify.art/thuli` provides page view tracking, metadata coordination, and activity tracking utilities designed to integrate cleanly with **Google Analytics (Firebase Analytics)** or any custom analytics provider.

---

## 1. Firebase Analytics Setup

### 1.1 Initialization
Initialize Firebase Analytics in your application's Firebase configuration:

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

export const app = initializeApp(firebaseConfig);

// Initialize analytics safely (supported only in browser environments)
export const analyticsPromise = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
```

### 1.2 Environment Variables
Add your Google Measurement ID to your `.env` file:

```env
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 2. Automatic Page View Tracking

`@comify.art/thuli/layout` provides built-in hooks for routing analytics:

### Using with `<AppShell>`
`AppShell` accepts an `onPageView` callback that fires whenever a route transition completes:

```tsx
import { AppShell } from '@comify.art/thuli/layout';
import { analyticsPromise } from './config/firebase';
import { logEvent } from 'firebase/analytics';

export function RootApp() {
  const handlePageView = async (path: string, title: string) => {
    const analytics = await analyticsPromise;
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_path: path,
        page_title: title,
      });
    }
  };

  return (
    <AppShell
      routes={appRoutes}
      navbar={navbarConfig}
      footer={footerConfig}
      auth={authConfig}
      onPageView={handlePageView}
    />
  );
}
```

### Using with `<PageMeta>`
If managing routes independently, use `PageMeta` directly on each page component to dynamically update document title, OpenGraph tags, and emit tracking events:

```tsx
import { PageMeta } from '@comify.art/thuli/layout';

export function ArticlePage({ post }) {
  return (
    <PageMeta
      title={post.title}
      description={post.description}
      image={post.coverImageUrl}
      onPageView={(path, title) => {
        // Log custom page view
      }}
    >
      <article>...</article>
    </PageMeta>
  );
}
```

---

## 3. Habit & Activity Tracker System (`@comify.art/thuli/tracker`)

The tracker module provides custom activity logging, trends, and daily habits:

```tsx
import { TrackerApp } from '@comify.art/thuli/tracker';

export function TrackerPage() {
  return (
    <div className="container mx-auto py-8">
      <TrackerApp />
    </div>
  );
}
```

### Custom Event Logging Pattern
When users complete activities or articles, you can track custom business metrics:

```typescript
import { analyticsPromise } from './config/firebase';
import { logEvent } from 'firebase/analytics';

export const trackArticleRead = async (slug: string, readDurationSec: number) => {
  const analytics = await analyticsPromise;
  if (analytics) {
    logEvent(analytics, 'article_read_complete', {
      article_slug: slug,
      duration: readDurationSec,
    });
  }
};
```
