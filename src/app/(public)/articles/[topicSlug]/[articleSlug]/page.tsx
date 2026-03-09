import { after } from 'next/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getArticleByTopicSlug, getAllPublishedArticles } from '@/server/queries/content';
import { getTopic } from '@/server/queries/topics';
import { getSubtopic } from '@/server/queries/subtopics';
import { getArticleStats, getArticleCommentCount } from '@/server/queries/stats';
import { incrementViews } from '@/server/actions/stats';
import { ArticleHeader } from '@/components/content/ArticleHeader';
import { ArticleContent } from '@/components/content/ArticleContent';
import { ContentStats } from '@/components/common/ContentStats';
import { CommentSection } from '@/components/common/CommentSection';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { JsonLd, generateArticleSchema, generateBreadcrumbSchema, combineSchemas, generateOrganizationSchema } from '@/lib/seo';
import { SITE_CONFIG } from '@/constants/siteConstants';

export const revalidate = 3600;

interface IArticlePageProps {
    params: Promise<{ topicSlug: string; articleSlug: string }>;
}

export const generateStaticParams = async () => {
    const articles = await getAllPublishedArticles();
    return articles
        .filter((a) => a.topicSlug && a.slug)
        .map(({ topicSlug, slug }) => ({ topicSlug, articleSlug: slug }));
};

export const generateMetadata = async ({ params }: IArticlePageProps): Promise<Metadata> => {
    const { topicSlug, articleSlug } = await params;
    const article = await getArticleByTopicSlug(topicSlug, articleSlug);
    if (!article) return { title: 'Article Not Found' };

    const [topic, subtopic] = await Promise.all([
        getTopic(topicSlug),
        article.subtopicSlug ? getSubtopic(article.subtopicSlug) : Promise.resolve(null),
    ]);

    const readingTime = article.readingTime ?? Math.ceil((article.body?.split(/\s+/).length ?? 0) / 200);
    const seoTitle = article.seo?.title ?? article.title;
    const seoDescription = article.seo?.description ?? article.description;
    const url = `${SITE_CONFIG.url}/articles/${topicSlug}/${articleSlug}`;
    const imageUrl = article.seo?.ogImage ?? article.coverImage ?? `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`;
    const keywords = [
        ...(article.seo?.keywords ?? article.tags ?? []),
        topic?.title ?? topicSlug,
        ...(subtopic ? [subtopic.title] : []),
        SITE_CONFIG.author.name,
        'tutorial', 'guide', 'learn',
    ];

    return {
        title: seoTitle,
        description: seoDescription,
        keywords: keywords.join(', '),
        authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }],
        creator: SITE_CONFIG.author.name,
        publisher: SITE_CONFIG.author.name,
        alternates: { canonical: url },
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
            images: [{ url: imageUrl, width: 1200, height: 630, alt: seoTitle }],
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
            googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
        other: {
            'article:author': SITE_CONFIG.author.name,
            'article:section': topic?.title ?? topicSlug,
            ...(article.publishedAt && { 'article:published_time': article.publishedAt.toISOString() }),
            ...(article.updatedAt && { 'article:modified_time': article.updatedAt.toISOString() }),
            'article:tag': keywords.join(', '),
            'twitter:label1': 'Reading time',
            'twitter:data1': `${readingTime} min read`,
            'twitter:label2': 'Written by',
            'twitter:data2': SITE_CONFIG.author.name,
        },
    };
};

const ArticlePage = async ({ params }: IArticlePageProps) => {
    const { topicSlug, articleSlug } = await params;
    const fullSlug = `${topicSlug}/${articleSlug}`;

    after(() => incrementViews(fullSlug));

    // Stage 1: article + topic in parallel (need subtopicSlug before stage 2)
    const [article, topic] = await Promise.all([
        getArticleByTopicSlug(topicSlug, articleSlug),
        getTopic(topicSlug),
    ]);

    if (!article) notFound();

    // Stage 2: remaining data in parallel
    const [stats, commentCount, subtopic] = await Promise.all([
        getArticleStats(fullSlug),
        getArticleCommentCount(fullSlug),
        article.subtopicSlug ? getSubtopic(article.subtopicSlug) : Promise.resolve(null),
    ]);

    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: topic?.title ?? topicSlug, href: `/articles/${topicSlug}` },
        ...(subtopic ? [{ label: subtopic.title, href: `/articles/${topicSlug}#${subtopic.slug}` }] : []),
        { label: article.title, href: `/articles/${topicSlug}/${articleSlug}` },
    ];

    const combinedSchema = combineSchemas(
        generateArticleSchema({ article, topicSlug, articleSlug, topicTitle: topic?.title ?? topicSlug, subtopicTitle: subtopic?.title, commentCount }),
        generateBreadcrumbSchema(breadcrumbs.map((b) => ({ name: b.label, url: `${SITE_CONFIG.url}${b.href}` }))),
        generateOrganizationSchema(),
    );

    // Prefer pre-rendered html to skip the markdown pipeline on every request
    const content = article.html ?? article.body ?? '';

    return (
        <>
            <JsonLd data={combinedSchema} />
            <ScrollToTop />
            <article className="article-content" itemScope itemType="https://schema.org/TechArticle">
                <ArticleHeader
                    breadcrumbs={breadcrumbs}
                    title={article.title}
                    description={article.description}
                    readingTime={article.readingTime}
                    publishedAt={article.publishedAt}
                    updatedAt={article.updatedAt}
                    tags={article.tags}
                />
                {content ? (
                    <ArticleContent content={content} />
                ) : (
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 text-[var(--fg-muted)]">
                        <p>This article is being prepared. Check back soon.</p>
                    </div>
                )}
                <footer className="mt-12 pt-8 border-t border-[var(--border-color)]">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-[var(--fg-muted)]">Enjoyed this article? Show some love!</p>
                        <ContentStats
                            slug={fullSlug}
                            contentType="articles"
                            initialViews={stats?.views ?? 0}
                            initialLikes={stats?.likes ?? 0}
                        />
                    </div>
                </footer>
                <CommentSection slug={fullSlug} contentType="articles" />
            </article>
        </>
    );
};

export default ArticlePage;
