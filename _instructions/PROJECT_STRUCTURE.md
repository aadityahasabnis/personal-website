# Project Structure Documentation

> Complete file and folder structure for AadityaHasabnis.site

---

## Root Directory

```
aadityahasabnis.site/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   │   ├── ci.yml            # Lint, type-check, build
│   │   ├── deploy.yml        # Production deployment
│   │   └── seo-audit.yml     # Weekly SEO audit
│   └── CODEOWNERS            # Code ownership
├── public/                     # Static assets
│   ├── fonts/                # Custom fonts
│   ├── images/               # Static images
│   ├── og/                   # OG images
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml           # Auto-generated
├── src/                       # Source code
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   ├── lib/                  # Core utilities
│   ├── server/               # Server-side code
│   ├── hooks/                # Custom hooks
│   ├── interfaces/           # TypeScript interfaces
│   ├── constants/            # Static constants
│   └── types/                # Type declarations
├── scripts/                   # Agent scripts
│   ├── scaffold.js           # Scaffold agent
│   ├── content.js            # Content agent
│   ├── seo-audit.js          # SEO agent
│   └── deploy.js             # Deploy agent
├── content/                   # Content drafts (optional)
│   └── drafts/               # Unpublished content
├── .env.local                 # Environment variables
├── .env.example               # Env template
├── eslint.config.mjs          # ESLint configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Source Directory (src/)

### App Directory (Next.js App Router)

```
src/app/
├── (public)/                  # Public routes group
│   ├── layout.tsx            # Public layout (Header + Footer)
│   ├── page.tsx              # Home page
│   ├── articles/             # Blog articles
│   │   ├── page.tsx          # Articles list
│   │   └── [slug]/           # Individual article
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── not-found.tsx
│   ├── series/               # Article series
│   │   ├── page.tsx          # Series list
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── notes/                # Knowledge notes
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── logs/                 # Learning logs
│   │   ├── page.tsx
│   │   └── [date]/
│   │       └── page.tsx
│   ├── about/                # About page
│   │   └── page.tsx
│   ├── projects/             # Projects page
│   │   └── page.tsx
│   └── contact/              # Contact page
│       └── page.tsx
│
├── (admin)/                   # Admin routes group
│   ├── layout.tsx            # Admin layout (Sidebar + Topbar)
│   ├── admin/                # Admin dashboard
│   │   ├── page.tsx          # Dashboard home
│   │   ├── content/          # Content management
│   │   │   ├── page.tsx      # Content list
│   │   │   ├── new/
│   │   │   │   └── page.tsx  # New content
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Edit content
│   │   ├── media/            # Media management
│   │   │   └── page.tsx
│   │   └── settings/         # Site settings
│   │       └── page.tsx
│   └── login/                # Admin login
│       └── page.tsx
│
├── api/                       # API routes
│   ├── revalidate/
│   │   └── route.ts          # On-demand revalidation
│   ├── like/
│   │   └── [slug]/
│   │       └── route.ts      # Like counter
│   ├── subscribe/
│   │   └── route.ts          # Newsletter subscription
│   └── og/
│       └── [slug]/
│           └── route.tsx     # OG image generation
│
├── globals.css                # Global styles
├── layout.tsx                 # Root layout
├── not-found.tsx              # Global 404
├── error.tsx                  # Global error
└── sitemap.ts                 # Sitemap generator
```

### Components Directory

```
src/components/
├── ui/                        # Base UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── tooltip.tsx
│   ├── popover.tsx
│   └── dialog.tsx
│
├── content/                   # Content display components
│   ├── ArticleCard.tsx        # Article preview card
│   ├── ArticleBody.tsx        # Article content renderer
│   ├── ArticleHeader.tsx      # Article title + meta
│   ├── SeriesNav.tsx          # Series navigation
│   ├── TableOfContents.tsx    # TOC sidebar
│   ├── CodeBlock.tsx          # Syntax highlighted code
│   ├── NoteCard.tsx           # Note preview
│   └── LogEntry.tsx           # Log entry display
│
├── interactive/               # Client components
│   ├── LikeButton.tsx         # Like with optimistic update
│   ├── ShareButton.tsx        # Share menu
│   ├── CopyButton.tsx         # Copy to clipboard
│   ├── ThemeToggle.tsx        # Dark/light toggle
│   ├── NewsletterForm.tsx     # Newsletter signup
│   ├── ContactForm.tsx        # Contact form
│   └── SearchCommand.tsx      # Command palette search
│
├── layout/                    # Layout components
│   ├── Header.tsx             # Site header
│   ├── Footer.tsx             # Site footer
│   ├── Sidebar.tsx            # Admin sidebar
│   ├── Topbar.tsx             # Admin topbar
│   ├── NavLink.tsx            # Navigation link
│   └── PageHeader.tsx         # Page title + breadcrumb
│
├── admin/                     # Admin-specific components
│   ├── ContentEditor.tsx      # Markdown editor
│   ├── ContentPreview.tsx     # Live preview
│   ├── ContentList.tsx        # Content table
│   ├── MediaUploader.tsx      # Image upload
│   └── SettingsForm.tsx       # Settings form
│
└── seo/                       # SEO components
    ├── StructuredData.tsx     # JSON-LD
    └── OpenGraph.tsx          # OG meta tags
```

### Lib Directory

```
src/lib/
├── db/                        # Database utilities
│   ├── connect.ts             # MongoDB connection
│   ├── models/                # Mongoose models (optional)
│   │   ├── content.ts
│   │   ├── stats.ts
│   │   └── user.ts
│   └── seed.ts                # Database seeding
│
├── markdown/                  # Markdown processing
│   ├── parse.ts               # MD → HTML
│   ├── toc.ts                 # Extract headings
│   ├── rehype/                # Rehype plugins
│   │   ├── syntax.ts          # Syntax highlighting
│   │   └── links.ts           # External link handling
│   └── remark/                # Remark plugins
│       └── embed.ts           # Embed handling
│
├── auth/                      # Authentication
│   ├── session.ts             # Session management
│   ├── middleware.ts          # Auth middleware
│   └── hash.ts                # Password hashing
│
└── utils.ts                   # General utilities
    // cn(), formatDate(), slugify(), etc.
```

### Server Directory

```
src/server/
├── actions/                   # Server actions
│   ├── content.ts             # Content CRUD
│   ├── like.ts                # Like action
│   ├── subscribe.ts           # Newsletter action
│   └── auth.ts                # Auth actions
│
└── queries/                   # Database queries
    ├── content.ts             # Content queries
    ├── stats.ts               # Stats queries
    └── user.ts                # User queries
```

### Other Directories

```
src/hooks/                     # Custom hooks
├── useScrollPosition.ts
├── useLocalStorage.ts
├── useTheme.ts
└── useIntersectionObserver.ts

src/interfaces/                # TypeScript interfaces
├── content.ts                 # IArticle, ISeries, etc.
├── stats.ts                   # IPageStats
├── user.ts                    # IUser
├── api.ts                     # IApiResponse
└── index.ts                   # Re-exports

src/constants/                 # Constants
├── siteConfig.ts              # Site metadata
├── navigation.ts              # Nav links
└── contentTypes.ts            # Content type definitions

src/types/                     # Type declarations
├── global.d.ts                # Global types
└── env.d.ts                   # Env variables
```

---

## Configuration Files

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true,
        ppr: true  // Partial Prerendering
    },
    images: {
        remotePatterns: [
            { hostname: 'res.cloudinary.com' },
            { hostname: 'images.unsplash.com' }
        ]
    }
};

export default nextConfig;
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

const config: Config = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)'],
                mono: ['var(--font-mono)']
            },
            colors: {
                border: 'hsl(var(--border))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                }
            }
        }
    },
    plugins: [typography, animate]
};

export default config;
```

---

## Environment Variables

### .env.example

```bash
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
AUTH_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com

# Revalidation
REVALIDATE_SECRET=your-revalidate-secret

# External Services
CLOUDINARY_URL=cloudinary://...
RESEND_API_KEY=re_...

# Analytics (optional)
PLAUSIBLE_DOMAIN=aadityahasabnis.site

# Environment
NODE_ENV=development
```

---

*Version: 1.0*  
*Project: AadityaHasabnis.site*
