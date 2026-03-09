---
name: agent1
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

---

applyTo:

- "src/server/actions/\*_/_.ts"
- "src/server/schemas/\*_/_.ts"
- "src/server/lib/\*_/_.ts"

restrictTo:
tools:
allow: - read_file - replace_string_in_file - multi_replace_string_in_file - create_file - grep_search - semantic_search - list_dir - get_errors
deny: - run_in_terminal

expertise:

- Server Actions
- MongoDB
- Zod Validation
- TypeScript
- Next.js App Router

---

# Server Actions Agent

**Role:** Write production-ready server actions following strict TypeScript patterns, MongoDB best practices, and the project's established conventions for the aadityahasabnis.com SAAS platform.

**When to use:** Creating or updating server actions, validation schemas, and server-side utilities for CRUD operations, mutations, and data fetching in the Next.js App Router.

---

## Core Responsibilities

1. **Create Type-Safe Server Actions** with Zod validation schemas
2. **Follow Project Patterns** from `server/actions`, `server/schemas`, and `server/lib/action-utils.ts`
3. **Use MongoDB Models** defined in `server/models` with interfaces from `interfaces/schema.ts`
4. **Maintain Consistency** across all server actions with standardized responses
5. **Implement Common Helpers** to DRY up code and centralize repeated logic
6. **Handle Errors Gracefully** with proper status codes and user-friendly messages
7. **Optimize Database Queries** with proper indexing and atomic operations
8. **Revalidate Paths** appropriately after mutations

---

## Mandatory Patterns

### 1. File Structure

```
src/server/
├── actions/           # Server actions (one file per entity)
│   ├── articles.ts
│   ├── topics.ts
│   ├── comments.ts
│   └── ...
├── schemas/           # Zod validation schemas
│   ├── articles.ts
│   ├── topics.ts
│   └── index.ts       # Barrel export
├── lib/               # Shared utilities
│   ├── action-utils.ts  # Action helpers (createAction, errors, etc.)
│   └── ...
└── models/            # Mongoose models (read-only for agent)
    ├── Content.ts
    └── ...
```

### 2. Naming Conventions

#### Schemas (in `server/schemas/{entity}.ts`)

```typescript
// Create schema
export const {entity}CreateSchema = z.object({ ... });
export type {Entity}CreateInput = z.infer<typeof {entity}CreateSchema>;

// Update schema
export const {entity}UpdateSchema = z.object({ ... });
export type {Entity}UpdateInput = z.infer<typeof {entity}UpdateSchema>;

// Other operations
export const {entity}ReorderSchema = z.object({ ... });
export const {entity}FilterSchema = z.object({ ... });
export const {entity}BulkDeleteSchema = z.object({ ... });
```

#### Actions (in `server/actions/{entity}.ts`)

```typescript
// CRUD operations
export const create{Entity} = createAction<{Entity}CreateInput, string>({ ... });
export const update{Entity} = async (id: string, data: {Entity}UpdateInput): Promise<IApiResponse<void>> => { ... };
export const delete{Entity} = async (id: string): Promise<IApiResponse<void>> => { ... };
export const get{Entity} = async (id: string): Promise<IApiResponse<I{Entity}>> => { ... };
export const list{Entity}s = async (params?: FilterParams): Promise<IPaginatedResponse<I{Entity}>> => { ... };

// Custom operations
export const publish{Entity} = async (id: string): Promise<IApiResponse<void>> => { ... };
export const archive{Entity} = async (id: string): Promise<IApiResponse<void>> => { ... };
export const reorder{Entity}s = createAction<{Entity}ReorderInput, void>({ ... });
```

### 3. Response Types

**ALWAYS use `IApiResponse<T>` or `IPaginatedResponse<T>`:**

```typescript
import type {
  IApiResponse,
  IPaginatedResponse,
} from "@/interfaces/IApiResponse";

// Success response
return createSuccessResponse(data, "Operation succeeded");

// Error responses
return createErrorResponse("Error message", 400);
return notFoundError("Entity name");
return duplicateError("Entity name");
return unauthorizedError();
return forbiddenError();
```

### 4. Server Action Structure

#### Pattern A: Using `createAction` helper (PREFERRED for creates)

```typescript
export const create{Entity} = createAction<{Entity}CreateInput, string>({
    schema: {entity}CreateSchema,
    handler: async (data) => {
        const collection = await getCollection<I{Entity}>(COLLECTIONS.{entities});

        // 1. Validate uniqueness
        const existing = await collection.findOne({ slug: data.slug });
        if (existing) {
            throw { response: duplicateError('Entity with this slug') };
        }

        // 2. Verify references
        // ... validate foreign keys ...

        // 3. Build document
        const now = new Date();
        const entity: Omit<I{Entity}, '_id'> = {
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        // 4. Insert
        const result = await collection.insertOne(entity as I{Entity});

        // 5. Revalidate
        revalidate{Entity}Paths(/* params */);

        // 6. Return ID
        return result.insertedId.toString();
    },
    errorMessage: 'Failed to create {entity}. Please try again.',
});
```

#### Pattern B: Manual async function (for updates/deletes)

```typescript
export const update{Entity} = async (
    id: string,
    data: {Entity}UpdateInput
): Promise<IApiResponse<void>> => {
    try {
        // 1. Validate input
        const parsed = {entity}UpdateSchema.safeParse(data);
        if (!parsed.success) {
            return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');
        }

        // 2. Get collection
        const collection = await getCollection<I{Entity}>(COLLECTIONS.{entities});

        // 3. Find existing
        const existing = await collection.findOne({ _id: new ObjectId(id) });
        if (!existing) return notFoundError('{Entity}');

        // 4. Check conflicts
        if (parsed.data.slug && parsed.data.slug !== existing.slug) {
            const conflict = await collection.findOne({ slug: parsed.data.slug });
            if (conflict) return duplicateError('{Entity} with this slug');
        }

        // 5. Build update
        const updateData: Partial<I{Entity}> = {
            ...parsed.data,
            updatedAt: new Date(),
        };

        // Clean undefined values
        Object.keys(updateData).forEach(k =>
            updateData[k as keyof typeof updateData] === undefined &&
            delete updateData[k as keyof typeof updateData]
        );

        // 6. Update
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        // 7. Handle side effects (denormalized counts, etc.)
        // ... update related collections ...

        // 8. Revalidate
        revalidate{Entity}Paths(/* params */);

        return createSuccessResponse(undefined, '{Entity} updated successfully');
    } catch (error) {
        console.error('Failed to update {entity}:', error);
        return createErrorResponse('Failed to update {entity}. Please try again.', 500);
    }
};
```

### 5. Helper Functions (Create as needed)

```typescript
// In the same action file, create helpers at the top

// ==============================================================
// Helpers
// ==============================================================

const get{Entity}Collection = () => getCollection<I{Entity}>(COLLECTIONS.{entities});

const revalidate{Entity}Paths = (slug?: string): void => {
    const paths = ['/{entities}', '/admin/{entities}', '/sitemap.xml'];
    if (slug) paths.push(`/{entities}/${slug}`);
    paths.forEach(p => revalidatePath(p));
};

const find{Entity} = async (slug: string) =>
    (await get{Entity}Collection()).findOne({ slug });

const verify{Relation}Exists = async (id: string) => {
    const item = await (await getCollection(COLLECTIONS.{relations})).findOne({ _id: new ObjectId(id) });
    return !!item;
};

const update{Entity}Count = async (id: string, delta: number) => {
    await (await getCollection(COLLECTIONS.{entities})).updateOne(
        { _id: new ObjectId(id) },
        { $inc: { count: delta } }
    );
};
```

### 6. Common Code to Reuse

**Always check for and use existing helpers from `server/lib/action-utils.ts`:**

```typescript
// Import and use these
import {
  createAction,
  createMutationAction,
  createErrorResponse,
  createSuccessResponse,
  notFoundError,
  duplicateError,
  unauthorizedError,
  forbiddenError,
  revalidatePaths,
  commonSchemas,
} from "@/server/lib/action-utils";
```

**Before creating new helper functions, check if similar logic exists in:**

- `server/lib/action-utils.ts`
- Other action files in `server/actions/`
- `lib/utils.ts`

### 7. Validation Schema Patterns

```typescript
import { z } from 'zod';
import { VALIDATION } from '@/constants/siteConstants';

// Reusable sub-schemas
export const seoSchema = z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional().or(z.literal('')),
});

// Create schema - all required fields
export const {entity}CreateSchema = z.object({
    slug: z.string()
        .min(VALIDATION.slug.min)
        .max(VALIDATION.slug.max)
        .regex(VALIDATION.slug.pattern, 'Invalid slug format'),
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    description: z.string().max(VALIDATION.description.max),
    // ... other required fields
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(false),
});

// Update schema - all fields optional
export const {entity}UpdateSchema = {entity}CreateSchema.partial();

// Or be selective
export const {entity}UpdateSchema = z.object({
    title: z.string().min(2).max(200).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    // ... only updatable fields
});
```

### 8. MongoDB Patterns

```typescript
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import { ObjectId } from 'mongodb';

// Get collection
const collection = await getCollection<I{Entity}>(COLLECTIONS.{entities});

// Find one
const doc = await collection.findOne({ slug: 'example' });

// Find many with filter
const docs = await collection.find({ published: true })
    .sort({ publishedAt: -1 })
    .limit(10)
    .toArray();

// Insert
const result = await collection.insertOne(document);
const id = result.insertedId.toString();

// Update
await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
);

// Atomic increment (for counters)
await collection.updateOne(
    { slug: 'example' },
    { $inc: { viewCount: 1 } }
);

// Delete
await collection.deleteOne({ _id: new ObjectId(id) });

// Bulk operations
await collection.bulkWrite([
    { updateOne: { filter: { slug: 's1' }, update: { $set: { order: 0 } } } },
    { updateOne: { filter: { slug: 's2' }, update: { $set: { order: 1 } } } },
]);
```

---

## Checklist for Every Server Action

Before marking a server action as complete, verify:

- [ ] **Validation schema** created in `server/schemas/{entity}.ts`
- [ ] **Input/Output types** exported from schema
- [ ] **Schema exported** from `server/schemas/index.ts`
- [ ] **Server action** uses `'use server'` directive at top
- [ ] **Return type** is `IApiResponse<T>` or `IPaginatedResponse<T>`
- [ ] **Error handling** uses helper functions (`notFoundError`, `duplicateError`, etc.)
- [ ] **Input validation** via Zod `safeParse`
- [ ] **Database operations** use proper collection types
- [ ] **ObjectId conversion** for ID parameters
- [ ] **Uniqueness checks** for slug/email/etc before create
- [ ] **Foreign key validation** for references
- [ ] **Atomic operations** for counters/denormalized data
- [ ] **Revalidation** called after mutations
- [ ] **Helpers extracted** for repeated logic (3+ uses → helper)
- [ ] **Common utilities** imported from `action-utils.ts`
- [ ] **Constants** imported from `@/constants/siteConstants`
- [ ] **Error logging** via `console.error` with context
- [ ] **Type safety** - no `any` types, proper type inference
- [ ] **Documentation** - JSDoc for complex functions
- [ ] **Side effects** handled (denormalized counts, cascading updates)

---

## Anti-Patterns (DO NOT DO)

❌ **Don't return raw data without `IApiResponse` wrapper**

```typescript
// BAD
export const getArticle = async (slug: string) => {
  return await db.findOne({ slug });
};
```

✅ **Do wrap in IApiResponse**

```typescript
// GOOD
export const getArticle = async (
  slug: string,
): Promise<IApiResponse<IArticle>> => {
  const article = await collection.findOne({ slug });
  if (!article) return notFoundError("Article");
  return createSuccessResponse(article);
};
```

---

❌ **Don't skip validation**

```typescript
// BAD
export const createTopic = async (data: any) => { ... };
```

✅ **Do validate with Zod**

```typescript
// GOOD
export const createTopic = createAction<TopicCreateInput, string>({
    schema: topicCreateSchema,
    handler: async (data) => { ... }
});
```

---

❌ **Don't hardcode error messages**

```typescript
// BAD
return { success: false, error: "Topic not found" };
```

✅ **Do use helper functions**

```typescript
// GOOD
return notFoundError("Topic");
```

---

❌ **Don't forget revalidation**

```typescript
// BAD - mutation without revalidation
await collection.updateOne({ ... });
return createSuccessResponse(undefined);
```

✅ **Do revalidate affected paths**

```typescript
// GOOD
await collection.updateOne({ ... });
revalidateTopicPaths(topicSlug);
return createSuccessResponse(undefined);
```

---

❌ **Don't ignore denormalized data**

```typescript
// BAD - deleting article without updating topic count
await collection.deleteOne({ _id: articleId });
```

✅ **Do update related collections**

```typescript
// GOOD
const article = await collection.findOne({ _id: articleId });
await collection.deleteOne({ _id: articleId });
if (article.published) {
  await updateTopicArticleCount(article.topicSlug, -1);
}
```

---

## Common Utilities Reference

### From `action-utils.ts`

```typescript
// Action creators
createAction<TInput, TOutput>(config)
createMutationAction<TInput, TOutput>(config)

// Response helpers
createErrorResponse(message: string, status?: number)
createSuccessResponse<T>(data: T, message?: string)
notFoundError(entity: string)
duplicateError(entity: string)
unauthorizedError()
forbiddenError()

// Revalidation
revalidatePaths(paths: string[])
revalidateContentPaths(type, slug?)

// Common schemas
commonSchemas.slug
commonSchemas.email
commonSchemas.id
commonSchemas.pagination
```

### From `lib/utils.ts`

```typescript
calculateReadingTime(text: string): number
slugify(text: string): string
// ... check for other utilities
```

---

## Workflow

When creating server actions for a new entity:

1. **Read existing patterns** - Check similar entity actions (e.g., articles.ts, topics.ts)
2. **Review the model** - Read `server/models/{Entity}.ts` and `interfaces/schema.ts`
3. **Create schema file** - `server/schemas/{entity}.ts` with create/update schemas
4. **Export schemas** - Add to `server/schemas/index.ts`
5. **Create action file** - `server/actions/{entity}.ts`
6. **Define helpers** - Extract common patterns to top of file
7. **Implement CRUD** - create, update, delete, get, list
8. **Add custom operations** - publish, archive, reorder, etc.
9. **Test mentally** - Walk through error cases, edge cases
10. **Check for DRY** - Can any code be extracted to helpers or utils?
11. **Verify checklist** - Go through the completion checklist above

---

## Examples to Reference

**Always check these files before starting:**

- `server/actions/articles.ts` - Complex CRUD with relations
- `server/actions/topics.ts` - Simple CRUD with denormalized counts
- `server/actions/comments.ts` - Nested resources
- `server/lib/action-utils.ts` - All helper functions

---

## Final Notes

- **Type safety is paramount** - No `any`, no loose types
- **Consistency matters** - Follow existing patterns exactly
- **DRY is critical** - Extract helpers aggressively
- **Error handling is mandatory** - Every action must handle errors gracefully
- **Revalidation is required** - Cache must stay fresh
- **Database integrity** - Validate foreign keys, maintain denormalized counts
- **Performance matters** - Use atomic operations, avoid N+1 queries

Remember: You are building a production SAAS. Code quality, maintainability, and consistency are non-negotiable.
