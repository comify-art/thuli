# Firebase Backend Setup Guide

`@comify.art/thuli` provides ready-to-use services and UI components that integrate seamlessly with Google Firebase. Host applications provide their own Firebase app instance, ensuring no hardcoded keys or project assumptions exist in the library.

---

## 1. Firebase Project Initialization

### 1.1 Host App Initialization
Initialize Firebase in your application using the standard Firebase Web SDK (v10+):

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
```

### 1.2 Instantiating Thuli Services
Instantiate the desired service classes with your database and storage instances:

```typescript
// src/services/index.ts
import { db, storage } from '../config/firebase';
import { BlogAdminService, MediaService, BookService } from '@comify.art/thuli/services';

export const mediaService = new MediaService(db, storage);
export const blogService = new BlogAdminService(db);
export const bookService = new BookService(db);
```

---

## 2. Cloud Firestore Collections

Thuli services manage the following Firestore collections:

| Collection | Service | Purpose |
| :--- | :--- | :--- |
| `blog_posts` | `BlogAdminService` | Article documents, drafts, published revisions, metadata, and tags |
| `media` | `MediaService` | Uploaded image records, dimensions, thumbnail status, and Storage paths |
| `books` | `BookService` | Literature collections, authors, metadata, and chapter indices |
| `chapters` | `ChapterService` | Chapter headings, sequence ordering, and descriptions |
| `verses` | `VerseService` | Verse content, line breaks, commentaries, and translations |
| `metrics` | Tracker Service | Tracked activity definitions and configurations |
| `metric_entries` | Tracker Service | Daily or periodic user logging entries |

### 2.1 Recommended Firestore Security Rules
Below is a secure baseline rules template:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper to check if user is authenticated admin
    function isAdmin() {
      return request.auth != null; // Refine with custom claims or email checks
    }

    // Public read for published blog posts; admin write
    match /blog_posts/{postId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    // Media metadata read publicly; admin write
    match /media/{mediaId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Verse-books collections: public read; admin write
    match /books/{bookId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /chapters/{chapterId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /verses/{verseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Tracker entries: user-specific
    match /metric_entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 3. Firebase Cloud Storage & CORS Configuration

### 3.1 Storage Paths
`MediaService` organizes media assets into two primary storage directories:
- `media/`: Original high-resolution image uploads.
- `media/thumbnails/`: 192px client-side canvas-generated thumbnails.

### 3.2 Recommended Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /media/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3.3 Storage CORS Configuration (Critical for Thumbnails)
Because `MediaService` uses the HTML5 Canvas API in the browser to generate thumbnails from original images, Firebase Cloud Storage **must** allow Cross-Origin Resource Sharing (CORS). Without CORS, the browser taints the canvas and blocks thumbnail generation.

Create a `cors.json` file in your host application:

```json
[
  {
    "origin": ["http://localhost:5173", "https://yourdomain.com"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "x-goog-resumable"]
  }
]
```

Apply the CORS configuration to your bucket using Google Cloud CLI:
```bash
gcloud storage buckets update gs://<your-project-id>.firebasestorage.app --cors-file=cors.json
```
*(Or with gsutil: `gsutil cors set cors.json gs://<your-project-id>.firebasestorage.app`)*

---

## 4. Authentication Configuration

`@comify.art/thuli/auth` provides `<AdminGate>` and `useAdminGate` for protecting administrative routes.

1. **Enable Authentication Provider**:
   - In [Firebase Console](https://console.firebase.google.com/), navigate to **Authentication** > **Sign-in method**.
   - Enable **Google** (or your chosen provider).
   - Ensure `localhost` and your production domain are added to **Authorized domains**.
2. **Usage with AdminGate**:
   ```tsx
   import { AdminGate } from '@comify.art/thuli/auth';
   import { BlogEditor } from '@comify.art/thuli/blog';

   export function AdminPage() {
     return (
       <AdminGate allowedEmails={['admin@yourdomain.com']}>
         <BlogEditor 
           mediaService={mediaService} 
           blogService={blogService} 
           onClose={() => {}} 
         />
       </AdminGate>
     );
   }
   ```
