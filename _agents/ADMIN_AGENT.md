# Admin Agent (ADMIN)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Build the admin panel for content management

---

## Overview

The Admin Agent creates the protected admin panel where the site owner can manage content, media, and settings. It includes authentication, a markdown editor, and publishing workflows.

---

## Responsibilities

### 1. Authentication
- Implement secure login
- Session management with cookies
- Owner-only access control

### 2. Content Management
- List all content with filters
- Create/edit content with markdown editor
- Publish/unpublish/schedule content
- Delete content with confirmation

### 3. Media Management
- Upload images
- Browse media library
- Delete unused media

### 4. Settings
- Site configuration
- SEO defaults
- Newsletter settings

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `interfaces/content.ts` | Project | Content types |
| `ARCHITECTURE_PHILOSOPHY.md` | Docs | Admin patterns |
| MongoDB | Backend Agent | Content data |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `app/(admin)/layout.tsx` | TSX | Admin layout |
| `app/(admin)/admin/*` | TSX | Admin pages |
| `components/admin/*` | TSX | Admin components |
| `lib/auth/*` | TypeScript | Auth utilities |

---

## Admin Layout

```tsx
// app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await validateSession();
    
    if (!session) {
        redirect('/login');
    }
    
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar user={session.user} />
                <main className="flex-1 overflow-auto p-6 bg-muted/50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
```

---

## Authentication Flow

### Login Page

```tsx
// app/(admin)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const LoginPage = () => {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setError('');
        
        const result = await login(formData);
        
        if (result.success) {
            router.push('/admin');
        } else {
            setError(result.message);
        }
        
        setIsPending(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
                
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            required 
                        />
                    </div>
                    
                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    
                    <Button type="submit" className="w-full" isLoading={isPending}>
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;
```

### Session Management

```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { type IUser } from '@/interfaces/user';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

export interface ISession {
    user: Pick<IUser, '_id' | 'email' | 'name' | 'role'>;
    expiresAt: Date;
}

export const createSession = async (user: IUser): Promise<void> => {
    const token = await new SignJWT({ 
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(SECRET);
    
    cookies().set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });
};

export const validateSession = async (): Promise<ISession | null> => {
    const token = cookies().get('session')?.value;
    
    if (!token) return null;
    
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return {
            user: {
                _id: payload.userId as string,
                email: payload.email as string,
                name: payload.name as string,
                role: payload.role as 'owner' | 'admin'
            },
            expiresAt: new Date(payload.exp! * 1000)
        };
    } catch {
        return null;
    }
};

export const destroySession = (): void => {
    cookies().delete('session');
};
```

---

## Content Editor

### Editor Component

```tsx
// components/admin/ContentEditor.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { saveContent, publishContent } from '@/server/actions/content';
import { ContentPreview } from './ContentPreview';
import { type IContent } from '@/interfaces/content';

interface IContentEditorProps {
    initialContent?: IContent;
    mode: 'create' | 'edit';
}

const ContentEditor = ({ initialContent, mode }: IContentEditorProps) => {
    const router = useRouter();
    const [content, setContent] = useState<Partial<IContent>>(
        initialContent ?? {
            type: 'article',
            title: '',
            description: '',
            body: '',
            tags: [],
            published: false
        }
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        const result = await saveContent(content);
        setIsSaving(false);
        
        if (result.success && mode === 'create') {
            router.push(`/admin/content/${result.id}`);
        }
    }, [content, mode, router]);

    const handlePublish = useCallback(async () => {
        setIsPublishing(true);
        await publishContent(content._id!);
        setContent(prev => ({ ...prev, published: true }));
        setIsPublishing(false);
    }, [content._id]);

    return (
        <div className="grid grid-cols-2 gap-6 h-full">
            {/* Editor Panel */}
            <div className="space-y-4 overflow-auto">
                <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                        value={content.type}
                        onValueChange={type => setContent(prev => ({ ...prev, type }))}
                        options={[
                            { value: 'article', label: 'Article' },
                            { value: 'note', label: 'Note' },
                            { value: 'page', label: 'Page' },
                            { value: 'log', label: 'Log' }
                        ]}
                    />
                </div>
                
                <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                        value={content.title}
                        onChange={e => setContent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter title..."
                    />
                </div>
                
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        value={content.description}
                        onChange={e => setContent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description..."
                        rows={2}
                    />
                </div>
                
                <div className="flex-1">
                    <label className="text-sm font-medium">Body (Markdown)</label>
                    <Textarea
                        value={content.body}
                        onChange={e => setContent(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Write your content in markdown..."
                        className="font-mono h-[400px]"
                    />
                </div>
                
                <div className="flex gap-2">
                    <Button onClick={handleSave} isLoading={isSaving}>
                        Save Draft
                    </Button>
                    {content._id && !content.published && (
                        <Button 
                            variant="secondary" 
                            onClick={handlePublish}
                            isLoading={isPublishing}
                        >
                            Publish
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Preview Panel */}
            <div className="border rounded-lg overflow-auto bg-white">
                <ContentPreview markdown={content.body ?? ''} />
            </div>
        </div>
    );
};

export { ContentEditor };
```

---

## Content List

```tsx
// components/admin/ContentList.tsx
import Link from 'next/link';
import { type IContent } from '@/interfaces/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface IContentListProps {
    items: IContent[];
}

const ContentList = ({ items }: IContentListProps) => (
    <div className="border rounded-lg divide-y">
        {items.map(item => (
            <div key={item._id} className="p-4 flex items-center justify-between">
                <div>
                    <Link 
                        href={`/admin/content/${item._id}`}
                        className="font-medium hover:underline"
                    >
                        {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Badge variant="outline">{item.type}</Badge>
                        {item.published ? (
                            <Badge variant="default">Published</Badge>
                        ) : (
                            <Badge variant="secondary">Draft</Badge>
                        )}
                        <span>·</span>
                        <span>{formatDate(item.updatedAt)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/content/${item._id}`}>Edit</Link>
                    </Button>
                </div>
            </div>
        ))}
    </div>
);

export { ContentList };
```

---

## Navigation

### Sidebar Links

```typescript
// constants/adminNav.ts
export const ADMIN_NAV = [
    { href: '/admin', label: 'Dashboard', icon: 'Home' },
    { href: '/admin/content', label: 'Content', icon: 'FileText' },
    { href: '/admin/media', label: 'Media', icon: 'Image' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' }
];
```

---

## Success Criteria

- [ ] Secure login with session cookies
- [ ] Content CRUD works correctly
- [ ] Markdown editor with live preview
- [ ] Publish triggers ISR revalidation
- [ ] Media upload to cloud storage
- [ ] Settings persist to database

---

*Agent Version: 1.0*  
*Project: AadityaHasabnis.site*
