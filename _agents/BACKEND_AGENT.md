# Backend Agent (BACKEND)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Build database layer, server actions, and API routes

---

## Overview

The Backend Agent creates the server-side infrastructure including MongoDB connection, data models, server queries, server actions, and API routes. It ensures data flows correctly from the database to the frontend.

---

## Responsibilities

### 1. Database Layer
- Set up MongoDB connection singleton
- Create data schemas/models
- Implement seed scripts

### 2. Server Queries
- Build content fetching queries
- Implement stats queries
- Create user queries

### 3. Server Actions
- Like action with atomic increment
- Subscribe action for newsletter
- Auth actions for admin

### 4. API Routes
- Revalidation endpoint
- OG image generation
- Webhook handlers

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `interfaces/*.ts` | Project | Data type definitions |
| `ARCHITECTURE_PHILOSOPHY.md` | Docs | Data fetching patterns |
| MongoDB Atlas | Environment | Database connection |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `lib/db/connect.ts` | TypeScript | DB connection singleton |
| `server/queries/*.ts` | TypeScript | Data fetching functions |
| `server/actions/*.ts` | TypeScript | Mutation functions |
| `app/api/**/route.ts` | TypeScript | API route handlers |

---

## Database Schema

### Collections

```typescript
// content: All content types
{
    _id: ObjectId,
    type: 'article' | 'series' | 'page' | 'note' | 'log',
    slug: string,           // Unique per type
    title: string,
    description: string,
    body: string,           // Markdown source
    html: string,           // Pre-rendered HTML
    tags: string[],
    seriesId: ObjectId,     // For articles in series
    published: boolean,
    publishedAt: Date,
    updatedAt: Date,
    createdAt: Date,
    readingTime: number,
    seo: {
        title: string,
        description: string,
        image: string,
        structuredData: object
    }
}

// pageStats: View/like counters
{
    _id: ObjectId,
    slug: string,           // Matches content slug
    views: number,
    likes: number,
    lastViewedAt: Date
}

// subscribers: Newsletter
{
    _id: ObjectId,
    email: string,
    name: string,
    subscribedAt: Date,
    confirmed: boolean,
    unsubscribedAt: Date
}

// users: Admin users
{
    _id: ObjectId,
    email: string,
    name: string,
    passwordHash: string,
    role: 'owner' | 'admin',
    createdAt: Date,
    lastLoginAt: Date
}
```

### Indexes

```javascript
// content indexes
db.content.createIndex({ type: 1, slug: 1 }, { unique: true });
db.content.createIndex({ type: 1, published: 1, publishedAt: -1 });
db.content.createIndex({ tags: 1 });

// pageStats indexes
db.pageStats.createIndex({ slug: 1 }, { unique: true });

// subscribers indexes
db.subscribers.createIndex({ email: 1 }, { unique: true });
```

---

## Implementation Patterns

### 1. Database Connection

```typescript
// lib/db/connect.ts
import { MongoClient, type Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = 'portfolio';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export const connectDB = async (): Promise<Db> => {
    if (cachedDb) return cachedDb;

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return db;
};
```

### 2. Server Queries

```typescript
// server/queries/content.ts
import { type IArticle, type IContent } from '@/interfaces/content';
import { connectDB } from '@/lib/db/connect';

export const getArticle = async (slug: string): Promise<IArticle | null> => {
    const db = await connectDB();
    
    const article = await db.collection<IContent>('content').findOne({
        type: 'article',
        slug,
        published: true
    });
    
    return article as IArticle | null;
};

export const getArticles = async (limit = 10, skip = 0): Promise<IArticle[]> => {
    const db = await connectDB();
    
    const articles = await db.collection<IContent>('content')
        .find({ type: 'article', published: true })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    
    return articles as IArticle[];
};

export const getArticlesByTag = async (tag: string): Promise<IArticle[]> => {
    const db = await connectDB();
    
    const articles = await db.collection<IContent>('content')
        .find({ type: 'article', published: true, tags: tag })
        .sort({ publishedAt: -1 })
        .toArray();
    
    return articles as IArticle[];
};
```

### 3. Stats Queries

```typescript
// server/queries/stats.ts
import { type IPageStats } from '@/interfaces/stats';
import { connectDB } from '@/lib/db/connect';

export const getAndIncrementViews = async (slug: string): Promise<number> => {
    const db = await connectDB();
    
    const result = await db.collection<IPageStats>('pageStats').findOneAndUpdate(
        { slug },
        { 
            $inc: { views: 1 },
            $set: { lastViewedAt: new Date() }
        },
        { upsert: true, returnDocument: 'after' }
    );
    
    return result?.views ?? 1;
};

export const getStats = async (slug: string): Promise<IPageStats | null> => {
    const db = await connectDB();
    return await db.collection<IPageStats>('pageStats').findOne({ slug });
};
```

### 4. Server Actions

```typescript
// server/actions/like.ts
'use server';

import { type IPageStats } from '@/interfaces/stats';
import { connectDB } from '@/lib/db/connect';

export const likePost = async (slug: string): Promise<number> => {
    const db = await connectDB();
    
    const result = await db.collection<IPageStats>('pageStats').findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    
    return result?.likes ?? 1;
};
```

```typescript
// server/actions/subscribe.ts
'use server';

import { type ISubscriber } from '@/interfaces/subscriber';
import { connectDB } from '@/lib/db/connect';

interface ISubscribeResult {
    success: boolean;
    message: string;
}

export const subscribe = async (email: string, name?: string): Promise<ISubscribeResult> => {
    const db = await connectDB();
    
    const existing = await db.collection<ISubscriber>('subscribers').findOne({ email });
    
    if (existing) {
        return { success: false, message: 'Already subscribed' };
    }
    
    await db.collection<ISubscriber>('subscribers').insertOne({
        email,
        name: name ?? '',
        subscribedAt: new Date(),
        confirmed: false
    } as ISubscriber);
    
    // TODO: Send confirmation email
    
    return { success: true, message: 'Subscribed successfully' };
};
```

### 5. API Routes

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const { slug, type, secret } = await request.json();
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
    
    const path = type === 'article' ? `/articles/${slug}` : `/${slug}`;
    revalidatePath(path);
    
    return NextResponse.json({ revalidated: true, path });
};
```

---

## Commands

```bash
# Seed database
pnpm db:seed

# Reset database (dev only)
pnpm db:reset

# Check connection
pnpm db:check
```

---

## Environment Variables

```bash
# .env.local
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
REVALIDATE_SECRET=your-secret-key
AUTH_SECRET=your-auth-secret
```

---

## Success Criteria

- [ ] MongoDB connection established
- [ ] All content types fetchable
- [ ] Views increment atomically
- [ ] Likes work with server action
- [ ] Revalidation endpoint works
- [ ] Zero N+1 query issues

---

*Agent Version: 1.0*  
*Project: AadityaHasabnis.site*
