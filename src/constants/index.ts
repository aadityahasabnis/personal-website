// Site Configuration
export const SITE_CONFIG = {
    name: 'Aaditya Hasabnis',
    shortName: 'AH',
    title: 'Aaditya Hasabnis | Developer & Writer',
    description: 'Personal site for articles, notes, and projects',
    url: 'https://aadityahasabnis.site',
    locale: 'en-US',
    email: 'hello@aadityahasabnis.site',

    author: {
        name: 'Aaditya Hasabnis',
        email: 'hello@aadityahasabnis.site',
        bio: 'Developer, writer, and lifelong learner.',
    },

    socials: [
        { name: 'GitHub', url: 'https://github.com/aadityahasabnis', icon: 'github' },
        { name: 'Twitter', url: 'https://twitter.com/aadityahasabnis', icon: 'twitter' },
        { name: 'LinkedIn', url: 'https://linkedin.com/in/aadityahasabnis', icon: 'linkedin' },
    ],

    seo: {
        twitterHandle: '@aadityahasabnis',
        ogImage: '/og-default.png',
    },
} as const;

// Social Links for Footer
export interface ISocialLink {
    platform: string;
    url: string;
}

export const SOCIAL_LINKS: readonly ISocialLink[] = [
    { platform: 'github', url: 'https://github.com/aadityahasabnis' },
    { platform: 'twitter', url: 'https://twitter.com/aadityahasabnis' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/aadityahasabnis' },
    { platform: 'email', url: 'mailto:hello@aadityahasabnis.site' },
] as const;

// Navigation Links
export interface INavLink {
    label: string;
    href: string;
    external?: boolean;
    hideOnDesktop?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}

export const NAV_LINKS: readonly INavLink[] = [
    { label: 'Articles', href: '/articles' },
    { label: 'Notes', href: '/notes' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
] as const;

export const FOOTER_LINKS = {
    main: [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: 'About', href: '/about' },
    ],
    legal: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
    ],
} as const;

// Content Types
export const CONTENT_TYPES = {
    ARTICLE: 'article',
    SERIES: 'series',
    NOTE: 'note',
    LOG: 'log',
    PAGE: 'page',
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

export const CONTENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

// React Query Config
export const QUERY_CONFIG = {
    defaultStaleTime: 60_000,
    defaultGcTime: 300_000,
    defaultRetry: 1,
    contentStaleTime: 300_000,
    contentGcTime: 600_000,
    statsStaleTime: 30_000,
    statsGcTime: 120_000,
    defaultPageSize: 10,
    maxPageSize: 50,
} as const;

// Database Collections
export const COLLECTIONS = {
    content: 'content',
    topics: 'topics',
    subtopics: 'subtopics',
    articleStats: 'article_stats',
    comments: 'comments',
    pageStats: 'pageStats',
    subscribers: 'subscribers',
    users: 'users',
    media: 'media',
} as const;

// Validation Rules
export const VALIDATION = {
    title: { min: 3, max: 100 },
    slug: { min: 3, max: 100, pattern: /^[a-z0-9-]+$/ },
    description: { max: 160 },
    body: { min: 100 },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
} as const;

// Query Keys - Re-export from dedicated file
export { QUERY_KEYS } from './query-keys';
