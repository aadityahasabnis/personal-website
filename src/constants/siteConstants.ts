// Site Configuration
export const SITE_CONFIG = {
    name: 'Aaditya Hasabnis',
    shortName: 'AH',
    title: 'Aaditya Hasabnis | Developer & Writer',
    description: 'Personal site for articles, blogs, and projects',
    url: 'https://aadityahasabnis.com',
    locale: 'en-US',
    email: 'aaditya.hasabnis@gmail.com',

    author: {
        name: 'Aaditya Hasabnis',
        email: 'aaditya.hasabnis@gmail.com',
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

// ============================================================
// Database Collection Names
// ============================================================

export const COLLECTIONS = {
    content: 'content',
    topics: 'topics',
    subtopics: 'subtopics',
    projects: 'projects',
    pageStats: 'pageStats',
    articleStats: 'pageStats', // Legacy alias — points to same collection
    comments: 'comments',
    subscribers: 'subscribers',
    contacts: 'contacts',
    users: 'users',
    settings: 'settings',
    activityLogs: 'activityLogs',
    media: 'media',
} as const;

// ============================================================
// Validation Constants
// ============================================================

export const VALIDATION = {
    title: { min: 2, max: 200 },
    slug: {
        min: 2,
        max: 100,
        pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: { max: 500 },
    body: { min: 1 },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    seo: {
        title: { max: 70 },
        description: { max: 160 },
    },
    tags: { maxPerItem: 50, maxCount: 20 },
    comment: { min: 1, max: 5000 },
    name: { min: 1, max: 100 },
    subject: { min: 1, max: 200 },
    message: { min: 10, max: 10000 },
    url: { max: 2048 },
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
    { platform: 'email', url: 'mailto:aaditya.hasabnis@gmail.com' },
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
    { label: 'Blogs', href: '/blogs' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
] as const;

export const FOOTER_LINKS = {
    main: [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'About', href: '/about' },
    ],
    legal: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
    ],
} as const;
