import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleHeader } from '@/components/content/article/ArticleHeader';
import { SubtopicAccordion } from '@/components/content/article/SubtopicAccordion';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateArticleListSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { getPublishedArticleTopics, getPublishedTopicTreeBySlug } from '@/server/new/public/content/article';

// ISR: regenerate at most once per hour; on-demand revalidation via /api/revalidate
export const revalidate = 3600;
const TOPIC_STATIC_PARAMS_LIMIT = 5500;

interface ITopicPageProps {
    params: Promise<{ topicSlug: string }>;
}

/**
 * Generate static paths for all topics
 */
export async function generateStaticParams(): Promise<Array<{ topicSlug: string }>> {
    const topicsResult = await getPublishedArticleTopics({
        pagination: {
            offset: 0,
            limit: TOPIC_STATIC_PARAMS_LIMIT,
        },
    });

    if (!topicsResult.success) return [];

    return topicsResult.data.map((topic) => ({ topicSlug: topic.slug }));
}

/**
 * Generate metadata for the topic page
 */
export async function generateMetadata({ params }: ITopicPageProps): Promise<Metadata> {
    const { topicSlug } = await params;
    const topicResult = await getPublishedTopicTreeBySlug(topicSlug);
    const topic = topicResult.success ? topicResult.data?.topic : null;

    if (!topic) {
        return { title: 'Topic Not Found' };
    }

    const topicOgImage = topic.coverImage
        ? topic.coverImage
        : buildDynamicOgImageUrl({
              title: topic.title,
              eyebrow: 'Article Topic',
              subtitle: topic.description,
              tags: ['articles', 'topic', 'guides'],
          });

    return createPageMetadata({
        title: topic.title,
        description: topic.description,
        canonicalPath: `/articles/${topicSlug}`,
        keywords: [topic.title, 'articles', 'tutorials', 'guide', SITE_CONFIG.author.name],
        includeSocial: true,
        socialType: 'website',
        imageUrl: topicOgImage,
        robots: {
            index: true,
            follow: true,
        },
    });
}

/**
 * Topic Detail Page
 *
 * Shows topic header with description and accordion of subtopics/articles.
 * Static rendering with fade animations.
 */
export default async function TopicPage({ params }: ITopicPageProps) {
    const { topicSlug } = await params;
    const topicResult = await getPublishedTopicTreeBySlug(topicSlug);
    const topicData = topicResult.success ? topicResult.data : null;

    if (!topicData) {
        notFound();
    }

    const allArticles = [...topicData.uncategorizedArticles, ...topicData.subtopics.flatMap((section) => section.articles)];
    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: topicData.topic.title, href: `/articles/${topicSlug}` },
    ];

    // JSON-LD structured data for topic hub page
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Articles', url: `${SITE_CONFIG.url}/articles` },
        { name: topicData.topic.title, url: `${SITE_CONFIG.url}/articles/${topicSlug}` },
    ]);
    const topicSchema = {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/articles/${topicSlug}`,
        name: topicData.topic.title,
        description: topicData.topic.description,
        url: `${SITE_CONFIG.url}/articles/${topicSlug}`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: topicData.topic.contentCount,
        },
        about: {
            '@type': 'Thing',
            name: topicData.topic.title,
            description: topicData.topic.description,
        },
    };
    const articleListSchema = generateArticleListSchema(
        allArticles.map((article) => ({
            slug: article.slug,
            title: article.title,
            description: article.description,
        })),
        topicSlug,
        topicData.topic.title,
    );
    const combinedSchema = combineSchemas(topicSchema, articleListSchema, breadcrumbSchema);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <JsonLd data={combinedSchema} />

            <main className='mx-auto px-4 py-16 max-w-5xl sm:px-6 lg:px-8 md:py-20'>
                <ArticleHeader
                    breadcrumbs={breadcrumbs}
                    title={topicData.topic.title}
                    description={topicData.topic.description}
                    coverImage={topicData.topic.coverImage}
                    contentCount={topicData.topic.contentCount}
                    subtopicCount={topicData.topic.subTopicCount}
                />

                {/* Subtopics Accordion */}
                <FadeIn direction='up' distance={20} duration={0.5} delay={0.32}>
                    <section>
                        <SubtopicAccordion topicSlug={topicSlug} sections={topicData.subtopics} uncategorizedArticles={topicData.uncategorizedArticles} />
                    </section>
                </FadeIn>
            </main>
        </>
    );
}
