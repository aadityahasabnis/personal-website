# API Patterns

> Server actions and API route patterns for AadityaHasabnis.site

---

## Overview

This project uses a **Server-First** approach:
- **Server Actions** for mutations (forms, likes, etc.)
- **Server Components** for data fetching
- **API Routes** only for webhooks and external integrations

---

## Server Actions

### Pattern

```typescript
// server/actions/like.ts
'use server';

import { connectDB } from '@/lib/db/connect';
import { type IPageStats } from '@/interfaces/stats';

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

### Usage in Client Component

```tsx
'use client';

import { likePost } from '@/server/actions/like';

const LikeButton = ({ slug }: { slug: string }) => {
    const handleLike = async () => {
        await likePost(slug);
    };
    
    return <button onClick={handleLike}>Like</button>;
};
```

---

## Server Actions Catalog

### Content Actions

```typescript
// server/actions/content.ts
'use server';

import { revalidatePath } from 'next/cache';
import { type IContent } from '@/interfaces/content';

interface ISaveResult {
    success: boolean;
    id?: string;
    error?: string;
}

// Create or update content
export const saveContent = async (content: Partial<IContent>): Promise<ISaveResult> => {
    const db = await connectDB();
    
    if (content._id) {
        // Update
        await db.collection('content').updateOne(
            { _id: new ObjectId(content._id) },
            { $set: { ...content, updatedAt: new Date() } }
        );
        return { success: true, id: content._id };
    } else {
        // Create
        const result = await db.collection('content').insertOne({
            ...content,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { success: true, id: result.insertedId.toString() };
    }
};

// Publish content
export const publishContent = async (id: string): Promise<void> => {
    const db = await connectDB();
    
    const content = await db.collection('content').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                published: true, 
                publishedAt: new Date(),
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );
    
    if (content) {
        revalidatePath(`/${content.type}s/${content.slug}`);
    }
};

// Unpublish content
export const unpublishContent = async (id: string): Promise<void> => {
    const db = await connectDB();
    
    await db.collection('content').updateOne(
        { _id: new ObjectId(id) },
        { $set: { published: false, updatedAt: new Date() } }
    );
};

// Delete content
export const deleteContent = async (id: string): Promise<void> => {
    const db = await connectDB();
    await db.collection('content').deleteOne({ _id: new ObjectId(id) });
};
```

### Newsletter Actions

```typescript
// server/actions/subscribe.ts
'use server';

interface ISubscribeResult {
    success: boolean;
    message: string;
}

export const subscribe = async (formData: FormData): Promise<ISubscribeResult> => {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string | undefined;
    
    if (!email || !email.includes('@')) {
        return { success: false, message: 'Invalid email address' };
    }
    
    const db = await connectDB();
    
    const existing = await db.collection('subscribers').findOne({ email });
    if (existing) {
        return { success: false, message: 'Already subscribed' };
    }
    
    await db.collection('subscribers').insertOne({
        email,
        name,
        subscribedAt: new Date(),
        confirmed: false
    });
    
    return { success: true, message: 'Thanks for subscribing!' };
};
```

### Auth Actions

```typescript
// server/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/hash';

interface ILoginResult {
    success: boolean;
    message?: string;
}

export const login = async (formData: FormData): Promise<ILoginResult> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
        return { success: false, message: 'Invalid credentials' };
    }
    
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        return { success: false, message: 'Invalid credentials' };
    }
    
    await createSession(user);
    
    return { success: true };
};

export const logout = async (): Promise<void> => {
    destroySession();
    redirect('/login');
};
```

---

## API Routes

### Revalidation Webhook

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const { slug, type, secret } = await request.json();
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const path = type === 'article' ? `/articles/${slug}` : `/${slug}`;
    revalidatePath(path);
    
    return NextResponse.json({ revalidated: true, path });
};
```

### OG Image Generation

```typescript
// app/api/og/[slug]/route.tsx
import { ImageResponse } from 'next/og';
import { getContent } from '@/server/queries/content';

export const runtime = 'edge';

export const GET = async (
    _request: Request,
    { params }: { params: { slug: string } }
): Promise<ImageResponse> => {
    const content = await getContent(params.slug);
    
    return new ImageResponse(
        (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '60px',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                color: '#ffffff'
            }}>
                <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0 }}>
                    {content?.title ?? 'Aaditya Hasabnis'}
                </h1>
                {content?.description && (
                    <p style={{ fontSize: 28, opacity: 0.8, marginTop: 20 }}>
                        {content.description}
                    </p>
                )}
            </div>
        ),
        { width: 1200, height: 630 }
    );
};
```

---

## Server Queries

```typescript
// server/queries/content.ts
import { type IArticle, type IContent } from '@/interfaces/content';
import { connectDB } from '@/lib/db/connect';

export const getArticle = async (slug: string): Promise<IArticle | null> => {
    const db = await connectDB();
    return await db.collection<IContent>('content').findOne({
        type: 'article',
        slug,
        published: true
    }) as IArticle | null;
};

export const getArticles = async (limit = 10): Promise<IArticle[]> => {
    const db = await connectDB();
    return await db.collection<IContent>('content')
        .find({ type: 'article', published: true })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .toArray() as IArticle[];
};

export const getPublishedContent = async (): Promise<IContent[]> => {
    const db = await connectDB();
    return await db.collection<IContent>('content')
        .find({ published: true })
        .sort({ publishedAt: -1 })
        .toArray();
};
```

---

## Error Handling

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Usage in server action
export const someAction = async (): Promise<Result> => {
    try {
        // ... action logic
    } catch (error) {
        console.error('Action failed:', error);
        return { success: false, error: 'Something went wrong' };
    }
};
```

---

*Version: 1.0*
