# Constants Organization

> Centralized constants management for AadityaHasabnis.site

---

## File Structure

```
constants/
├── siteConfig.ts         # Site metadata and SEO
├── navigation.ts         # Navigation links
├── content.ts            # Content types and options
├── queryConfig.ts        # React Query settings
├── validation.ts         # Form validation rules
└── index.ts              # Re-exports
```

---

## Site Configuration

```typescript
// constants/siteConfig.ts
export const SITE_CONFIG = {
    name: 'Aaditya Hasabnis',
    title: 'Aaditya Hasabnis | Developer & Writer',
    description: 'Personal site for articles, notes, and projects',
    url: 'https://aadityahasabnis.site',
    locale: 'en-US',
    
    author: {
        name: 'Aaditya Hasabnis',
        email: 'hello@aadityahasabnis.site',
        bio: 'Developer, writer, and lifelong learner.'
    },
    
    socials: [
        { name: 'GitHub', url: 'https://github.com/aadityahasabnis', icon: 'github' },
        { name: 'Twitter', url: 'https://twitter.com/aadityahasabnis', icon: 'twitter' },
        { name: 'LinkedIn', url: 'https://linkedin.com/in/aadityahasabnis', icon: 'linkedin' }
    ],
    
    seo: {
        twitterHandle: '@aadityahasabnis',
        ogImage: '/og-default.png'
    }
} as const;
```

---

## Navigation

```typescript
// constants/navigation.ts
export interface INavLink {
    label: string;
    href: string;
    external?: boolean;
}

export const NAV_LINKS: readonly INavLink[] = [
    { label: 'Articles', href: '/articles' },
    { label: 'Notes', href: '/notes' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' }
] as const;

export const FOOTER_LINKS = {
    main: [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: 'About', href: '/about' }
    ],
    legal: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
    ]
} as const;
```

---

## Content Types

```typescript
// constants/content.ts
export const CONTENT_TYPES = {
    ARTICLE: 'article',
    SERIES: 'series',
    NOTE: 'note',
    LOG: 'log',
    PAGE: 'page'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

export const CONTENT_TYPE_OPTIONS = [
    { value: 'article', label: 'Article', icon: 'file-text' },
    { value: 'series', label: 'Series', icon: 'layers' },
    { value: 'note', label: 'Note', icon: 'sticky-note' },
    { value: 'log', label: 'Log', icon: 'calendar' },
    { value: 'page', label: 'Page', icon: 'layout' }
] as const;

export const CONTENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
} as const;

export const TAG_PRESETS = [
    'react', 'nextjs', 'typescript', 'javascript',
    'css', 'design', 'productivity', 'career'
] as const;
```

---

## React Query Config

```typescript
// constants/queryConfig.ts
export const QUERY_CONFIG = {
    // Default query options
    defaultStaleTime: 60_000,      // 1 minute
    defaultGcTime: 300_000,        // 5 minutes  
    defaultRetry: 1,
    
    // Content-specific
    contentStaleTime: 300_000,     // 5 minutes
    contentGcTime: 600_000,        // 10 minutes
    
    // Stats (more frequent updates)
    statsStaleTime: 30_000,        // 30 seconds
    statsGcTime: 120_000,          // 2 minutes
    
    // Admin (always fresh)
    adminStaleTime: 0,
    adminGcTime: 60_000,           // 1 minute
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
    
    // Pagination
    defaultPageSize: 10,
    maxPageSize: 50
} as const;
```

---

## Validation Rules

```typescript
// constants/validation.ts
export const VALIDATION = {
    title: {
        min: 3,
        max: 100,
        pattern: /^[a-zA-Z0-9\s\-:]+$/
    },
    slug: {
        min: 3,
        max: 100,
        pattern: /^[a-z0-9-]+$/
    },
    description: {
        max: 160  // SEO limit
    },
    body: {
        min: 100  // Minimum content length
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        min: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    }
} as const;

export const VALIDATION_MESSAGES = {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must be at most ${max} characters`,
    pattern: 'Invalid format'
} as const;
```

---

## Status Colors

```typescript
// constants/statusColors.ts
export const STATUS_COLORS = {
    draft: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-muted'
    },
    published: {
        bg: 'bg-status-success-light',
        text: 'text-status-success',
        border: 'border-status-success'
    },
    archived: {
        bg: 'bg-status-amber-light',
        text: 'text-status-amber',
        border: 'border-status-amber'
    },
    error: {
        bg: 'bg-status-error-light',
        text: 'text-status-error',
        border: 'border-status-error'
    }
} as const;

export type StatusType = keyof typeof STATUS_COLORS;
```

---

## Icon Mapping

```typescript
// constants/icons.ts
import {
    FileText,
    Layers,
    StickyNote,
    Calendar,
    Layout,
    Home,
    User,
    Settings,
    type LucideIcon
} from 'lucide-react';

export const CONTENT_ICONS: Record<string, LucideIcon> = {
    article: FileText,
    series: Layers,
    note: StickyNote,
    log: Calendar,
    page: Layout
} as const;

export const NAV_ICONS: Record<string, LucideIcon> = {
    home: Home,
    about: User,
    settings: Settings
} as const;
```

---

## Keyboard Shortcuts

```typescript
// constants/shortcuts.ts
export const SHORTCUTS = {
    save: { key: 's', ctrlKey: true, label: 'Save' },
    publish: { key: 'p', ctrlKey: true, shiftKey: true, label: 'Publish' },
    preview: { key: 'p', ctrlKey: true, label: 'Preview' },
    search: { key: 'k', ctrlKey: true, label: 'Search' },
    escape: { key: 'Escape', label: 'Close' }
} as const;
```

---

## Collections Config

```typescript
// constants/collections.ts
export const COLLECTIONS = {
    content: 'content',
    pageStats: 'pageStats',
    subscribers: 'subscribers',
    users: 'users',
    media: 'media'
} as const;

export const INDEXES = {
    content: [
        { keys: { type: 1, slug: 1 }, options: { unique: true } },
        { keys: { type: 1, published: 1, publishedAt: -1 } },
        { keys: { tags: 1 } }
    ],
    pageStats: [
        { keys: { slug: 1 }, options: { unique: true } },
        { keys: { views: -1 } }
    ],
    subscribers: [
        { keys: { email: 1 }, options: { unique: true } }
    ]
} as const;
```

---

## Index Re-export

```typescript
// constants/index.ts
export * from './siteConfig';
export * from './navigation';
export * from './content';
export * from './queryConfig';
export * from './validation';
export * from './statusColors';
export * from './icons';
export * from './shortcuts';
export * from './collections';
```

---

## Usage

```tsx
// In components
import { SITE_CONFIG, NAV_LINKS, QUERY_CONFIG } from '@/constants';

// Site title
<title>{SITE_CONFIG.title}</title>

// Navigation
{NAV_LINKS.map(link => (
    <Link key={link.href} href={link.href}>{link.label}</Link>
))}

// Query config
const { data } = useQuery({
    staleTime: QUERY_CONFIG.contentStaleTime
});
```

---

*Version: 1.0*
