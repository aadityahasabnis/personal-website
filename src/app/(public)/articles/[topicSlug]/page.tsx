import { ChevronLeft, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BeamLine } from '@/components/common/BeamLine';
import { SubtopicAccordion } from '@/components/content/article/SubtopicAccordion';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { JsonLd, combineSchemas, generateArticleListSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
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

    return createPageMetadata({
        title: topic.title,
        description: topic.description,
        canonicalPath: `/articles/${topicSlug}`,
        keywords: [topic.title, 'articles', 'tutorials', 'guide', SITE_CONFIG.author.name],
        includeSocial: true,
        socialType: 'website',
        ...(topic.coverImage ? { imageUrl: topic.coverImage } : {}),
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

            <main className='mx-auto px-6 py-24 max-w-4xl md:py-32 lg:px-8'>
                {/* Breadcrumb */}
                <nav className='mb-8'>
                    <Link href='/articles' className='inline-flex items-center gap-1 text-body text-muted-foreground transition-base hover:text-primary'>
                        <ChevronLeft className='size-4' />
                        All Topics
                    </Link>
                </nav>

                {/* Topic Header */}
                <header className='mb-12'>
                    {/* Title */}
                    <h1 className='mb-4 text-h1 font-semibold text-foreground'>{topicData.topic.title}</h1>

                    {/* Description */}
                    <p className='max-w-2xl text-h3 text-muted-foreground'>{topicData.topic.description}</p>

                    {/* Meta */}
                    <div className='mt-6 flex items-center gap-4 text-small text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                            <FileText className='size-4' />
                            {topicData.topic.contentCount} article{topicData.topic.contentCount !== 1 ? 's' : ''}
                        </span>
                        <span>Last updated {formatDate(topicData.topic.updatedAt)}</span>
                    </div>

                    {/* Decorative animated beam line */}
                    <BeamLine />
                </header>

                {/* Subtopics Accordion */}
                <SubtopicAccordion topicSlug={topicSlug} sections={topicData.subtopics} uncategorizedArticles={topicData.uncategorizedArticles} />
            </main>
        </>
    );
}
