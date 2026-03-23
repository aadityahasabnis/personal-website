import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

// ============================================================
// Site Configuration
// ============================================================

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
    givenName: 'Aaditya',
    familyName: 'Hasabnis',
    aliasesExact: ['Aditya Hasabnis', 'Aditya', 'Hasabnis'],
    email: 'aaditya.hasabnis@gmail.com',
    bio: 'Developer, writer, and lifelong learner.',
    jobTitle: 'Software Engineer',
    knowsAbout: [
      'Software Engineering',
      'Web Development',
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'Node.js',
      'System Design',
      'Data Structures and Algorithms',
      'Technical Writing',
    ],
  },

  seo: {
    twitterHandle: '@aadityahasabnis',
    ogImage: '/og-default.png',
    ogLocale: 'en_US',
    feedLanguage: 'en-us',
    rssEnabled: true,
    defaultKeywords: ['developer', 'writer', 'portfolio', 'articles', 'notes'],
    preferredCrawlScopePaths: ['/', '/articles', '/notes', '/blogs', '/projects', '/about', '/contact'],
    keywordAliasCap: 2,
    websiteAlternateNames: ['Aaditya Hasabnis', 'Aditya Hasabnis'],
    search: {
      enabled: true,
      path: '/search',
      queryParam: 'q',
      minQueryLength: 2,
      resultLimit: 20,
    },
  },
} as const;

// ============================================================
// Navigation
// ============================================================

export const NAV_LINKS = [
  { label: 'Articles', href: '/articles', hideOnDesktop: false },
  { label: 'Blogs', href: '/blogs', hideOnDesktop: false },
  { label: 'Projects', href: '/projects', hideOnDesktop: false },
  { label: 'About', href: '/about', hideOnDesktop: false },
] as const;

export const FOOTER_LINKS = {
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
} as const;

// ============================================================
// Social Links
// ============================================================

export const SOCIAL_LINKS = [
  {
    id: 'github',
    platform: 'GitHub',
    url: 'https://github.com/aadityahasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on GitHub',
    icon: Github,
  },
  {
    id: 'X',
    platform: 'X',
    url: 'https://x.com/aadityahasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on X',
    icon: Twitter,
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/aadityahasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on LinkedIn',
    icon: Linkedin,
  },
  {
    id: 'email',
    platform: 'Email',
    url: 'mailto:aaditya.hasabnis@gmail.com',
    isExternal: false,
    ariaLabel: 'Send email to Aaditya Hasabnis',
    icon: Mail,
  },
] as const;

// ============================================================
// Database Collections
// ============================================================

export const COLLECTIONS = {
  admins: 'admins',
  comments: 'comments',
  contacts: 'contacts',
  contents: 'contents',
  pageStats: 'pageStats',
  subscribers: 'subscribers',
  subtopics: 'subtopics',
  topics: 'topics',
} as const;