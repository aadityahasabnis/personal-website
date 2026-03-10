# Infrastructure Layer — Core Foundation

This document outlines the core infrastructure layer of the personal website project. This foundation supports all server actions, models, and business logic.

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Database Connection Layer](#database-connection-layer)
4. [Authentication System](#authentication-system)
5. [Middleware / Proxy](#middleware--proxy)
6. [Shared Utilities](#shared-utilities)
7. [Usage Guidelines](#usage-guidelines)

---

## Overview

The infrastructure layer provides:

- **Centralized environment variable management** — single source of truth for all configuration
- **Robust database connections** — both MongoDB native and Mongoose with connection caching
- **Admin authentication** — NextAuth v5 with credentials provider
- **Request middleware** — security headers, caching, and path metadata
- **Shared utilities** — reusable helpers for database operations, validation, and serialization

---

## Environment Configuration

### File: `src/env.ts`

**Purpose:** Centralized, type-safe access to all environment variables.

**Rules:**

- **Never** import `process.env` directly in other files
- **Always** import from `src/env.ts`
- All environment variables must be declared and validated here

**Available Variables:**

| Variable                | Required | Description                 |
| ----------------------- | -------- | --------------------------- |
| `MONGODB_URI`           | Yes      | MongoDB connection string   |
| `CDN_SECRET`            | Yes      | Content delivery API secret |
| `CLOUDINARY_CLOUD_NAME` | No       | Cloudinary cloud name       |
| `CLOUDINARY_API_KEY`    | No       | Cloudinary API key          |
| `CLOUDINARY_API_SECRET` | No       | Cloudinary API secret       |

**Usage:**

```ts
import { env, validateEnv, isCloudinaryConfigured } from '@/env';

// Access environment variables
const mongoUri = env.MONGODB_URI;

// Check if in production
if (env.IS_PRODUCTION) {
    // production-only logic
}

// Validate all required env vars (call once at startup)
validateEnv();

// Check if Cloudinary is configured
if (isCloudinaryConfigured()) {
    // use Cloudinary
}
```

---

## Database Connection Layer

### Files:

- `src/lib/db/connect.ts` — MongoDB native client
- `src/lib/db/mongoose.ts` — Mongoose connection
- `src/lib/db/client.ts` — Client promise for NextAuth
- `src/lib/db/utils.ts` — Database utilities
- `src/lib/db/index.ts` — Centralized exports

### MongoDB Native Client

**Connection caching:** Uses a global singleton to prevent multiple connections during hot reloads or serverless execution.

**Usage:**

```ts
import { connectDB, getCollection } from '@/lib/db';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IContent } from '@/interfaces/schema';

// Get database instance
const db = await connectDB();

// Get a typed collection
const contents = await getCollection<IContent>(COLLECTIONS.contents);
const article = await contents.findOne({ slug: 'my-article' });
```

### Mongoose Connection

**Usage:**

```ts
import { connectMongoose } from '@/lib/db';
import { Content } from '@/server/models';

// Ensure connection before using models
await connectMongoose();

// Use Mongoose models
const article = await Content.findOne({ slug: 'my-article' });
```

### Database Utilities

```ts
import { toObjectId, successResponse, errorResponse, notFoundResponse, validationErrorResponse, safeDatabaseOperation, normalizePagination, buildSearchQuery } from '@/lib/db/utils';

// Convert string to ObjectId
const id = toObjectId('507f1f77bcf86cd799439011');

// API response helpers
const response = successResponse(data, { count: 10 });
const error = errorResponse('Something went wrong', 500);

// Safe operation wrapper
const result = await safeDatabaseOperation(async () => {
    // database operation
    return data;
}, 'Failed to fetch data');

// Pagination
const { page, limit, skip } = normalizePagination(1, 10);

// Search query builder
const searchQuery = buildSearchQuery('keyword', ['title', 'description']);
```

---

## Authentication System

### File: `src/lib/auth/index.ts`

**Provider:** NextAuth v5 with credentials provider  
**Adapter:** MongoDB adapter for session storage  
**Strategy:** JWT-based sessions  
**Protection:** Admin routes are protected in the layout (not middleware)

**Exports:**

```ts
import { auth, signIn, signOut, handlers } from '@/lib/auth';

// Get current session (Server Component)
const session = await auth();
if (!session) {
    // not authenticated
}

// Sign in (Server Action)
await signIn('credentials', { email, password });

// Sign out
await signOut();

// API route handlers (for NextAuth endpoints)
export { handlers as GET, handlers as POST };
```

**Session Type:**

```ts
interface Session {
    user: {
        id: string;
        email: string;
        name: string;
        image: string | null;
    };
}
```

**Admin Model:**

Authentication validates against the `admins` collection using the `IAdmin` interface.

---

## Middleware / Proxy

### File: `src/proxy.ts`

**Purpose:** Request processing for both public and admin routes.

**Responsibilities:**

- Security headers (XSS, frame options, content type)
- Cache control (aggressive for static assets, none for admin)
- Path metadata for server actions

**Headers Added:**

| Header                   | Value                             | Purpose               |
| ------------------------ | --------------------------------- | --------------------- |
| `X-Content-Type-Options` | `nosniff`                         | Prevent MIME sniffing |
| `X-Frame-Options`        | `DENY`                            | Prevent clickjacking  |
| `X-XSS-Protection`       | `1; mode=block`                   | Enable XSS protection |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` | Control referrer      |
| `x-pathname`             | Current pathname                  | For server actions    |

**Cache Rules:**

- Static assets (`/images/`, `/fonts/`, `/_next/static/`): 1 year immutable cache
- Admin routes (`/admin`): no caching
- Other routes: default Next.js behavior

---

## Shared Utilities

### File: `src/lib/utils.ts`

**Categories:**

#### Styling

- `cn()` — Merge Tailwind classes with clsx

#### Date & Time

- `formatDate()` — Format date for display
- `formatRelativeTime()` — "2 days ago" format

#### String

- `slugify()` — Convert text to URL-safe slug
- `calculateReadingTime()` — Estimate reading time
- `formatNumber()` — Format with K/M suffix
- `truncate()` — Truncate text with ellipsis

#### Function

- `debounce()` — Debounce function calls
- `throttle()` — Throttle function execution

#### Validation

- `isValidEmail()` — Validate email format
- `isValidUrl()` — Validate URL format
- `isValidSlug()` — Validate slug format

#### MongoDB Serialization

- `serializeDocument()` — Convert ObjectId and Date to strings
- `serializeDocuments()` — Serialize array of documents

#### Error Handling

- `getErrorMessage()` — Extract user-friendly error message
- `logError()` — Log error with context (server-side)

**Usage:**

```ts
import { cn, formatDate, slugify, serializeDocument } from '@/lib/utils';

// Merge CSS classes
const className = cn('base-class', { active: isActive });

// Format date
const dateStr = formatDate(new Date());

// Create slug
const slug = slugify('My Article Title'); // => 'my-article-title'

// Serialize MongoDB document for client component
const serialized = serializeDocument(dbDocument);
```

---

## Usage Guidelines

### 1. Environment Variables

✅ **DO:**

```ts
import { env } from '@/env';
const mongoUri = env.MONGODB_URI;
```

❌ **DON'T:**

```ts
const mongoUri = process.env.MONGODB_URI;
```

### 2. Database Operations

✅ **DO:**

```ts
import { getCollection } from '@/lib/db';
import { COLLECTIONS } from '@/constants/siteConstants';

const collection = await getCollection(COLLECTIONS.contents);
```

❌ **DON'T:**

```ts
const collection = db.collection('contents'); // hardcoded string
```

### 3. API Responses

✅ **DO:**

```ts
import { successResponse, errorResponse } from '@/lib/db/utils';

return successResponse(data, { count: 10 });
```

❌ **DON'T:**

```ts
return { success: true, data }; // inconsistent structure
```

### 4. Serialization for Client Components

✅ **DO:**

```ts
import { serializeDocument } from '@/lib/utils';

export default async function Page() {
  const doc = await collection.findOne({ slug });
  return <ClientComponent data={serializeDocument(doc)} />;
}
```

❌ **DON'T:**

```ts
// Pass raw MongoDB document — will crash with ObjectId
return <ClientComponent data={doc} />;
```

### 5. Authentication

✅ **DO:**

```ts
import { auth } from '@/lib/auth';

export default async function AdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');
    // ...
}
```

❌ **DON'T:**

```ts
// Don't check auth in middleware (MongoDB can't run in edge)
```

---

## Next Steps

The infrastructure layer is now complete. You can now build:

1. **Server Actions** — Use the database utilities and connection helpers
2. **API Routes** — Use response helpers and error handling
3. **Models** — Mongoose models already configured
4. **Business Logic** — Build on this solid foundation

All infrastructure is production-ready, type-safe, and follows best practices.

---

## Troubleshooting

### TypeScript can't find `@/lib/db/client`

**Solution:** Restart TypeScript server in VS Code:

- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### MongoDB connection pooling warnings

**Solution:** The connection layer already implements proper pooling and caching. If you see warnings, ensure only one `connectDB()` or `connectMongoose()` call happens per request.

### Session type errors

**Solution:** The session types are extended in `src/lib/auth/index.ts`. Import the `auth` helper directly to get proper types.

---

**End of Infrastructure Layer Documentation**
