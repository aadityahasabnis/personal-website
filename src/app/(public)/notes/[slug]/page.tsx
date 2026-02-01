import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

import { getNote, getAllNoteSlugs } from '@/server/queries/content';
import { getPageStats, getArticleCommentCount } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate, cn, calculateReadingTime } from '@/lib/utils';
import { ArticleBody } from '@/components/content';
import { ContentStats } from '@/components/common/ContentStats';
import { CommentSection } from '@/components/common/CommentSection';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { FadeIn } from '@/components/animation/FadeIn';
import {
    JsonLd,
    generateArticleSchema,
    generateBreadcrumbSchema,
    generateOrganizationSchema,
    combineSchemas,
} from '@/lib/seo';
import { SITE_CONFIG } from '@/constants';

interface INotePageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all notes at build time
export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
    const slugs = await getAllNoteSlugs();
    return slugs.map((slug) => ({ slug }));
};

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export const generateMetadata = async ({ params }: INotePageProps): Promise<Metadata> => {
    const { slug } = await params;
    const note = await getNote(slug);

    if (!note) {
        return { title: 'Note Not Found' };
    }

    const url = `${SITE_CONFIG.url}/notes/${slug}`;
    const seoTitle = note.title;
    const seoDescription = note.description;
    const imageUrl = `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`;

    // Calculate reading time if not present
    const readingTime = note.readingTime || calculateReadingTime(note.body || '');

    // Build keywords
    const keywords = [...(note.tags || []), SITE_CONFIG.author.name, 'notes', 'learning', 'knowledge'];

    return {
        title: seoTitle,
        description: seoDescription,
        keywords: keywords.join(', '),
        authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }],
        creator: SITE_CONFIG.author.name,
        publisher: SITE_CONFIG.author.name,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            type: 'article',
            url,
            siteName: SITE_CONFIG.name,
            locale: 'en_US',
            publishedTime: note.publishedAt?.toISOString(),
            modifiedTime: note.updatedAt?.toISOString(),
            authors: [SITE_CONFIG.author.name],
            tags: keywords,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: seoTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: seoTitle,
            description: seoDescription,
            creator: SITE_CONFIG.seo.twitterHandle,
            site: SITE_CONFIG.seo.twitterHandle,
            images: [imageUrl],
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        // Enhanced metadata with reading time and timestamps
        other: {
            'article:author': SITE_CONFIG.author.name,
            'article:section': 'Notes',
            ...(note.publishedAt && { 'article:published_time': note.publishedAt.toISOString() }),
            ...(note.updatedAt && { 'article:modified_time': note.updatedAt.toISOString() }),
            'article:tag': keywords.join(', '),
            'twitter:label1': 'Reading time',
            'twitter:data1': `${readingTime} min read`,
            'twitter:label2': 'Written by',
            'twitter:data2': SITE_CONFIG.author.name,
        },
    };
};

/**
 * Note Detail Page - Professional Layout with Full Features
 *
 * Features:
 * - Static HTML content served instantly (SSG + ISR)
 * - Fade-in animations for smooth UX
 * - Comprehensive JSON-LD structured data
 * - Views and likes with TanStack Query
 * - Comments section with replies
 * - Scroll-to-top button
 * - Responsive design (mobile, tablet, desktop)
 * - SEO optimized
 */
const NotePage = async ({ params }: INotePageProps) => {
    const { slug } = await params;

    // Fetch note, stats, and comment count in parallel
    const [note, stats, commentCount] = await Promise.all([
        getNote(slug),
        getPageStats(slug),
        getArticleCommentCount(slug),
    ]);

    if (!note) {
        notFound();
    }

    // Parse markdown to HTML
    const htmlContent = note.html ?? (await parseMarkdown(note.body));

    // Build breadcrumbs for SEO
    const breadcrumbs = [
        { label: 'Notes', href: '/notes' },
        { label: note.title, href: `/notes/${slug}` },
    ];

    // Calculate reading time if not present
    const readingTime = note.readingTime || calculateReadingTime(note.body || '');

    // Generate JSON-LD schemas for SEO with comment count
    const articleSchema = generateArticleSchema({
        article: {
            ...note,
            topicSlug: 'notes',
            subtopicSlug: note.tags?.[0] || undefined,
            readingTime,
        } as any,
        topicSlug: 'notes',
        articleSlug: slug,
        topicTitle: 'Notes',
        subtopicTitle: note.tags?.[0],
        commentCount,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(
        breadcrumbs.map((b) => ({ name: b.label, url: `${SITE_CONFIG.url}${b.href}` }))
    );

    const organizationSchema = generateOrganizationSchema();

    const combinedSchemas = combineSchemas(articleSchema, breadcrumbSchema, organizationSchema);

    return (
        <>
            {/* Scroll to Top Button */}
            <ScrollToTop />

            {/* JSON-LD for SEO */}
            <JsonLd data={combinedSchemas} />

            <article className="min-h-screen">
                {/* Header Section */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 md:pt-32 pb-8 md:pb-12">
                    {/* Back Link with Breadcrumb Microdata */}
                    <FadeIn delay={0.1}>
                        <nav 
                            className="mb-6 md:mb-8"
                            itemScope
                            itemType="https://schema.org/BreadcrumbList"
                        >
                            <span
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                            >
                                <Link
                                    href="/notes"
                                    itemProp="item"
                                    className="inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                                >
                                    <ArrowLeft className="size-4" />
                                    <span itemProp="name">Back to notes</span>
                                </Link>
                                <meta itemProp="position" content="1" />
                            </span>
                        </nav>
                    </FadeIn>

                    {/* Type Badge + Tags */}
                    <FadeIn delay={0.2}>
                        <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#9b87f5]/10 text-[#9b87f5] border-2 border-[#9b87f5]/30">
                                📝 Note
                            </span>
                            {note.tags?.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/notes?tag=${encodeURIComponent(tag)}`}
                                    className={cn(
                                        'px-3 py-1 text-xs font-medium rounded-full',
                                        'bg-[var(--surface)] text-[var(--fg-muted)]',
                                        'border-2 border-[var(--border-color)]',
                                        'hover:border-[#9b87f5] hover:text-[#9b87f5]',
                                        'transition-colors'
                                    )}
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </FadeIn>

                    {/* Title */}
                    <FadeIn delay={0.3}>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg)] leading-tight">
                            {note.title}
                        </h1>
                    </FadeIn>

                    {/* Description */}
                    {note.description && (
                        <FadeIn delay={0.4}>
                            <p className="mt-4 md:mt-6 text-base md:text-lg text-[var(--fg-muted)] leading-relaxed">
                                {note.description}
                            </p>
                        </FadeIn>
                    )}

                    {/* Meta */}
                    <FadeIn delay={0.5}>
                        <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6 text-sm text-[var(--fg-muted)]">
                            {note.publishedAt && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <time dateTime={new Date(note.publishedAt).toISOString()}>
                                        {formatDate(note.publishedAt)}
                                    </time>
                                </span>
                            )}
                            {readingTime && (
                                <span className="flex items-center gap-2">
                                    <Clock className="size-4" />
                                    {readingTime} min read
                                </span>
                            )}
                            {note.updatedAt && note.publishedAt && new Date(note.updatedAt) > new Date(note.publishedAt) && (
                                <span className="text-[var(--fg-subtle)]">
                                    (Updated {formatDate(note.updatedAt)})
                                </span>
                            )}
                        </div>
                    </FadeIn>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
                    <FadeIn delay={0.7}>
                        <ArticleBody html={htmlContent} />
                    </FadeIn>

                    {/* Footer with Stats */}
                    <FadeIn delay={0.8}>
                        <footer className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-[var(--border-color)]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-sm md:text-base text-[var(--fg-muted)]">Found this helpful?</p>
                                <ContentStats
                                    slug={slug}
                                    contentType="notes"
                                    initialViews={stats?.views ?? 0}
                                    initialLikes={stats?.likes ?? 0}
                                />
                            </div>
                        </footer>
                    </FadeIn>

                    {/* Comments Section - Animated */}
                    <FadeIn delay={0.9}>
                        <CommentSection slug={slug} contentType="notes" />
                    </FadeIn>
                </div>
            </article>
        </>
    );
};

export default NotePage;
