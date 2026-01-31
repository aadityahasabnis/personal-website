import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

import { getArticle, getAllArticleSlugs } from '@/server/queries/content';
import { getPageStats } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants';

import { ArticleBody, Views, TableOfContents, RelatedPosts, SeriesNavWrapper } from '@/components/content';
import { LikeButton } from '@/components/interactive';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface IArticlePageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all articles at build time
export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
};

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export const generateMetadata = async ({
    params,
}: IArticlePageProps): Promise<Metadata> => {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        return {
            title: 'Article Not Found',
        };
    }

    const ogImage = article.coverImage ?? SITE_CONFIG.seo.ogImage;

    return {
        title: article.title,
        description: article.description,
        authors: [{ name: SITE_CONFIG.author.name }],
        openGraph: {
            title: article.title,
            description: article.description,
            type: 'article',
            publishedTime: article.publishedAt?.toISOString(),
            modifiedTime: article.updatedAt?.toISOString(),
            authors: [SITE_CONFIG.author.name],
            images: [{ url: ogImage, width: 1200, height: 630 }],
            tags: article.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description,
            images: [ogImage],
        },
    };
};

/**
 * Stats Skeleton for loading state
 */
const StatsSkeleton = () => (
    <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-24 rounded-full" />
    </div>
);

/**
 * Article Stats - Views and Likes (streams via Suspense)
 */
const ArticleStats = async ({ slug }: { slug: string }) => {
    const stats = await getPageStats(slug);

    return (
        <div className="flex items-center gap-4">
            <Views slug={slug} />
            <LikeButton slug={slug} initialLikes={stats?.likes ?? 0} />
        </div>
    );
};

/**
 * Article Detail Page
 *
 * Architecture:
 * - Static HTML with article content is served instantly (ISR)
 * - Views and Likes stream in via Suspense (don't block initial paint)
 * - TableOfContents is client-side for scroll-spy interactivity
 * - RelatedPosts stream in after main content
 */
const ArticlePage = async ({ params }: IArticlePageProps) => {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        notFound();
    }

    // Parse markdown to HTML (or use cached html if available)
    const htmlContent = article.html ?? (await parseMarkdown(article.body));

    return (
        <article className="container-narrow py-12">
            {/* Back Link */}
            <Link
                href="/articles"
                className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to articles
            </Link>

            {/* Article Header */}
            <header className="mb-8">
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                    {article.title}
                </h1>

                {/* Description */}
                {article.description && (
                    <p className="mt-4 text-lg text-muted-foreground">
                        {article.description}
                    </p>
                )}

                {/* Meta Row */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {article.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={new Date(article.publishedAt).toISOString()}>
                                {formatDate(article.publishedAt)}
                            </time>
                        </span>
                    )}
                    {article.readingTime && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {article.readingTime} min read
                        </span>
                    )}
                    {/* Views stream in without blocking */}
                    <Suspense fallback={<Skeleton className="h-4 w-20" />}>
                        <Views slug={slug} />
                    </Suspense>
                </div>
            </header>

            {/* Cover Image */}
            {article.coverImage && (
                <figure className="mb-8 overflow-hidden rounded-lg">
                    <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full object-cover"
                    />
                </figure>
            )}

            {/* Series Navigation (if part of a series) */}
            {article.seriesSlug && (
                <div className="mb-8">
                    <Suspense fallback={null}>
                        <SeriesNavWrapper
                            seriesSlug={article.seriesSlug}
                            currentSlug={slug}
                        />
                    </Suspense>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
                {/* Article Body */}
                <div>
                    <ArticleBody html={htmlContent} />

                    {/* Article Footer - Likes */}
                    <footer className="mt-12 flex flex-col gap-6 border-t pt-8">
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">
                                Enjoyed this article?
                            </p>
                            <Suspense fallback={<Skeleton className="h-9 w-24 rounded-full" />}>
                                <ArticleStats slug={slug} />
                            </Suspense>
                        </div>
                    </footer>
                </div>

                {/* Sidebar - Table of Contents (desktop only) */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24">
                        <TableOfContents />
                    </div>
                </aside>
            </div>

            {/* Related Posts - Component includes its own section wrapper */}
            {article.tags && article.tags.length > 0 && (
                <Suspense
                    fallback={
                        <section className="mt-12 border-t pt-8">
                            <Skeleton className="mb-6 h-8 w-40" />
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-48 rounded-lg" />
                                ))}
                            </div>
                        </section>
                    }
                >
                    <RelatedPosts
                        currentSlug={slug}
                        tags={article.tags}
                        limit={3}
                    />
                </Suspense>
            )}
        </article>
    );
};

export default ArticlePage;
