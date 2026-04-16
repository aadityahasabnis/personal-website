import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaPinterest } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// ============================================================
// Site Configuration
// ============================================================

export const SITE_CONFIG = {
  name: 'Aaditya Hasabnis',
  marathiName: 'आदित्य हसबनीस',
  shortName: 'Aadizz',
  title: 'Aaditya Hasabnis — Web Developer, Writer & System Thinker',
  description: 'Web developer and writer sharing clear, practical perspectives on modern software, problem solving, and community-focused thinking.',
  url: 'https://aadityahasabnis.com',
  locale: 'en-US',
  email: 'aaditya.hasabnis@gmail.com',

  author: {
    name: 'Aaditya Hasabnis',
    givenName: 'Aaditya',
    marathiGivenName: 'आदित्य',
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
    defaultKeywords: [
      'web development',
      'software engineering',
      'frontend development',
      'backend development',
      'problem solving',
      'system design',
      'technical writing',
      'creative problem solving',
      'community building',
      'Aditya hasabnis',
      'Aditya'
    ],
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
    icon: FaGithub,
  },
  {
    id: 'X',
    platform: 'X',
    url: 'https://x.com/aadityahasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on X',
    icon: FaXTwitter,
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/aadityahasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on LinkedIn',
    icon: FaLinkedin,
  },
  {
    id: 'instagram',
    platform: 'Instagram',
    url: 'https://instagram.com/creative_northstar',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Instagram',
    icon: FaInstagram
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100016312514133',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Facebook',
    icon: FaFacebook
  },
  {
    id: 'pinterest',
    platform: 'Pinterest',
    url: 'https://www.pinterest.com/aaditya_hasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Pinterest',
    icon: FaPinterest
  }
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