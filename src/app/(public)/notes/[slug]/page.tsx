import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getNote, getAllNoteSlugs } from '@/server/queries/content';
import { getPageStats, getArticleCommentCount } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { calculateReadingTime } from '@/lib/utils';
import { NoteHeader } from '@/components/content/NoteHeader';
import { ArticleBody } from '@/components/content/ArticleBody';
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

// Static generation
export const revalidate = false;

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
 * Note Page - Professional Layout Matching Article Page Quality
 * 
 * Features:
 * - Static HTML content served instantly (SSG)
 * - Fade-in animations for smooth UX
 * - Comprehensive JSON-LD structured data
 * - Semantic HTML for AI scraping
 * - Optimistic UI updates for likes/views
 * - Cached comments with TanStack Query
 * - Professional NoteHeader component
 * - Consistent styling with Articles
 * 
 * SEO Strategy:
 * 1. JSON-LD schemas (Article, Breadcrumb, Organization)
 * 2. Semantic HTML5 tags (article, section, header, footer)
 * 3. Microdata attributes (itemscope, itemprop)
 * 4. Enhanced meta tags (OG, Twitter, keywords)
 * 5. Structured content hierarchy
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
            {/* JSON-LD Structured Data */}
            <JsonLd data={combinedSchemas} />

            {/* Scroll to Top Button */}
            <ScrollToTop />

            {/* Article Container with Semantic HTML */}
            <article 
                className="article-content"
                itemScope
                itemType="https://schema.org/TechArticle"
            >
                {/* Note Header - Animated */}
                <FadeIn delay={0.1}>
                    <NoteHeader
                        title={note.title}
                        description={note.description}
                        tags={note.tags}
                        publishedAt={note.publishedAt}
                        updatedAt={note.updatedAt}
                        readingTime={readingTime}
                    />
                </FadeIn>

                {/* Content Section with Consistent Padding */}
                <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-12 md:pb-16">
                    {/* Note Body - Animated */}
                    <FadeIn delay={0.3}>
                        {htmlContent ? (
                            <ArticleBody html={htmlContent} />
                        ) : (
                            <div className="prose max-w-none text-[var(--fg-muted)]">
                                <p>This note content is being prepared. Check back soon.</p>
                            </div>
                        )}
                    </FadeIn>

                    {/* Note Footer - Stats & Engagement - Animated */}
                    <FadeIn 
                        as="footer" 
                        delay={0.5}
                        className="mt-12 pt-8 border-t border-[var(--border-color)]"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-[var(--fg-muted)]">
                                Found this note helpful? Show some love!
                            </p>
                            <ContentStats
                                slug={slug}
                                contentType="notes"
                                initialViews={stats?.views ?? 0}
                                initialLikes={stats?.likes ?? 0}
                            />
                        </div>
                    </FadeIn>

                    {/* Comments Section - Animated & Lazy Loaded */}
                    <FadeIn delay={0.7}>
                        <CommentSection 
                            slug={slug} 
                            contentType="notes"
                        />
                    </FadeIn>
                </div>
            </article>
        </>
    );
};

export default NotePage;
