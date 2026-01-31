/**
 * Seed Script - Populate database with sample content
 * 
 * Run with: npx tsx scripts/seed.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aadityahasabnis:Password123@personal-site.mkduq9g.mongodb.net/portfolio?appName=personal-site';
const DB_NAME = 'portfolio';

// Sample Articles
const SAMPLE_ARTICLES = [
    {
        type: 'article',
        slug: 'building-a-modern-portfolio-with-nextjs',
        title: 'Building a Modern Portfolio with Next.js 16',
        description: 'A comprehensive guide to creating a fast, SEO-optimized personal website using Next.js App Router, Server Components, and MongoDB.',
        body: `# Building a Modern Portfolio with Next.js 16

Creating a personal website that's both beautiful and performant is easier than ever with Next.js 16. In this article, I'll walk you through the architecture decisions and patterns I used to build this very site.

## Why Next.js?

Next.js has become the go-to framework for React applications, and for good reason:

- **Server Components** reduce client-side JavaScript
- **App Router** provides intuitive file-based routing
- **ISR (Incremental Static Regeneration)** gives you the best of static and dynamic
- **Built-in optimizations** for images, fonts, and more

## Architecture Overview

The site follows a simple but powerful architecture:

1. **Static-first content**: Articles and pages are pre-rendered at build time
2. **Dynamic islands**: Views and likes stream in without blocking the main content
3. **Server Actions**: Form submissions and mutations happen server-side

## Key Patterns

### Server Components by Default

Every component is a Server Component unless it needs interactivity. This drastically reduces the JavaScript bundle sent to the client.

\`\`\`tsx
// This runs on the server - no JS sent to client
const ArticleCard = ({ article }) => {
  return (
    <article>
      <h2>{article.title}</h2>
      <p>{article.description}</p>
    </article>
  );
};
\`\`\`

### Streaming with Suspense

Dynamic data like view counts stream in after the main content:

\`\`\`tsx
<Suspense fallback={<Skeleton />}>
  <Views slug={article.slug} />
</Suspense>
\`\`\`

## Conclusion

Building a modern portfolio doesn't have to be complicated. With the right tools and patterns, you can create something that's fast, maintainable, and beautiful.
`,
        tags: ['Next.js', 'React', 'TypeScript', 'Web Development'],
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
        published: true,
        featured: true,
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        readingTime: 8,
    },
    {
        type: 'article',
        slug: 'mastering-typescript-generics',
        title: 'Mastering TypeScript Generics: A Practical Guide',
        description: 'Learn how to write flexible, reusable TypeScript code using generics with real-world examples and best practices.',
        body: `# Mastering TypeScript Generics

Generics are one of TypeScript's most powerful features. They allow you to write flexible, reusable code while maintaining type safety.

## What Are Generics?

Generics let you create components that work with any type while still catching errors at compile time.

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity(42);      // number
const str = identity("hello"); // string
\`\`\`

## Generic Constraints

You can constrain generics to only accept certain types:

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length);
}

logLength("hello");  // OK
logLength([1, 2, 3]); // OK
logLength(42);        // Error!
\`\`\`

## Real-World Example: API Response Handler

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();
  return { data, status: response.status };
}

// Usage with full type safety
const users = await fetchData<User[]>('/api/users');
\`\`\`

## Conclusion

Generics might seem intimidating at first, but they're essential for writing maintainable TypeScript code.
`,
        tags: ['TypeScript', 'JavaScript', 'Programming'],
        coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop',
        published: true,
        featured: true,
        publishedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-20'),
        readingTime: 6,
    },
    {
        type: 'article',
        slug: 'react-server-components-deep-dive',
        title: 'React Server Components: A Deep Dive',
        description: 'Understanding the paradigm shift in React development with Server Components and how they change the way we build applications.',
        body: `# React Server Components: A Deep Dive

React Server Components (RSC) represent a fundamental shift in how we think about React applications. Let's explore what they are and why they matter.

## The Problem with Traditional React

Traditional React apps suffer from a few issues:

1. **Large bundle sizes** - All component code ships to the client
2. **Waterfalls** - Data fetching often happens after rendering
3. **Client-side overhead** - Hydration can be slow on low-end devices

## Enter Server Components

Server Components run only on the server:

- Zero impact on bundle size
- Direct access to backend resources
- Automatic code splitting

## Server vs Client Components

\`\`\`tsx
// Server Component (default)
const ArticleList = async () => {
  const articles = await db.articles.findMany();
  return <ul>{articles.map(a => <li key={a.id}>{a.title}</li>)}</ul>;
};

// Client Component
'use client';
const LikeButton = () => {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
};
\`\`\`

## Best Practices

1. **Default to Server Components** - Only use 'use client' when needed
2. **Push client boundaries down** - Keep client components as leaves
3. **Use composition** - Pass Server Components as children to Client Components

## Conclusion

Server Components aren't just a new feature - they're a new way of thinking about React applications.
`,
        tags: ['React', 'Next.js', 'Web Development'],
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
        published: true,
        featured: false,
        publishedAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-25'),
        readingTime: 7,
    },
];

// Sample Notes
const SAMPLE_NOTES = [
    {
        type: 'note',
        slug: 'til-css-has-selector',
        title: 'TIL: The CSS :has() Selector',
        description: 'Finally, a parent selector in CSS! The :has() pseudo-class lets you style elements based on their children.',
        body: `The \`:has()\` selector is a game-changer for CSS:

\`\`\`css
/* Style a card that contains an image */
.card:has(img) {
  padding: 0;
}

/* Style a form with invalid inputs */
form:has(:invalid) {
  border-color: red;
}
\`\`\`

Browser support is now excellent across all modern browsers.`,
        tags: ['CSS', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-28'),
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28'),
    },
    {
        type: 'note',
        slug: 'git-amend-without-editing',
        title: 'Git: Amend Without Editing Message',
        description: 'Quick tip for amending the last commit without changing the commit message.',
        body: `To add changes to the last commit without editing the message:

\`\`\`bash
git commit --amend --no-edit
\`\`\`

Useful when you forgot to add a file or made a quick fix.`,
        tags: ['Git', 'CLI', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-26'),
        createdAt: new Date('2024-01-26'),
        updatedAt: new Date('2024-01-26'),
    },
    {
        type: 'note',
        slug: 'typescript-satisfies-operator',
        title: 'TypeScript: The satisfies Operator',
        description: 'Using satisfies for better type inference while still validating types.',
        body: `The \`satisfies\` operator validates a type without widening it:

\`\`\`typescript
const config = {
  port: 3000,
  host: 'localhost'
} satisfies Record<string, string | number>;

// config.port is number, not string | number!
\`\`\`

This gives you both validation AND precise inference.`,
        tags: ['TypeScript', 'TIL'],
        published: true,
        publishedAt: new Date('2024-01-24'),
        createdAt: new Date('2024-01-24'),
        updatedAt: new Date('2024-01-24'),
    },
];

// Sample Page Stats
const SAMPLE_STATS = [
    { slug: 'building-a-modern-portfolio-with-nextjs', views: 1247, likes: 89, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'mastering-typescript-generics', views: 892, likes: 67, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'react-server-components-deep-dive', views: 534, likes: 45, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'til-css-has-selector', views: 234, likes: 23, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'git-amend-without-editing', views: 189, likes: 15, createdAt: new Date(), updatedAt: new Date() },
    { slug: 'typescript-satisfies-operator', views: 312, likes: 28, createdAt: new Date(), updatedAt: new Date() },
];

// Sample Projects
const SAMPLE_PROJECTS = [
    {
        slug: 'personal-website',
        title: 'Personal Website',
        description: 'A fast, minimal, SEO-first personal knowledge system built with Next.js, MongoDB, and Tailwind CSS.',
        longDescription: 'This website showcases my work and writing. Built with Next.js 16 App Router, featuring Server Components, ISR, and streaming for optimal performance.',
        tags: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS'],
        github: 'https://github.com/aadityahasabnis/portfolio',
        live: 'https://aadityahasabnis.site',
        featured: true,
        status: 'active',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-30'),
    },
    {
        slug: 'react-component-library',
        title: 'React Component Library',
        description: 'A collection of reusable, accessible React components with TypeScript support and Storybook documentation.',
        longDescription: 'Built with accessibility in mind, this component library provides a solid foundation for React applications.',
        tags: ['React', 'TypeScript', 'Storybook', 'Accessibility'],
        github: 'https://github.com/aadityahasabnis/react-components',
        featured: true,
        status: 'active',
        order: 2,
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        slug: 'cli-productivity-tools',
        title: 'CLI Productivity Tools',
        description: 'A suite of command-line tools to automate repetitive development tasks and boost productivity.',
        tags: ['Node.js', 'CLI', 'Automation'],
        github: 'https://github.com/aadityahasabnis/cli-tools',
        featured: false,
        status: 'active',
        order: 3,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-12-01'),
    },
    {
        slug: 'markdown-editor',
        title: 'Markdown Editor',
        description: 'A minimal, distraction-free markdown editor with live preview and syntax highlighting.',
        tags: ['React', 'Markdown', 'Editor'],
        github: 'https://github.com/aadityahasabnis/md-editor',
        live: 'https://md-editor.aadityahasabnis.site',
        featured: false,
        status: 'wip',
        order: 4,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
    },
];

async function seed() {
    console.log('🌱 Seeding database...\n');

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);

    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await db.collection('content').deleteMany({});
        await db.collection('pageStats').deleteMany({});
        await db.collection('projects').deleteMany({});

        // Insert articles
        console.log('📝 Inserting articles...');
        await db.collection('content').insertMany(SAMPLE_ARTICLES);
        console.log(`   ✓ Inserted ${SAMPLE_ARTICLES.length} articles`);

        // Insert notes
        console.log('📌 Inserting notes...');
        await db.collection('content').insertMany(SAMPLE_NOTES);
        console.log(`   ✓ Inserted ${SAMPLE_NOTES.length} notes`);

        // Insert projects
        console.log('🚀 Inserting projects...');
        await db.collection('projects').insertMany(SAMPLE_PROJECTS);
        console.log(`   ✓ Inserted ${SAMPLE_PROJECTS.length} projects`);

        // Insert page stats
        console.log('📊 Inserting page stats...');
        await db.collection('pageStats').insertMany(SAMPLE_STATS);
        console.log(`   ✓ Inserted ${SAMPLE_STATS.length} stats records`);

        // Create indexes
        console.log('🔍 Creating indexes...');
        await db.collection('content').createIndex({ slug: 1 }, { unique: true });
        await db.collection('content').createIndex({ type: 1, published: 1, publishedAt: -1 });
        await db.collection('content').createIndex({ type: 1, featured: 1 });
        await db.collection('content').createIndex({ tags: 1 });
        await db.collection('pageStats').createIndex({ slug: 1 }, { unique: true });
        await db.collection('projects').createIndex({ slug: 1 }, { unique: true });
        await db.collection('projects').createIndex({ featured: 1, order: 1 });
        console.log('   ✓ Indexes created');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - ${SAMPLE_ARTICLES.length} articles`);
        console.log(`   - ${SAMPLE_NOTES.length} notes`);
        console.log(`   - ${SAMPLE_PROJECTS.length} projects`);
        console.log(`   - ${SAMPLE_STATS.length} page stats`);
        console.log('\n🚀 You can now start the dev server: pnpm dev');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

seed().catch(console.error);
