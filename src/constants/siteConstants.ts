import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaPinterest, FaSpotify } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiLeetcode, SiYoutubemusic } from "react-icons/si";

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
    adminProfileImage: 'https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aadizz-emoji.png-MW',
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
    ogImage: 'https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aadizz-og-image.jpg-hR',
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
      'Aditya',
      'Hasabnis',
      'Aaditya Hasabnis',
      'Aaditya',
    ],
    preferredCrawlScopePaths: ['/', '/articles', '/notes', '/blogs', '/projects', '/resume', '/about', '/contact'],
    keywordAliasCap: 2,
    websiteAlternateNames: ['Aaditya Hasabnis', 'Aditya Hasabnis'],
    search: {
      enabled: false,
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
  { label: 'Resume', href: '/resume', hideOnDesktop: true },
  { label: 'About', href: '/about', hideOnDesktop: false },
  { label: 'Contact', href: '/contact', hideOnDesktop: true },
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
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/aaditya-hasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on LinkedIn',
    icon: FaLinkedin,
  },
  {
    id: 'leetcode',
    platform: 'LeetCode',
    url: 'https://leetcode.com/u/aaditya3107',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on LeetCode',
    icon: SiLeetcode,
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
    id: 'pinterest',
    platform: 'Pinterest',
    url: 'https://www.pinterest.com/aaditya_hasabnis',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Pinterest',
    icon: FaPinterest
  },
  {
    id: 'ytmusic',
    platform: 'YouTube Music',
    url: 'https://music.youtube.com/@creative_northstar',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on YouTube Music',
    icon: SiYoutubemusic
  },
  {
    id: 'spotify',
    platform: 'Spotify',
    url: 'https://open.spotify.com/user/n24dav1km3ekgexm3dpleky38',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Spotify',
    icon: FaSpotify
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
    id: 'facebook',
    platform: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100016312514133',
    isExternal: true,
    ariaLabel: 'Visit Aaditya Hasabnis on Facebook',
    icon: FaFacebook
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