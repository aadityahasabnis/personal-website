import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';

import { getArticle, getAllArticleSlugs } from '@/server/queries/content';
import { getPageStats } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants';

import { ArticleBody, Views, TableOfContents, RelatedPosts, SeriesNavWrapper } from '@/components/content';
import { LikeButton } from '@/components/interactive';
import { Skeleton } from '@/components/feedback/Skeleton';

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
        <article className="min-h-screen">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12">
                {/* Back Link */}
                <Link
                    href="/articles"
                    className="inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors mb-8"
                >
                    <ArrowLeft className="size-4" />
                    Back to articles
                </Link>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--fg)] leading-tight">
                    {article.title}
                </h1>

                {/* Description */}
                {article.description && (
                    <p className="mt-6 text-lg md:text-xl text-[var(--fg-muted)] leading-relaxed">
                        {article.description}
                    </p>
                )}

                {/* Meta Row */}
                <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[var(--fg-muted)]">
                    {article.publishedAt && (
                        <span className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <time dateTime={new Date(article.publishedAt).toISOString()}>
                                {formatDate(article.publishedAt)}
                            </time>
                        </span>
                    )}
                    {article.readingTime && (
                        <span className="flex items-center gap-2">
                            <Clock className="size-4" />
                            {article.readingTime} min read
                        </span>
                    )}
                    {/* Views stream in without blocking */}
                    <Suspense fallback={
                        <span className="flex items-center gap-2">
                            <Eye className="size-4" />
                            <Skeleton className="h-4 w-12" />
                        </span>
                    }>
                        <Views slug={slug} />
                    </Suspense>
                </div>

                {/* Accent line */}
                <div className="mt-8 w-16 h-px bg-[var(--accent)]" />
            </div>

            {/* Cover Image */}
            {article.coverImage && (
                <div className="max-w-5xl mx-auto px-6 lg:px-8 mb-12">
                    <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-[var(--border-color)]">
                        <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1200px) 100vw, 1200px"
                        />
                    </div>
                </div>
            )}

            {/* Series Navigation (if part of a series) */}
            {article.seriesSlug && (
                <div className="max-w-4xl mx-auto px-6 lg:px-8 mb-12">
                    <Suspense fallback={null}>
                        <SeriesNavWrapper
                            seriesSlug={article.seriesSlug}
                            currentSlug={slug}
                        />
                    </Suspense>
                </div>
            )}

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1fr_250px]">
                    {/* Article Body */}
                    <div className="min-w-0">
                        <ArticleBody html={htmlContent} />

                        {/* Article Footer - Likes */}
                        <footer className="mt-16 pt-8 border-t border-[var(--border-color)]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-[var(--fg-muted)]">
                                    Enjoyed this article?
                                </p>
                                <Suspense fallback={<StatsSkeleton />}>
                                    <ArticleStats slug={slug} />
                                </Suspense>
                            </div>
                        </footer>
                    </div>

                    {/* Sidebar - Table of Contents (desktop only) */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-28">
                            <TableOfContents />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Related Posts */}
            {article.tags && article.tags.length > 0 && (
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
                    <Suspense
                        fallback={
                            <section className="pt-8 border-t border-[var(--border-color)]">
                                <Skeleton className="mb-8 h-6 w-40" />
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-48 rounded-2xl" />
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
                </div>
            )}
        </article>
    );
};

export default ArticlePage;
