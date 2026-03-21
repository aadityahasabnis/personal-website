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
    rssEnabled: true,
  },
} as const;

// ============================================================
// Navigation
// ============================================================

export const NAV_LINKS = [
  { label: 'Articles', href: '/articles' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
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
  { platform: 'GitHub', url: 'https://github.com/aadityahasabnis' },
  { platform: 'Twitter', url: 'https://twitter.com/aadityahasabnis' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/aadityahasabnis' },
  { platform: 'Email', url: 'mailto:aaditya.hasabnis@gmail.com' },
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