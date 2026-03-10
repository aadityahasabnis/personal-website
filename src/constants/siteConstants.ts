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

// Social Links for Footer
interface ISocialLink {
    platform: string;
    url: string;
}

export const SOCIAL_LINKS: readonly ISocialLink[] = [
    { platform: 'github', url: 'https://github.com/aadityahasabnis' },
    { platform: 'twitter', url: 'https://twitter.com/aadityahasabnis' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/aadityahasabnis' },
    { platform: 'email', url: 'mailto:aaditya.hasabnis@gmail.com' },
] as const;