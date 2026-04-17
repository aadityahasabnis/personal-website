/**
 * Canonical Seed Script
 *
 * Seeds all current collections with schema-valid sample data:
 * - admins
 * - topics
 * - subtopics
 * - content (article/blog/project)
 * - pageStats
 * - comments
 * - subscribers
 * - contacts
 * - media
 *
 * Usage:
 * npx tsx src/scripts/seed.ts
 * npx tsx src/scripts/seed.ts --no-drop
 * npx tsx src/scripts/seed.ts --adminEmail=admin@example.com --adminPassword=Admin@123 --adminName="Admin User"
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

import { MEDIA_FILE_TYPES, MEDIA_FOLDERS } from '@/constants/mediaConstants';
import { CONTACT_STATUS, CONTENT_TYPES, OPEN_GRAPH_TYPES, PROJECT_STATUS, PUBLISH_STATUS } from '@/constants/schemaConstants';
import Admin from '@/server/models/Admin';
import Comment from '@/server/models/Comment';
import Contact from '@/server/models/Contact';
import Content from '@/server/models/Content';
import Media from '@/server/models/Media';
import PageStats from '@/server/models/PageStats';
import Subscriber from '@/server/models/Subscriber';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';

const DAY_MS = 24 * 60 * 60 * 1000;

const ENV_FILES = ['.env.local', '.env'];

const loadEnvFile = (fileName: string): void => {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const equalsIndex = line.indexOf('=');
        if (equalsIndex <= 0) continue;

        const key = line.slice(0, equalsIndex).trim();
        const valueRaw = line.slice(equalsIndex + 1).trim();
        if (!key || process.env[key] !== undefined) continue;

        const value = valueRaw.replace(/^['\"]|['\"]$/g, '');
        process.env[key] = value;
    }
};

const bootstrapEnv = (): void => {
    for (const envFile of ENV_FILES) {
        loadEnvFile(envFile);
    }
};

bootstrapEnv();

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = process.env.DB_NAME || 'portfolio';

const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY_MS);

const getArg = (name: string, fallback: string): string => {
    const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
    if (arg) return arg.slice(arg.indexOf('=') + 1);
    return process.env[`SEED_${name.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`] ?? fallback;
};

const shouldDropDatabase = !process.argv.includes('--no-drop');

const ADMIN_EMAIL = getArg('adminEmail', 'aaditya.hasabnis@gmail.com');
const ADMIN_PASSWORD = getArg('adminPassword', 'Admin@123');
const ADMIN_NAME = getArg('adminName', 'Aaditya Hasabnis');

type TopicKey = 'dsa' | 'web-development' | 'devops';
type SubtopicKey =
    | 'dsa-fundamentals'
    | 'dsa-patterns'
    | 'web-react'
    | 'web-nextjs'
    | 'devops-docker'
    | 'devops-cicd';

const topicSeeds: Array<{
    key: TopicKey;
    slug: string;
    title: string;
    description: string;
    order: number;
    featured: boolean;
    published: boolean;
}> = [
    {
        key: 'dsa',
        slug: 'dsa',
        title: 'Data Structures & Algorithms',
        description: 'Foundational problem solving, complexity analysis, and interview-grade coding patterns.',
        order: 0,
        featured: true,
        published: true,
    },
    {
        key: 'web-development',
        slug: 'web-development',
        title: 'Web Development',
        description: 'Modern React and Next.js engineering patterns for production-grade applications.',
        order: 1,
        featured: true,
        published: true,
    },
    {
        key: 'devops',
        slug: 'devops',
        title: 'DevOps & Platform',
        description: 'Delivery pipelines, containerization, and deployment strategy for reliable shipping.',
        order: 2,
        featured: false,
        published: true,
    },
];

const subtopicSeeds: Array<{
    key: SubtopicKey;
    topicKey: TopicKey;
    slug: string;
    title: string;
    description: string;
    order: number;
    published: boolean;
}> = [
    {
        key: 'dsa-fundamentals',
        topicKey: 'dsa',
        slug: 'fundamentals',
        title: 'Fundamentals',
        description: 'Core concepts, complexity, and baseline data structures.',
        order: 0,
        published: true,
    },
    {
        key: 'dsa-patterns',
        topicKey: 'dsa',
        slug: 'patterns',
        title: 'Problem Patterns',
        description: 'Sliding window, two pointers, prefix sums, and more.',
        order: 1,
        published: true,
    },
    {
        key: 'web-react',
        topicKey: 'web-development',
        slug: 'react',
        title: 'React',
        description: 'Component architecture, hooks, and rendering strategy.',
        order: 0,
        published: true,
    },
    {
        key: 'web-nextjs',
        topicKey: 'web-development',
        slug: 'nextjs',
        title: 'Next.js',
        description: 'App Router, streaming, caching, and server actions.',
        order: 1,
        published: true,
    },
    {
        key: 'devops-docker',
        topicKey: 'devops',
        slug: 'docker',
        title: 'Docker',
        description: 'Container fundamentals and image/build hygiene.',
        order: 0,
        published: true,
    },
    {
        key: 'devops-cicd',
        topicKey: 'devops',
        slug: 'ci-cd',
        title: 'CI/CD',
        description: 'Automation pipelines, checks, and release confidence.',
        order: 1,
        published: true,
    },
];

const articleSeeds: Array<{
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    topicKey: TopicKey;
    subtopicKey: SubtopicKey;
    order: number;
    featured: boolean;
    publishStatus: 'draft' | 'published';
    readingTime: number;
}> = [
    {
        slug: 'big-o-notation-explained',
        title: 'Big O Notation Explained',
        description: 'Practical complexity analysis for everyday algorithm design.',
        body: '# Big O Notation Explained\n\nComplexity helps you reason about scaling behavior before production pain arrives.',
        tags: ['dsa', 'algorithms', 'complexity'],
        topicKey: 'dsa',
        subtopicKey: 'dsa-fundamentals',
        order: 0,
        featured: true,
        publishStatus: 'published',
        readingTime: 6,
    },
    {
        slug: 'sliding-window-pattern',
        title: 'Sliding Window Pattern Deep Dive',
        description: 'Efficient fixed and dynamic window techniques for array/string problems.',
        body: '# Sliding Window Pattern\n\nUse incremental updates instead of repeated full-range recomputation.',
        tags: ['dsa', 'patterns'],
        topicKey: 'dsa',
        subtopicKey: 'dsa-patterns',
        order: 1,
        featured: false,
        publishStatus: 'published',
        readingTime: 7,
    },
    {
        slug: 'react-hooks-performance-guide',
        title: 'React Hooks Performance Guide',
        description: 'Where hooks help, where they hurt, and how to measure render churn.',
        body: '# React Hooks Performance Guide\n\nPrefer data-flow clarity first, optimization only with evidence.',
        tags: ['react', 'performance', 'frontend'],
        topicKey: 'web-development',
        subtopicKey: 'web-react',
        order: 0,
        featured: true,
        publishStatus: 'published',
        readingTime: 8,
    },
    {
        slug: 'nextjs-cache-invalidation-strategies',
        title: 'Next.js Cache Invalidation Strategies',
        description: 'How to use route-level revalidation and deterministic content freshness.',
        body: '# Next.js Cache Invalidation\n\nTreat cache invalidation as a product requirement, not a deployment side-effect.',
        tags: ['nextjs', 'cache', 'ssg', 'isr'],
        topicKey: 'web-development',
        subtopicKey: 'web-nextjs',
        order: 1,
        featured: true,
        publishStatus: 'published',
        readingTime: 9,
    },
    {
        slug: 'docker-multi-stage-builds',
        title: 'Docker Multi-Stage Builds',
        description: 'Smaller, safer production images using build/runtime separation.',
        body: '# Docker Multi-Stage Builds\n\nSplit dependency compilation from runtime delivery for cleaner artifacts.',
        tags: ['docker', 'devops'],
        topicKey: 'devops',
        subtopicKey: 'devops-docker',
        order: 0,
        featured: false,
        publishStatus: 'published',
        readingTime: 6,
    },
    {
        slug: 'github-actions-release-pipeline',
        title: 'GitHub Actions Release Pipeline',
        description: 'Build, test, and deploy workflows with policy-enforced merge gates.',
        body: '# GitHub Actions Release Pipeline\n\nMake CI predictable by narrowing workflow responsibilities and failure blast radius.',
        tags: ['github-actions', 'ci-cd'],
        topicKey: 'devops',
        subtopicKey: 'devops-cicd',
        order: 1,
        featured: false,
        publishStatus: 'draft',
        readingTime: 7,
    },
];

const blogSeeds: Array<{
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    featured: boolean;
    publishStatus: 'draft' | 'published';
    readingTime: number;
}> = [
    {
        slug: 'cache-invalidation',
        title: 'Cache Invalidation Notes from Production Incidents',
        description: 'Pragmatic lessons from stale reads and race conditions in real systems.',
        body: '# Cache Invalidation Notes\n\nEvery stale read has a user-facing cost. Model freshness intentionally.',
        tags: ['cache', 'incident', 'backend'],
        featured: true,
        publishStatus: 'published',
        readingTime: 5,
    },
    {
        slug: 'shipping-with-confidence',
        title: 'Shipping with Confidence',
        description: 'Reducing release anxiety with deterministic checks and observability baselines.',
        body: '# Shipping with Confidence\n\nFast release cycles need strong rollback and clear runtime signals.',
        tags: ['release', 'quality'],
        featured: false,
        publishStatus: 'published',
        readingTime: 4,
    },
    {
        slug: 'draft-notes-on-agentic-workflows',
        title: 'Draft Notes on Agentic Workflows',
        description: 'Early thinking on task decomposition and review loops.',
        body: '# Draft Notes\n\nWork in progress on practical agent collaboration patterns.',
        tags: ['ai', 'workflow'],
        featured: false,
        publishStatus: 'draft',
        readingTime: 3,
    },
];

const projectSeeds: Array<{
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    status: string;
    order: number;
    featured: boolean;
    publishStatus: 'draft' | 'published';
    readingTime: number;
}> = [
    {
        slug: 'portfolio-rebuild',
        title: 'Portfolio Rebuild',
        description: 'A static-first personal platform with modular server actions and CMS workflows.',
        body: '# Portfolio Rebuild\n\nNext.js App Router system focused on SEO, ISR, and maintainable backend contracts.',
        tags: ['nextjs', 'mongodb', 'typescript'],
        techStack: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS'],
        githubUrl: 'https://github.com/aadityahasabnis/personal-website',
        liveUrl: 'https://aadityahasabnis.com',
        status: PROJECT_STATUS.LIVE,
        order: 0,
        featured: true,
        publishStatus: 'published',
        readingTime: 6,
    },
    {
        slug: 'query-profiler',
        title: 'Query Profiler Toolkit',
        description: 'Scripts and diagnostics for query-plan verification and index hardening.',
        body: '# Query Profiler Toolkit\n\nWorkflow for spotting in-memory sorts and validating index strategy.',
        tags: ['performance', 'mongodb'],
        techStack: ['Node.js', 'MongoDB', 'TypeScript'],
        githubUrl: 'https://github.com/aadityahasabnis/query-profiler-toolkit',
        liveUrl: null,
        status: PROJECT_STATUS.IN_PROGRESS,
        order: 1,
        featured: false,
        publishStatus: 'published',
        readingTime: 5,
    },
    {
        slug: 'design-system-lab',
        title: 'Design System Lab',
        description: 'Reusable token-driven component primitives for consistent product UI.',
        body: '# Design System Lab\n\nExploration of semantic tokens, component variants, and accessibility defaults.',
        tags: ['design-system', 'ui'],
        techStack: ['React', 'TypeScript'],
        githubUrl: null,
        liveUrl: null,
        status: PROJECT_STATUS.ARCHIVED,
        order: 2,
        featured: false,
        publishStatus: 'draft',
        readingTime: 4,
    },
];

const buildSeo = (title: string, description: string, keywords: string[], ogImage: string | null = null) => ({
    title,
    description,
    keywords,
    ogImage,
    ogType: OPEN_GRAPH_TYPES.ARTICLE,
    canonicalUrl: null,
    noIndex: false,
});

async function syncAllIndexes(): Promise<void> {
    await Promise.all([
        Admin.syncIndexes(),
        Topic.syncIndexes(),
        Subtopic.syncIndexes(),
        Content.syncIndexes(),
        PageStats.syncIndexes(),
        Comment.syncIndexes(),
        Subscriber.syncIndexes(),
        Contact.syncIndexes(),
        Media.syncIndexes(),
    ]);
}

async function clearAllCollections(): Promise<void> {
    await Promise.all([
        Media.deleteMany({}),
        Contact.deleteMany({}),
        Subscriber.deleteMany({}),
        Comment.deleteMany({}),
        PageStats.deleteMany({}),
        Content.deleteMany({}),
        Subtopic.deleteMany({}),
        Topic.deleteMany({}),
        Admin.deleteMany({}),
    ]);
}

async function seed(): Promise<void> {
    console.log('🌱 Starting canonical seed...');

    if (!MONGODB_URI || !(MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
        throw new Error('Missing or invalid MONGODB_URI. Set it in .env.local (or .env), or pass it inline before running the seed script.');
    }

    await mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection is not available');

    if (shouldDropDatabase) {
        console.log('🗑️ Dropping database before seed...');
        await db.dropDatabase();
    } else {
        console.log('🧹 Clearing seeded collections...');
        await clearAllCollections();
    }

    console.log('🔍 Syncing indexes from models...');
    await syncAllIndexes();

    console.log('👤 Creating admin...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await Admin.create({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash,
        lastLoginAt: null,
        recoveryEmail: null,
        image: null,
    });

    const publishedArticles = articleSeeds.filter((seed) => seed.publishStatus === PUBLISH_STATUS.PUBLISHED);

    const topicContentCountByKey = new Map<TopicKey, number>();
    for (const seed of topicSeeds) topicContentCountByKey.set(seed.key, 0);
    for (const seed of publishedArticles) {
        topicContentCountByKey.set(seed.topicKey, (topicContentCountByKey.get(seed.topicKey) ?? 0) + 1);
    }

    const subtopicCountByTopicKey = new Map<TopicKey, number>();
    for (const seed of topicSeeds) subtopicCountByTopicKey.set(seed.key, 0);
    for (const seed of subtopicSeeds) {
        if (!seed.published) continue;
        subtopicCountByTopicKey.set(seed.topicKey, (subtopicCountByTopicKey.get(seed.topicKey) ?? 0) + 1);
    }

    const subtopicContentCountByKey = new Map<SubtopicKey, number>();
    for (const seed of subtopicSeeds) subtopicContentCountByKey.set(seed.key, 0);
    for (const seed of publishedArticles) {
        subtopicContentCountByKey.set(seed.subtopicKey, (subtopicContentCountByKey.get(seed.subtopicKey) ?? 0) + 1);
    }

    console.log('📂 Creating topics...');
    const topics = await Topic.insertMany(
        topicSeeds.map((seed) => ({
            slug: seed.slug,
            title: seed.title,
            description: seed.description,
            coverImage: null,
            order: seed.order,
            published: seed.published,
            featured: seed.featured,
            subTopicCount: subtopicCountByTopicKey.get(seed.key) ?? 0,
            contentCount: topicContentCountByKey.get(seed.key) ?? 0,
            createdAt: daysAgo(120),
            updatedAt: daysAgo(4),
        })),
    );

    const topicIdByKey = new Map<TopicKey, mongoose.Types.ObjectId>();
    topicSeeds.forEach((seed, idx) => {
        topicIdByKey.set(seed.key, topics[idx]._id);
    });

    console.log('📁 Creating subtopics...');
    const subtopics = await Subtopic.insertMany(
        subtopicSeeds.map((seed) => ({
            topicId: topicIdByKey.get(seed.topicKey),
            slug: seed.slug,
            title: seed.title,
            description: seed.description,
            order: seed.order,
            published: seed.published,
            contentCount: subtopicContentCountByKey.get(seed.key) ?? 0,
            createdAt: daysAgo(110),
            updatedAt: daysAgo(3),
        })),
    );

    const subtopicIdByKey = new Map<SubtopicKey, mongoose.Types.ObjectId>();
    subtopicSeeds.forEach((seed, idx) => {
        subtopicIdByKey.set(seed.key, subtopics[idx]._id);
    });

    console.log('📝 Creating content (articles/blogs/projects)...');
    const contentDocs = await Content.insertMany([
        ...articleSeeds.map((seed, index) => ({
            type: CONTENT_TYPES.ARTICLE,
            slug: seed.slug,
            title: seed.title,
            description: seed.description,
            body: seed.body,
            tags: seed.tags,
            coverImage: null,
            readingTime: seed.readingTime,
            publishStatus: seed.publishStatus,
            publishedAt: seed.publishStatus === PUBLISH_STATUS.PUBLISHED ? daysAgo(40 - index) : null,
            featured: seed.featured,
            seo: buildSeo(seed.title, seed.description, seed.tags),
            createdBy: admin._id,
            updatedBy: admin._id,
            topicId: topicIdByKey.get(seed.topicKey),
            subtopicId: subtopicIdByKey.get(seed.subtopicKey) ?? null,
            order: seed.order,
            createdAt: daysAgo(70 - index),
            updatedAt: daysAgo(5),
        })),
        ...blogSeeds.map((seed, index) => ({
            type: CONTENT_TYPES.BLOG,
            slug: seed.slug,
            title: seed.title,
            description: seed.description,
            body: seed.body,
            tags: seed.tags,
            coverImage: null,
            readingTime: seed.readingTime,
            publishStatus: seed.publishStatus,
            publishedAt: seed.publishStatus === PUBLISH_STATUS.PUBLISHED ? daysAgo(20 - index) : null,
            featured: seed.featured,
            seo: buildSeo(seed.title, seed.description, seed.tags),
            createdBy: admin._id,
            updatedBy: admin._id,
            createdAt: daysAgo(30 - index),
            updatedAt: daysAgo(2),
        })),
        ...projectSeeds.map((seed, index) => ({
            type: CONTENT_TYPES.PROJECT,
            slug: seed.slug,
            title: seed.title,
            description: seed.description,
            body: seed.body,
            tags: seed.tags,
            coverImage: null,
            readingTime: seed.readingTime,
            publishStatus: seed.publishStatus,
            publishedAt: seed.publishStatus === PUBLISH_STATUS.PUBLISHED ? daysAgo(10 - index) : null,
            featured: seed.featured,
            seo: buildSeo(seed.title, seed.description, seed.tags),
            createdBy: admin._id,
            updatedBy: admin._id,
            techStack: seed.techStack,
            githubUrl: seed.githubUrl,
            liveUrl: seed.liveUrl,
            demoVideo: null,
            gallery: [],
            status: seed.status,
            startDate: daysAgo(90),
            completedDate: seed.status === PROJECT_STATUS.LIVE ? daysAgo(15) : null,
            order: seed.order,
            createdAt: daysAgo(18 - index),
            updatedAt: daysAgo(1),
        })),
    ]);

    const contentBySlug = new Map<string, (typeof contentDocs)[number]>();
    for (const doc of contentDocs) {
        contentBySlug.set(doc.slug, doc);
    }

    console.log('📈 Creating page stats...');
    const pageStatsPayload = contentDocs.map((doc, index) => {
        const isPublished = doc.publishStatus === PUBLISH_STATUS.PUBLISHED;
        return {
            contentId: doc._id,
            views: isPublished ? 180 + index * 37 : 0,
            likes: isPublished ? 14 + index * 3 : 0,
            lastViewedAt: isPublished ? daysAgo(index % 5) : null,
            createdAt: daysAgo(7),
            updatedAt: daysAgo(1),
        };
    });
    await PageStats.insertMany(pageStatsPayload);

    console.log('💬 Creating comments...');
    const articleA = contentBySlug.get('big-o-notation-explained');
    const blogA = contentBySlug.get('cache-invalidation');
    const projectA = contentBySlug.get('portfolio-rebuild');
    if (!articleA || !blogA || !projectA) {
        throw new Error('Seeded content lookup failed while preparing comments');
    }

    const topLevelArticleComment = await Comment.create({
        contentId: articleA._id,
        parentId: null,
        author: {
            name: 'Alex Chen',
            email: 'alex@example.com',
            avatar: 'avatar-1',
            website: null,
            isOwner: false,
        },
        content: 'Great breakdown. The practical complexity examples make this very approachable.',
        upvotes: 12,
        approved: true,
        replyCount: 0,
        ipHash: 'seed-ip-hash-1',
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
    });

    await Comment.create({
        contentId: articleA._id,
        parentId: topLevelArticleComment._id,
        author: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            avatar: 'avatar-3',
            website: null,
            isOwner: true,
        },
        content: 'Thanks! I will add an appendix on recurrence relations next.',
        upvotes: 4,
        approved: true,
        replyCount: 0,
        ipHash: 'seed-ip-hash-owner',
        createdAt: daysAgo(7),
        updatedAt: daysAgo(7),
    });

    await Comment.create({
        contentId: blogA._id,
        parentId: null,
        author: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            avatar: 'avatar-5',
            website: 'https://example.com',
            isOwner: false,
        },
        content: 'Loved the incident-driven framing. Would like a follow-up on cache stampedes.',
        upvotes: 6,
        approved: true,
        replyCount: 0,
        ipHash: 'seed-ip-hash-2',
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
    });

    await Comment.create({
        contentId: projectA._id,
        parentId: null,
        author: {
            name: 'Jordan Miller',
            email: 'jordan@example.com',
            avatar: 'avatar-8',
            website: null,
            isOwner: false,
        },
        content: 'Clean architecture choices. Curious about your ISR invalidation policy.',
        upvotes: 3,
        approved: false,
        replyCount: 0,
        ipHash: 'seed-ip-hash-3',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
    });

    console.log('📮 Creating subscribers...');
    await Subscriber.insertMany([
        {
            email: 'reader.one@example.com',
            name: 'Reader One',
            confirmed: true,
            subscribedAt: daysAgo(60),
            unsubscribedAt: null,
            createdAt: daysAgo(60),
            updatedAt: daysAgo(60),
        },
        {
            email: 'reader.two@example.com',
            name: 'Reader Two',
            confirmed: false,
            subscribedAt: daysAgo(25),
            unsubscribedAt: null,
            createdAt: daysAgo(25),
            updatedAt: daysAgo(25),
        },
        {
            email: 'reader.three@example.com',
            name: 'Reader Three',
            confirmed: true,
            subscribedAt: daysAgo(50),
            unsubscribedAt: daysAgo(12),
            createdAt: daysAgo(50),
            updatedAt: daysAgo(12),
        },
    ]);

    console.log('📨 Creating contacts...');
    await Contact.insertMany([
        {
            name: 'Recruiter Team',
            email: 'jobs@example.com',
            subject: 'Interview Opportunity',
            message: 'We would like to schedule a technical interview for a backend engineering role.',
            status: CONTACT_STATUS.NEW,
            ipHash: 'contact-ip-hash-1',
            createdAt: daysAgo(2),
            updatedAt: daysAgo(2),
        },
        {
            name: 'Open Source Maintainer',
            email: 'oss@example.com',
            subject: 'Collaboration Proposal',
            message: 'Would you be interested in contributing to a performance-focused tooling project?',
            status: CONTACT_STATUS.READ,
            ipHash: 'contact-ip-hash-2',
            createdAt: daysAgo(9),
            updatedAt: daysAgo(7),
        },
        {
            name: 'Product Founder',
            email: 'founder@example.com',
            subject: 'Consulting Inquiry',
            message: 'We are looking for architecture guidance on a Next.js migration project.',
            status: CONTACT_STATUS.REPLIED,
            ipHash: 'contact-ip-hash-3',
            createdAt: daysAgo(16),
            updatedAt: daysAgo(12),
        },
    ]);

    console.log('🖼️ Creating media records...');
    await Media.insertMany([
        {
            fileKey: 'articles/cache-invalidation/cover-hero.png',
            publicUrl: 'https://cdn.example.com/articles/cache-invalidation/cover-hero.png',
            fileName: 'cache-invalidation-cover.png',
            fileType: MEDIA_FILE_TYPES.IMAGE,
            mimeType: 'image/png',
            size: 245_120,
            folder: MEDIA_FOLDERS.ARTICLES,
            tags: ['cache', 'blog', 'cover'],
            uploadedBy: admin._id,
            description: 'Hero image for cache invalidation writeup.',
            altText: 'Abstract cache network diagram',
            width: 1600,
            height: 900,
            duration: null,
            createdAt: daysAgo(14),
            updatedAt: daysAgo(14),
        },
        {
            fileKey: 'projects/portfolio-rebuild/screenshot-dashboard.webp',
            publicUrl: 'https://cdn.example.com/projects/portfolio-rebuild/screenshot-dashboard.webp',
            fileName: 'portfolio-dashboard.webp',
            fileType: MEDIA_FILE_TYPES.IMAGE,
            mimeType: 'image/webp',
            size: 188_432,
            folder: MEDIA_FOLDERS.PROJECTS,
            tags: ['project', 'dashboard'],
            uploadedBy: admin._id,
            description: 'Admin dashboard snapshot.',
            altText: 'CMS dashboard screen',
            width: 1440,
            height: 900,
            duration: null,
            createdAt: daysAgo(11),
            updatedAt: daysAgo(11),
        },
        {
            fileKey: 'documents/portfolio-architecture.pdf',
            publicUrl: 'https://cdn.example.com/documents/portfolio-architecture.pdf',
            fileName: 'portfolio-architecture.pdf',
            fileType: MEDIA_FILE_TYPES.FILE,
            mimeType: 'application/pdf',
            size: 502_112,
            folder: MEDIA_FOLDERS.DOCUMENTS,
            tags: ['architecture', 'reference'],
            uploadedBy: admin._id,
            description: 'Architecture overview reference document.',
            altText: null,
            width: null,
            height: null,
            duration: null,
            createdAt: daysAgo(6),
            updatedAt: daysAgo(6),
        },
    ]);

    const [topicCount, subtopicCount, contentCount, pageStatsCount, commentCount, subscriberCount, contactCount, mediaCount, adminCount] = await Promise.all([
        Topic.countDocuments(),
        Subtopic.countDocuments(),
        Content.countDocuments(),
        PageStats.countDocuments(),
        Comment.countDocuments(),
        Subscriber.countDocuments(),
        Contact.countDocuments(),
        Media.countDocuments(),
        Admin.countDocuments(),
    ]);

    console.log('\n✅ Canonical seed completed successfully!');
    console.log(`   - admins: ${adminCount}`);
    console.log(`   - topics: ${topicCount}`);
    console.log(`   - subtopics: ${subtopicCount}`);
    console.log(`   - content: ${contentCount}`);
    console.log(`   - pageStats: ${pageStatsCount}`);
    console.log(`   - comments: ${commentCount}`);
    console.log(`   - subscribers: ${subscriberCount}`);
    console.log(`   - contacts: ${contactCount}`);
    console.log(`   - media: ${mediaCount}`);
    console.log('\nℹ️ Admin login seed values:');
    console.log(`   - email: ${ADMIN_EMAIL}`);
    console.log(`   - password: ${ADMIN_PASSWORD}`);
}

seed()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Seed failed:', message);
        await mongoose.disconnect();
        process.exit(1);
    });
