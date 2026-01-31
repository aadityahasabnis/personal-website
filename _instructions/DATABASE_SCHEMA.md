# Database Schema

> MongoDB schema documentation for AadityaHasabnis.site

---

## Collections Overview

| Collection | Purpose | Size Estimate |
|------------|---------|---------------|
| `content` | All content types | ~100-500 documents |
| `pageStats` | View/like counters | ~100-500 documents |
| `subscribers` | Newsletter subscribers | ~100-1000 documents |
| `users` | Admin users | 1-5 documents |
| `media` | Uploaded media metadata | ~50-500 documents |

---

## Content Collection

Stores all content types (articles, series, pages, notes, logs).

```typescript
// interfaces/content.ts
interface IContent {
    _id: ObjectId;
    type: 'article' | 'series' | 'page' | 'note' | 'log';
    slug: string;
    title: string;
    description?: string;
    body: string;           // Markdown source
    html?: string;          // Pre-rendered HTML
    author?: string;
    tags?: string[];
    seriesId?: ObjectId;    // For articles in a series
    seriesOrder?: number;   // Position in series
    published: boolean;
    publishedAt?: Date;
    updatedAt: Date;
    createdAt: Date;
    readingTime?: number;   // Minutes
    seo: {
        title?: string;
        description?: string;
        image?: string;
        structuredData?: object;
    };
}
```

### Indexes

```javascript
// Unique slug per type
db.content.createIndex({ type: 1, slug: 1 }, { unique: true });

// List queries (type + published + date)
db.content.createIndex({ type: 1, published: 1, publishedAt: -1 });

// Tag filtering
db.content.createIndex({ tags: 1 });

// Series lookup
db.content.createIndex({ seriesId: 1, seriesOrder: 1 });
```

### Example Documents

```javascript
// Article
{
    _id: ObjectId("..."),
    type: "article",
    slug: "building-a-personal-site",
    title: "Building a Personal Site with Next.js",
    description: "A guide to creating a fast, SEO-friendly portfolio",
    body: "# Introduction\n\nMarkdown content here...",
    html: "<h1>Introduction</h1><p>Rendered HTML here...</p>",
    tags: ["nextjs", "react", "portfolio"],
    published: true,
    publishedAt: ISODate("2026-01-15T10:00:00Z"),
    updatedAt: ISODate("2026-01-20T14:30:00Z"),
    createdAt: ISODate("2026-01-10T09:00:00Z"),
    readingTime: 8,
    seo: {
        title: "Building a Personal Site with Next.js | Aaditya",
        description: "Learn how to build a fast portfolio with Next.js",
        image: "/og/building-a-personal-site.png"
    }
}

// Series
{
    _id: ObjectId("..."),
    type: "series",
    slug: "nextjs-deep-dive",
    title: "Next.js Deep Dive",
    description: "A comprehensive series on Next.js features",
    body: "Series overview content...",
    published: true,
    publishedAt: ISODate("2026-01-01T00:00:00Z"),
    createdAt: ISODate("2026-01-01T00:00:00Z")
}
```

---

## PageStats Collection

Tracks views and likes per content slug.

```typescript
// interfaces/stats.ts
interface IPageStats {
    _id: ObjectId;
    slug: string;
    views: number;
    likes: number;
    lastViewedAt?: Date;
}
```

### Indexes

```javascript
db.pageStats.createIndex({ slug: 1 }, { unique: true });
db.pageStats.createIndex({ views: -1 }); // Popular content
```

### Example Document

```javascript
{
    _id: ObjectId("..."),
    slug: "building-a-personal-site",
    views: 1234,
    likes: 56,
    lastViewedAt: ISODate("2026-01-30T15:30:00Z")
}
```

---

## Subscribers Collection

Newsletter subscribers.

```typescript
// interfaces/subscriber.ts
interface ISubscriber {
    _id: ObjectId;
    email: string;
    name?: string;
    subscribedAt: Date;
    confirmed: boolean;
    confirmToken?: string;
    unsubscribedAt?: Date;
}
```

### Indexes

```javascript
db.subscribers.createIndex({ email: 1 }, { unique: true });
db.subscribers.createIndex({ confirmed: 1 });
```

---

## Users Collection

Admin users (owner only for MVP).

```typescript
// interfaces/user.ts
interface IUser {
    _id: ObjectId;
    email: string;
    name: string;
    passwordHash: string;
    role: 'owner' | 'admin';
    createdAt: Date;
    lastLoginAt?: Date;
}
```

### Indexes

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## Media Collection

Metadata for uploaded media files.

```typescript
// interfaces/media.ts
interface IMedia {
    _id: ObjectId;
    filename: string;
    originalName: string;
    url: string;            // Cloudinary/S3 URL
    publicId: string;       // Cloud storage ID
    mimeType: string;
    size: number;           // Bytes
    width?: number;
    height?: number;
    uploadedAt: Date;
    uploadedBy: ObjectId;   // User ID
}
```

### Indexes

```javascript
db.media.createIndex({ uploadedAt: -1 });
db.media.createIndex({ mimeType: 1 });
```

---

## Query Patterns

### Get Published Articles

```typescript
const articles = await db.collection('content')
    .find({ type: 'article', published: true })
    .sort({ publishedAt: -1 })
    .limit(10)
    .toArray();
```

### Get Article with Stats

```typescript
const article = await db.collection('content').findOne({ 
    type: 'article', 
    slug: 'building-a-personal-site',
    published: true 
});

const stats = await db.collection('pageStats').findOne({ 
    slug: 'building-a-personal-site' 
});

return { ...article, views: stats?.views ?? 0, likes: stats?.likes ?? 0 };
```

### Atomic View Increment

```typescript
await db.collection('pageStats').updateOne(
    { slug: 'building-a-personal-site' },
    { 
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() }
    },
    { upsert: true }
);
```

---

## Data Migration

### Seed Script

```typescript
// scripts/seed.ts
import { connectDB } from '@/lib/db/connect';

const seed = async () => {
    const db = await connectDB();
    
    // Create indexes
    await db.collection('content').createIndex({ type: 1, slug: 1 }, { unique: true });
    await db.collection('pageStats').createIndex({ slug: 1 }, { unique: true });
    
    // Insert sample content
    await db.collection('content').insertOne({
        type: 'article',
        slug: 'hello-world',
        title: 'Hello World',
        body: '# Hello\n\nThis is a test article.',
        published: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    console.log('✅ Database seeded');
};

seed().catch(console.error);
```

---

*Version: 1.0*
