import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ArticleHeader } from '@/components/content/article/ArticleHeader';
import { ArticleContent } from '@/components/content/common/ArticleContent';
import { ContentComment } from '@/components/content/common/comment/ContentComment';
import { ContentLikes, ContentViews } from '@/components/content/common/stats';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateArticleSchema, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { getPublishedArticleByPath, getPublishedArticleStaticPaths, type IPublicArticleDetail } from '@/server/new/public/content/article';

export const revalidate = 3600;

interface IArticlePageProps {
    params: Promise<{ topicSlug: string; articleSlug: string }>;
}

export const generateStaticParams = async (): Promise<Array<{ topicSlug: string; articleSlug: string }>> => {
    const pathsResult = await getPublishedArticleStaticPaths();
    if (!pathsResult.success) return [];

    return pathsResult.data.map((item) => ({
        topicSlug: item.topicSlug,
        articleSlug: item.articleSlug,
    }));
};

export const generateMetadata = async ({ params }: IArticlePageProps): Promise<Metadata> => {
    const { topicSlug, articleSlug } = await params;
    const articleResult = await getPublishedArticleByPath(topicSlug, articleSlug);

    if (!articleResult.success || !articleResult.data) {
        return { title: 'Article Not Found' };
    }

    const article = articleResult.data;
    const title = article.seo?.title ?? article.title;
    const description = article.seo?.description ?? article.description;
    const image =
        article.seo?.ogImage ??
        article.coverImage ??
        buildDynamicOgImageUrl({
            title,
            eyebrow: article.topic.title,
            subtitle: description,
            tags: article.tags.slice(0, 4),
        });
    const keywords = Array.from(
        new Set([
            ...(article.seo?.keywords ?? article.tags),
            article.topic.title,
            ...(article.subtopic ? [article.subtopic.title] : []),
            'software engineering',
            'system design',
            'problem solving',
            'technical writing',
            SITE_CONFIG.author.name,
        ]),
    );
    const articleTags = Array.from(new Set([...(article.tags ?? []), ...(article.seo?.keywords ?? [])]));

    return createPageMetadata({
        title,
        description,
        canonicalPath: article.seo?.canonicalUrl ?? `/articles/${topicSlug}/${articleSlug}`,
        keywords,
        includeAuthor: true,
        includeSocial: true,
        socialType: article.seo?.ogType ?? 'article',
        imageUrl: image,
        openGraph: {
            ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
            modifiedTime: article.updatedAt,
            authors: [SITE_CONFIG.author.name],
            tags: articleTags,
        },
        robots: {
            index: !article.seo?.noIndex,
            follow: true,
            googleBot: {
                index: !article.seo?.noIndex,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        other: {
            'article:author': SITE_CONFIG.author.name,
            'article:publisher': SITE_CONFIG.url,
            'article:section': article.topic.title,
            ...(articleTags.length > 0 ? { 'article:tag': articleTags } : {}),
            ...(article.publishedAt && { 'article:published_time': article.publishedAt }),
            ...(article.updatedAt && { 'article:modified_time': article.updatedAt }),
            ...(article.updatedAt && { 'og:updated_time': article.updatedAt }),
            'twitter:label1': 'Reading time',
            'twitter:data1': `${article.readingTime} min read`,
            'twitter:label2': 'Written by',
            'twitter:data2': SITE_CONFIG.author.name,
        },
    });
};

const ArticlePage = async ({ params }: IArticlePageProps) => {
    const { topicSlug, articleSlug } = await params;
    const articleResult = await getPublishedArticleByPath(topicSlug, articleSlug);

    if (!articleResult.success || !articleResult.data) {
        notFound();
    }

    const article: IPublicArticleDetail = articleResult.data;
    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: article.topic.title, href: `/articles/${topicSlug}` },
        ...(article.subtopic ? [{ label: article.subtopic.title, href: `/articles/${topicSlug}#${article.subtopic.slug}` }] : []),
        { label: article.title, href: `/articles/${topicSlug}/${articleSlug}` },
    ];

    const articleSchema = generateArticleSchema({
        article: {
            title: article.title,
            description: article.description,
            body: article.body,
            tags: article.tags,
            coverImage: article.seo?.ogImage ?? article.coverImage,
            readingTime: article.readingTime,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
        },
        topicSlug,
        articleSlug,
        topicTitle: article.topic.title,
        ...(article.subtopic ? { subtopicTitle: article.subtopic.title } : {}),
    });

    const combinedSchema = combineSchemas(
        generatePersonSchema(),
        generateWebSiteSchema(),
        generateWebPageSchema({
            title: article.title,
            description: article.description,
            path: `/articles/${topicSlug}/${articleSlug}`,
        }),
        articleSchema,
        generateBreadcrumbSchema(
            breadcrumbs.map((crumb) => ({
                name: crumb.label,
                url: `${SITE_CONFIG.url}${crumb.href}`,
            })),
        ),
    );

    const content = article.html ?? article.body ?? '';

    return (
        <>
            <JsonLd data={combinedSchema} />
            <ScrollToTop />

            <article className='pb-16 md:pb-20' itemScope itemType='https://schema.org/TechArticle'>
                <ArticleHeader
                    breadcrumbs={breadcrumbs}
                    title={article.title}
                    description={article.description}
                    coverImage={article.coverImage ?? article.seo?.ogImage ?? null}
                    readingTime={article.readingTime}
                    {...(article.publishedAt ? { publishedAt: article.publishedAt } : {})}
                    updatedAt={article.updatedAt}
                    tags={article.tags}
                />

                {content ? (
                    <FadeIn direction='up' distance={20} duration={0.5} delay={0.2} trigger='always'>
                        <ArticleContent content={content} />
                    </FadeIn>
                ) : (
                    <p className='py-12 text-body text-muted-foreground'>This article is being prepared. Check back soon.</p>
                )}

                <FadeIn direction='up' distance={12} duration={0.4} delay={0.3} trigger='always'>
                    <section className='flex items-center gap-3 mt-8' aria-label='Article engagement stats'>
                        <ContentViews contentType='articles' contentId={article.id} />
                        <ContentLikes contentType='articles' contentId={article.id} />
                    </section>
                </FadeIn>
                <ContentComment contentType='articles' contentId={article.id} />
            </article>
        </>
    );
};

export default ArticlePage;
