# Models & Interfaces Usage Guide

How to use MongoDB models and TypeScript interfaces across server actions, server components, and client components.

---

## Quick Reference

| Layer | Imports | Data Type | Serialization |
|-------|---------|-----------|---------------|
| **Server Actions** | Models + Interfaces | Mongoose Documents | Manual (if needed) |
| **Server Components** | Queries (Models inside) | Plain Objects | `serializeDocuments()` |
| **Client Components** | Interfaces only | Serialized Objects | Auto by Next.js |

---

## 1. Server Actions (`src/server/actions/`)

Server actions directly interact with Mongoose models and use interfaces for type safety.

### Imports

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';

// Import interfaces for type safety
import type { IArticle, ITopic } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';

// Import models if using them directly
import { Content, Topic } from '@/server/models';
```

### Creating Content

```typescript
export const createArticle = async (data: ArticleInput): Promise<IApiResponse<string>> => {
    try {
        // Validate input (Zod schema)
        const parsed = articleSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.message };
        }

        // Get collection with typed interface
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        // Check duplicates
        const exists = await collection.findOne({
            type: 'article',
            slug: parsed.data.slug
        });

        if (exists) {
            return { success: false, error: 'Article already exists' };
        }

        // Create document (use interface type)
        const now = new Date();
        const article: Omit<IArticle, '_id'> = {
            type: 'article',
            ...parsed.data,
            published: false,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(article as any);

        // Revalidate paths
        revalidatePath('/articles');
        revalidatePath(`/articles/${parsed.data.topicSlug}`);

        return { success: true, data: result.insertedId.toString() };
    } catch (error) {
        console.error('Error creating article:', error);
        return { success: false, error: 'Failed to create article' };
    }
};
```

### Updating Content

```typescript
export const updateArticle = async (
    slug: string,
    data: Partial<ArticleInput>
): Promise<IApiResponse<boolean>> => {
    const collection = await getCollection<IArticle>(COLLECTIONS.content);

    const result = await collection.updateOne(
        { type: 'article', slug },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
            },
        }
    );

    if (result.matchedCount === 0) {
        return { success: false, error: 'Article not found' };
    }

    revalidatePath(`/articles/${slug}`);
    return { success: true, data: true };
};
```

### Querying with Relations

```typescript
export const getArticleWithTopic = async (slug: string) => {
    // Step 1: Get content
    const collection = await getCollection<IArticle>(COLLECTIONS.content);
    const article = await collection.findOne({ type: 'article', slug });

    if (!article) return null;

    // Step 2: Get related topic (using ObjectId!)
    const topicsCollection = await getCollection<ITopic>(COLLECTIONS.topics);
    const topic = await topicsCollection.findOne({ _id: article.topicId });

    // Return combined data
    return {
        ...article,
        topic,
    };
};
```

### Rules for Server Actions

1. **Always validate input** with Zod schemas
2. **Use `'use server'`** directive at top of file
3. **Return `IApiResponse<T>`** for consistent error handling
4. **Revalidate paths** after mutations
5. **Use ObjectId references** for relationships
6. **Handle errors gracefully** with try-catch
7. **Type collections** with interfaces: `getCollection<IArticle>()`

---

## 2. Server Components (App Router Pages)

Server components fetch data using queries (which use models internally) and serialize before passing to client components.

### Imports

```typescript
import { Suspense } from 'react';
import { getAllArticles } from '@/server/queries/articles';
import { getAllTopics } from '@/server/queries/topics';
import { serializeDocuments } from '@/lib/utils';

// Import interfaces for type hints
import type { IArticle, ITopic } from '@/interfaces/schema';
```

### Fetching & Serializing Data

```typescript
// src/app/(admin)/admin/articles/page.tsx

const ArticlesPage = async () => {
    // Fetch data (returns Mongoose documents)
    const [articles, topics] = await Promise.all([
        getAllArticles(),
        getAllTopics(),
    ]);

    // ⚠️ MUST serialize before passing to Client Component
    const serializedArticles = serializeDocuments(articles);
    const serializedTopics = serializeDocuments(topics);

    return (
        <div>
            <ArticlesTable
                articles={serializedArticles}
                topics={serializedTopics}
            />
        </div>
    );
};
```

### What `serializeDocuments()` Does

```typescript
// src/lib/utils.ts (simplified)

export function serializeDocuments<T>(docs: T[]): T[] {
    return docs.map(doc => {
        const plain = JSON.parse(JSON.stringify(doc));
        return plain;
    });
}
```


**Converts:**
- `ObjectId` → `string`
- `Date` → `string` (ISO)
- Mongoose Document → Plain Object

### Rendering Metadata

```typescript
// src/app/(public)/articles/[slug]/page.tsx

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = await getArticleBySlug(params.slug);

    if (!article) return { title: 'Not Found' };

    return {
        title: article.seo?.title || article.title,
        description: article.seo?.description || article.description,
        openGraph: {
            title: article.title,
            description: article.description,
            publishedTime: article.publishedAt?.toISOString(),    // ✅ Convert Date to string
            modifiedTime: article.updatedAt?.toISOString(),      // ✅ Convert Date to string
        },
    };
}
```

### Rules for Server Components

1. **Use queries** (`src/server/queries/`) not models directly
2. **Serialize data** with `serializeDocuments()` before passing to client
3. **Convert Dates** to ISO strings for metadata: `.toISOString()`
4. **Type interfaces** for IntelliSense
5. **No `'use client'`** in server component files

---

## 3. Client Components

Client components receive serialized data with dates as strings. Use interfaces for typing but understand the data shape is different.

### Imports

```typescript
'use client';

import { useState } from 'react';
import type { IArticle, ITopic } from '@/interfaces/schema';
```

### Receiving Serialized Data

```typescript
// src/app/(admin)/admin/articles/ArticlesTable.tsx

interface ArticlesTableProps {
    articles: IArticle[];  // Actually serialized (Date → string)
    topics: ITopic[];      // Actually serialized
}

export const ArticlesTable = ({ articles, topics }: ArticlesTableProps) => {
    // ⚠️ articles[0].createdAt is a STRING, not Date!

    return (
        <table>
            {articles.map(article => (
                <tr key={article._id}>
                    <td>{article.title}</td>
                    <td>{new Date(article.createdAt).toLocaleDateString()}</td>  {/* ✅ */}
                </tr>
            ))}
        </table>
    );
};
```

### Form Submission to Server Actions

```typescript
'use client';

import { useState, useTransition } from 'react';
import { createArticle } from '@/server/actions/articles';
import type { IArticle } from '@/interfaces/schema';

interface ArticleFormProps {
    article?: IArticle;  // For editing (serialized)
    topics: ITopic[];    // Serialized
}

export const ArticleForm = ({ article, topics }: ArticleFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(article?.title ?? '');
    const [topicId, setTopicId] = useState(article?.topicId ?? '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            title,
            topicId,  // ⚠️ This is a STRING (serialized ObjectId)
            // ... other fields
        };

        startTransition(async () => {
            const result = await createArticle(data);

            if (result.success) {
                // Success
            } else {
                // Show error
            }
        });
    };

    return <form onSubmit={handleSubmit}>...</form>;
};
```

### Rules for Client Components

1. **Use `'use client'`** directive
2. **Understand serialization**: Dates are strings, ObjectIds are strings
3. **Convert strings back to Dates** when displaying: `new Date(dateString)`
4. **Import interfaces for typing** but remember actual shape is serialized
5. **Use transitions** for server action calls: `startTransition()`
6. **No direct model imports** - models are server-only

---

## 4. Data Flow Example (End-to-End)

### Scenario: Creating an Article

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Client Component (ArticleForm.tsx)                          │
│    - User fills form                                            │
│    - Calls: await createArticle(data)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Server Action (actions/articles.ts)                         │
│    - Validates with Zod                                         │
│    - Uses: getCollection<IArticle>(COLLECTIONS.content)         │
│    - Creates: collection.insertOne(article)                     │
│    - Revalidates: revalidatePath('/articles')                   │
│    - Returns: { success: true, data: id }                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MongoDB                                                      │
│    - Document inserted into 'content' collection                │
│    - ObjectId generated                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Server Component (page.tsx) - After Revalidation            │
│    - Fetches: articles = await getAllArticles()                 │
│    - Serializes: serializeDocuments(articles)                   │
│    - Passes to client: <ArticlesTable articles={serialized} />  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Client Component (ArticlesTable.tsx)                        │
│    - Receives serialized data (Date → string, ObjectId → string)│
│    - Displays: new Date(article.createdAt).toLocaleDateString() │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. NO SERIALIZED<T> PATTERN

**You asked**: How to use interfaces without creating extra Serialized<T> types.

**Answer**: Trust Next.js automatic serialization and understand the data shape difference.

### ❌ Don't Do This (Extra Types)

```typescript
// ❌ Unnecessary extra type
type SerializedArticle = {
    _id: string;
    createdAt: string;  // Not Date
    // ... manually convert every field
};

interface ArticleFormProps {
    article?: SerializedArticle;
}
```

### ✅ Do This (Simple)

```typescript
// ✅ Just use the interface directly
import type { IArticle } from '@/interfaces/schema';

interface ArticleFormProps {
    article?: IArticle;  // Next.js auto-serializes
}

// When using dates, convert:
<span>{new Date(article.createdAt).toLocaleDateString()}</span>
```

**Why it works:**
- Next.js automatically serializes when passing server → client
- TypeScript still provides IntelliSense for field names
- No need for manual type mapping

---

## 6. Common Patterns

### Pattern 1: Get Related Data

```typescript
// Server Action
export const getArticleWithRelations = async (slug: string) => {
    const article = await Content.findOne({ type: 'article', slug });
    if (!article) return null;

    // Get topic by ObjectId
    const topic = await Topic.findOne({ _id: article.topicId });

    // Get stats (using contentId ObjectId!)
    const stats = await PageStats.findOne({ contentId: article._id });

    return {
        ...article.toObject(),
        topic: topic?.toObject(),
        stats: stats?.toObject(),
    };
};
```

### Pattern 2: Bulk Operations

```typescript
// Server Action
export const bulkPublishArticles = async (slugs: string[]) => {
    const collection = await getCollection<IArticle>(COLLECTIONS.content);

    const result = await collection.updateMany(
        { type: 'article', slug: { $in: slugs } },
        {
            $set: {
                published: true,
                publishedAt: new Date(),
                updatedAt: new Date(),
            },
        }
    );

    // Revalidate all affected paths
    slugs.forEach(slug => revalidatePath(`/articles/${slug}`));
    revalidatePath('/articles');

    return { success: true, count: result.modifiedCount };
};
```

### Pattern 3: Increment Stats (ObjectId!)

```typescript
// Server Action (called from page view)
export const incrementArticleViews = async (slug: string) => {
    // Step 1: Get content to get its _id
    const article = await Content.findOne({ type: 'article', slug });
    if (!article) return;

    // Step 2: Increment stats using contentId ObjectId
    await PageStats.findOneAndUpdate(
        { contentId: article._id },  // ✅ ObjectId reference
        { $inc: { views: 1 }, lastViewedAt: new Date() },
        { upsert: true }
    );
};
```

---

## 7. Summary Rules

### Server Actions
- ✅ Import models and interfaces
- ✅ Use `getCollection<Interface>()`
- ✅ Validate with Zod schemas
- ✅ Return `IApiResponse<T>`
- ✅ Revalidate after mutations
- ✅ Use ObjectId for references

### Server Components
- ✅ Call queries (not models directly)
- ✅ Serialize with `serializeDocuments()`
- ✅ Convert Dates with `.toISOString()` for metadata
- ✅ Pass serialized data to client components

### Client Components
- ✅ Use `'use client'` directive
- ✅ Import interfaces for typing
- ✅ Understand data is serialized (Date → string)
- ✅ Convert strings to Dates: `new Date(dateString)`
- ✅ Use `useTransition()` for server actions
- ❌ No Serialized<T> types needed

### General
- ✅ ObjectId references (not slugs) for relations
- ✅ Trust Next.js auto-serialization
- ✅ Keep interfaces simple
- ❌ Don't create extra type mappings
