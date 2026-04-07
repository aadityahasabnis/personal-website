# MongoDB Connection Usage Guide

## Overview

This project uses **Mongoose** for all database operations. The connection is managed centrally in `connectDB.ts` with hot-reload safety for Next.js development.

---

## ✅ Correct Usage Pattern

### 1. Import the connection helper and your model

```ts
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
```

### 2. Always connect before querying

```ts
// In Server Actions or API Routes
export async function getArticles() {
    // ✅ Connect first
    await connectDB();

    // ✅ Then query the model
    const articles = await Content.find({
        type: 'article',
        published: true,
    })
        .sort({ publishedAt: -1 })
        .limit(10);

    return articles;
}
```

### 3. Complete Server Action Example

```ts
'use server';

import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';

export async function getArticleBySlug(slug: string) {
    try {
        // 1. Connect to database
        await connectDB();

        // 2. Query using Mongoose model
        const article = await Content.findOne({
            slug,
            type: 'article',
            published: true,
        });

        if (!article) {
            return { success: false, error: 'Article not found' };
        }

        // 3. Return serialized data (convert ObjectId to string)
        return {
            success: true,
            data: JSON.parse(JSON.stringify(article)),
        };
    } catch (error) {
        console.error('Error fetching article:', error);
        return { success: false, error: 'Failed to fetch article' };
    }
}
```

### 4. Using Model Methods

```ts
// Find one
await connectDB();
const admin = await Admin.findOne({ email: 'user@example.com' });

// Find many with conditions
const published = await Content.find({ published: true }).populate('topic').select('title slug publishedAt').limit(20);

// Create new document
const newArticle = await Content.create({
    type: 'article',
    slug: 'my-article',
    title: 'My Article',
    body: 'Content here...',
    published: false,
});

// Update
await Content.updateOne({ _id: new ObjectId(id) }, { $set: { published: true, publishedAt: new Date() } });

// Delete
await Content.deleteOne({ _id: new ObjectId(id) });
```

### 5. Using Static Methods (defined in models)

```ts
await connectDB();

// Custom static method from Admin model
const admin = await Admin.findByEmail('user@example.com');

// Custom static method from PageStats model
const stats = await PageStats.getOrCreateStats('article-slug');
```

### 6. Aggregation Pipelines

```ts
await connectDB();

const topArticles = await Content.aggregate([
    { $match: { type: 'article', published: true } },
    {
        $lookup: {
            from: 'pageStats',
            localField: 'slug',
            foreignField: 'slug',
            as: 'stats',
        },
    },
    { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
    { $sort: { 'stats.views': -1 } },
    { $limit: 10 },
]);
```

---

## ❌ Don't Do This

### ❌ Querying without connecting first

```ts
// ❌ BAD - No connection established
export async function getArticles() {
    return await Content.find(); // May fail!
}
```

### ❌ Using native client for normal queries

```ts
// ❌ BAD - Use Mongoose models instead
import { clientPromise } from '@/lib/db/connectDB';

const client = await clientPromise;
const articles = await client.db().collection('contents').find().toArray();
```

**Why?** You lose:

- Type safety
- Schema validation
- Mongoose virtuals & methods
- Middleware (hooks)
- Population (joins)

### ❌ Not serializing ObjectId in responses

```ts
// ❌ BAD - ObjectId is not JSON serializable
return { article };

// ✅ GOOD - Convert to plain object
return { article: JSON.parse(JSON.stringify(article)) };
```

---

## 📁 Model Location

All Mongoose models are in: `src/server/models/`

```
src/server/models/
├── Admin.ts
├── Content.ts
├── Topic.ts
├── Subtopic.ts
├── PageStats.ts
├── Comment.ts
├── Contact.ts
├── Subscriber.ts
└── types.ts
```

---

## 🔧 Helper Pattern (Recommended)

For reusable operations, create helper functions in `src/server/new/utils/helper.ts`:

```ts
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';

export async function ensureConnection(): Promise<void> {
    await connectDB();
}

export async function getPublishedContent(type: string, limit = 10) {
    await ensureConnection();
    return Content.find({ type, published: true }).sort({ publishedAt: -1 }).limit(limit);
}
```

Then use in server actions:

```ts
import { getPublishedContent } from '@/server/new/utils/helper';

export async function getArticlesAction() {
    const articles = await getPublishedContent('article', 20);
    return { success: true, data: articles };
}
```

---

## 🎯 Key Principles

1. **Always call `connectDB()` before any model operation**
2. **Use Mongoose models** - don't use raw MongoDB client queries
3. **Serialize responses** - Convert ObjectId to strings for client
4. **Handle errors** - Wrap in try/catch and return typed responses
5. **Use helper functions** - Keep server actions clean and focused

---

## 📚 Common Model Operations Reference

| Operation        | Code                                                 |
| ---------------- | ---------------------------------------------------- |
| Find by ID       | `await Model.findById(id)`                           |
| Find by slug     | `await Model.findOne({ slug })`                      |
| Find all         | `await Model.find({})`                               |
| Find with filter | `await Model.find({ published: true })`              |
| Count            | `await Model.countDocuments({ type: 'article' })`    |
| Create           | `await Model.create({ ...data })`                    |
| Update           | `await Model.updateOne({ _id: id }, { $set: data })` |
| Delete           | `await Model.deleteOne({ _id: id })`                 |
| Exists           | `await Model.exists({ slug })`                       |

---

## 🔒 Connection Details

The connection helper (`connectDB`) automatically:

- ✅ Checks if already connected (avoids duplicate connections)
- ✅ Uses global cache for hot-reload safety in Next.js dev
- ✅ Configures connection pooling (10 max, 2 min)
- ✅ Sets timeouts for reliability
- ✅ Handles errors and clears cache on failure

**You never need to worry about connection management** - just call `connectDB()` and query your models.
