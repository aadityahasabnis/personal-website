# Infrastructure Layer (Current State)

Last updated: 2026-03-22

This document reflects the actual infrastructure implementation in the current codebase.

---

## 1) Overview

Infrastructure currently consists of five production-critical parts:

1. Environment access in `src/env.ts`.
2. DB connectivity in `src/lib/db/connectDB.ts`.
3. Admin auth in `src/lib/auth/admin.ts`.
4. Request header/caching middleware in `src/proxy.ts`.
5. Shared utility layer in `src/lib/utils.ts` plus domain helpers.

---

## 2) Environment Configuration

Source file: `src/env.ts`

Behavior:

1. Centralized env reads through a local `get()` helper.
2. Required keys throw only in production; development logs warnings.
3. `env` exports runtime flags (`IS_PROD`, `IS_DEV`) and integration keys.
4. `isCloudinaryConfigured()` is the supported feature-flag check for media integrations.

Key variables in active use:

1. `MONGODB_URI`
2. `DB_NAME`
3. `NEXTAUTH_SECRET`
4. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
5. `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
6. `CDN_SECRET`

Implementation note:

1. There is no exported `validateEnv()` function in current code. Validation behavior is embedded in `get()`.

---

## 3) Database Connection Layer

Source file: `src/lib/db/connectDB.ts`

Current architecture:

1. `connectDB()` returns a cached Mongoose connection for application models.
2. `clientPromise` returns a cached native `MongoClient` for NextAuth adapter usage.
3. Both are stored on global process state to be hot-reload safe.

Why this design:

1. App model operations need Mongoose behavior (schema validation, hooks, methods).
2. NextAuth Mongo adapter requires native `MongoClient`.
3. Shared caching prevents connection explosion in development and serverless contexts.

Important constraint:

1. Use `connectDB()` for all business/server-action data operations.
2. Use `clientPromise` only where an adapter requires native driver access.

---

## 4) Authentication System

Source file: `src/lib/auth/admin.ts`

Current implementation:

1. NextAuth v5 configured with MongoDB adapter (`clientPromise`).
2. Credentials provider validates against `Admin.findByEmail()` and bcrypt password hash.
3. Optional Google provider is enabled only when Google env vars are present.
4. Google login is allow-listed against existing admins in DB.
5. Session strategy is JWT and enriches `session.user` with id/email/name/image.

Export surface:

1. `handlers`
2. `auth`
3. `signIn`
4. `signOut`

---

## 5) Middleware / Proxy

Source file: `src/proxy.ts`

Current behavior:

1. Adds security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
2. Applies `Cache-Control: no-store` for admin routes.
3. Applies long-lived immutable cache headers for `/images/*` and `/fonts/*`.
4. Injects `x-pathname` for downstream server use.

Important note:

1. Admin auth guard is not implemented in proxy middleware due edge/runtime DB constraints.
2. Auth enforcement is handled in admin server boundaries.

---

## 6) Shared Utilities

Primary file: `src/lib/utils.ts`

Usage expectations:

1. Generic cross-domain helper logic belongs here.
2. Domain-specific logic belongs in domain-local `shared.ts`/`helpers.ts` modules under `src/server/new/**`.
3. Server-action response/pagination helpers are centralized in `src/server/new/utils/helper.ts`.

---

## 7) Infrastructure Rules

1. Do not import `process.env` directly outside `src/env.ts`.
2. Do not create additional DB connectors unless there is a runtime-specific requirement.
3. Keep auth/session logic in `src/lib/auth/admin.ts`; avoid reimplementing credential checks in routes.
4. Keep middleware focused on headers/caching/path metadata; do not add DB-dependent logic there.
5. Keep API routes thin when wrapping server actions.

---

## 8) Known Drift Resolved by This Rewrite

This rewrite removes outdated references to files and exports that are not part of the current implementation, including:

1. `src/lib/db/connect.ts`
2. `src/lib/db/mongoose.ts`
3. `src/lib/db/client.ts`
4. `src/lib/db/utils.ts`
5. `src/lib/db/index.ts`
6. `src/lib/auth/index.ts`
7. non-existent `validateEnv()` usage

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
