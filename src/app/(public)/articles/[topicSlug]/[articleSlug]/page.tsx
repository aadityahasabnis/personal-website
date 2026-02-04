import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getArticleByTopicSlug, getAllPublishedArticles } from '@/server/queries/content';
import { getTopic } from '@/server/queries/topics';
import { getSubtopic } from '@/server/queries/subtopics';
import { getArticleStats, getArticleCommentCount } from '@/server/queries/stats';
import { ArticleHeader } from '@/components/content/ArticleHeader';
import { ArticleBody } from '@/components/content/ArticleBody';
import { ContentStats } from '@/components/common/ContentStats';
import { CommentSection } from '@/components/common/CommentSection';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { FadeIn } from '@/components/animation/FadeIn';
import { 
    JsonLd, 
    generateArticleSchema, 
    generateBreadcrumbSchema,
    combineSchemas,
    generateOrganizationSchema,
} from '@/lib/seo';
import { SITE_CONFIG } from '@/constants';

// Static generation
export const revalidate = false;

interface IArticlePageProps {
    params: Promise<{ topicSlug: string; articleSlug: string }>;
}

/**
 * Generate static paths for all articles
 */
export async function generateStaticParams() {
    const articles = await getAllPublishedArticles();
    return articles
        .filter((article) => article.topicSlug && article.slug)
        .map(({ topicSlug, slug }) => ({
            topicSlug,
            articleSlug: slug,
        }));
}

/**
 * Generate comprehensive metadata with enhanced SEO
 */
export async function generateMetadata({
    params,
}: IArticlePageProps): Promise<Metadata> {
    const { topicSlug, articleSlug } = await params;
    const article = await getArticleByTopicSlug(topicSlug, articleSlug);

    if (!article) {
        return {
            title: 'Article Not Found',
        };
    }

    const topic = await getTopic(topicSlug);
    const subtopic = article.subtopicSlug ? await getSubtopic(article.subtopicSlug) : null;

    // Calculate reading time if not present
    const readingTime = article.readingTime || Math.ceil((article.body?.split(/\s+/).length || 0) / 200);

    const seoTitle = article.seo?.title || article.title;
    const seoDescription = article.seo?.description || article.description;
    const url = `${SITE_CONFIG.url}/articles/${topicSlug}/${articleSlug}`;
    const imageUrl = article.seo?.ogImage || article.coverImage || `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`;

    // Build comprehensive keywords
    const keywords = [
        ...(article.seo?.keywords || article.tags || []),
        topic?.title || topicSlug,
        ...(subtopic ? [subtopic.title] : []),
        SITE_CONFIG.author.name,
        'tutorial',
        'guide',
        'learn',
    ];

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
            publishedTime: article.publishedAt?.toISOString(),
            modifiedTime: article.updatedAt?.toISOString(),
            authors: [SITE_CONFIG.author.name],
            tags: keywords,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: seoTitle,
                }
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
            'article:section': topic?.title || topicSlug,
            ...(article.publishedAt && { 'article:published_time': article.publishedAt.toISOString() }),
            ...(article.updatedAt && { 'article:modified_time': article.updatedAt.toISOString() }),
            'article:tag': keywords.join(', '),
            'twitter:label1': 'Reading time',
            'twitter:data1': `${readingTime} min read`,
            'twitter:label2': 'Written by',
            'twitter:data2': SITE_CONFIG.author.name,
        },
    };
}

/**
 * Article Page - Professional Layout with Advanced SEO
 * 
 * Features:
 * - Static HTML content served instantly (SSG)
 * - Fade-in animations for smooth UX
 * - Comprehensive JSON-LD structured data
 * - Semantic HTML for AI scraping
 * - Optimistic UI updates for likes/views
 * - Cached comments with TanStack Query
 * 
 * SEO Strategy:
 * 1. JSON-LD schemas (Article, Breadcrumb, Organization)
 * 2. Semantic HTML5 tags (article, section, aside)
 * 3. Microdata attributes (itemscope, itemprop)
 * 4. Enhanced meta tags (OG, Twitter, keywords)
 * 5. Structured content hierarchy (H1-H6)
 */
export default async function ArticlePage({ params }: IArticlePageProps) {
    const { topicSlug, articleSlug } = await params;
    const fullSlug = `${topicSlug}/${articleSlug}`;

    // Fetch all data in parallel
    const [article, topic, stats, commentCount] = await Promise.all([
        getArticleByTopicSlug(topicSlug, articleSlug),
        getTopic(topicSlug),
        getArticleStats(fullSlug),
        getArticleCommentCount(fullSlug),
    ]);

    if (!article) {
        notFound();
    }

    const subtopic = article.subtopicSlug
        ? await getSubtopic(article.subtopicSlug)
        : null;

    // Build breadcrumbs for navigation and SEO
    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: topic?.title || topicSlug, href: `/articles/${topicSlug}` },
    ];

    if (subtopic) {
        breadcrumbs.push({
            label: subtopic.title,
            href: `/articles/${topicSlug}#${subtopic.slug}`,
        });
    }

    breadcrumbs.push({
        label: article.title,
        href: `/articles/${topicSlug}/${articleSlug}`,
    });

    // Generate JSON-LD schemas for SEO with comment count
    const articleSchema = generateArticleSchema({
        article,
        topicSlug,
        articleSlug,
        topicTitle: topic?.title || topicSlug,
        subtopicTitle: subtopic?.title,
        commentCount,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(
        breadcrumbs.map(b => ({
            name: b.label,
            url: `${SITE_CONFIG.url}${b.href}`,
        }))
    );

    const organizationSchema = generateOrganizationSchema();

    const combinedSchema = combineSchemas(
        articleSchema,
        breadcrumbSchema,
        organizationSchema
    );

    // Use pre-rendered HTML content
    const htmlContent = article.html || '';
    const hasContent = htmlContent.length > 0;

    return (
        <>
            {/* JSON-LD Structured Data */}
            <JsonLd data={combinedSchema} />

            {/* Scroll to Top Button */}
            <ScrollToTop />

            {/* Article Container with Semantic HTML */}
            <article 
                className="article-content"
                itemScope
                itemType="https://schema.org/TechArticle"
            >
                {/* Breadcrumb Navigation - Animated */}
                <FadeIn delay={0.1}>
                    <ArticleHeader
                        breadcrumbs={breadcrumbs}
                        title={article.title}
                        description={article.description}
                        readingTime={article.readingTime}
                        publishedAt={article.publishedAt}
                        updatedAt={article.updatedAt}
                        tags={article.tags}
                    />
                </FadeIn>

                {/* Article Body - Animated */}
                <FadeIn delay={0.3}>
                    {hasContent ? (
                        // Render pre-generated HTML for markdown content
                        <ArticleBody html={htmlContent} />
                    ) : (
                        <div className="prose max-w-none text-[var(--fg-muted)]">
                            <p>This article content is being prepared. Check back soon.</p>
                        </div>
                    )}
                </FadeIn>

                {/* Article Footer - Stats & Engagement - Animated */}
                <FadeIn 
                    as="footer" 
                    delay={0.5}
                    className="mt-12 pt-8 border-t border-[var(--border-color)]"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-[var(--fg-muted)]">
                            Enjoyed this article? Show some love!
                        </p>
                        <ContentStats
                            slug={fullSlug}
                            contentType="articles"
                            initialViews={stats?.views ?? 0}
                            initialLikes={stats?.likes ?? 0}
                        />
                    </div>
                </FadeIn>

                {/* Comments Section - Animated & Lazy Loaded */}
                <FadeIn delay={0.7}>
                    <CommentSection 
                        slug={fullSlug} 
                        contentType="articles"
                    />
                </FadeIn>
            </article>
        </>
    );
}
