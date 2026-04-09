import type { Metadata } from 'next';

import { ScrollToTop } from '@/components/common/ScrollToTop';
import { TopicGroup } from '@/components/content/article/TopicGroup';
import { PageHeader } from '@/components/layout/PageHeader';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { JsonLd, combineSchemas, generateBreadcrumbSchema } from '@/lib/seo';
import { getPublishedArticleTopics, type IPublicTopicSummary } from '@/server/new/public/content/article';
import { FileText, StarIcon } from 'lucide-react';

export const revalidate = 600;

const description = `Explore articles on software development, DSA, web technologies, and more by ${SITE_CONFIG.author.name}.`;
const FEATURED_TOPICS_DEFAULT_COUNT = 2 * 1; // Always should be multiple of 2
const TOPICS_PAGE_LIMIT = 200;

export const metadata: Metadata = createPageMetadata({
    title: 'Articles',
    description,
    canonicalPath: '/articles',
    keywords: ['articles', 'tutorials', 'software development', 'web development', 'DSA', SITE_CONFIG.author.name],
    includeSocial: true,
    socialType: 'website',
    robots: {
        index: true,
        follow: true,
    },
});

// Load featured and all topic collections for the hub page.

const getArticlesHubData = async (featuredCount = FEATURED_TOPICS_DEFAULT_COUNT): Promise<{ featuredTopics: IPublicTopicSummary[]; allTopics: IPublicTopicSummary[] }> => {
    const [featuredResult, allResult] = await Promise.all([
        getPublishedArticleTopics({
            featuredOnly: true,
            pagination: {
                offset: 0,
                limit: featuredCount,
            },
        }),
        getPublishedArticleTopics({
            pagination: {
                offset: 0,
                limit: TOPICS_PAGE_LIMIT,
            },
        }),
    ]);

    const featuredTopics = featuredResult.success ? featuredResult.data : [];
    const allTopicsRaw = allResult.success ? allResult.data : [];
    const featuredIds = new Set(featuredTopics.map((topic) => topic.id));

    return {
        featuredTopics,
        allTopics: allTopicsRaw.filter((topic) => !featuredIds.has(topic.id)),
    };
};

export default async function Page() {
    const { featuredTopics, allTopics } = await getArticlesHubData();
    const allUniqueTopics = [...featuredTopics, ...allTopics];

    const breadcrumbSchema = generateBreadcrumbSchema([{ name: 'Articles', url: `${SITE_CONFIG.url}/articles` }]);

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/articles`,
        name: 'Technical Articles & Guides',
        description,
        url: `${SITE_CONFIG.url}/articles`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: allUniqueTopics.length,
            itemListElement: allUniqueTopics.map((topic, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${SITE_CONFIG.url}/articles/${topic.slug}`,
                name: topic.title,
                description: topic.description,
            })),
        },
    };

    const combinedSchema = combineSchemas(breadcrumbSchema, collectionSchema);

    return (
        <>
            <JsonLd data={combinedSchema} />
            <main className='mx-auto px-6 lg:px-8 py-20 md:py-24 max-w-5xl'>
                {/* Page Header */}
                <PageHeader
                    title='Articles'
                    label='Knowledge Based'
                    description='Explore in-depth articles organized by topic. From data structures to web development, find comprehensive tutorials and guides.'
                />

                <FadeIn direction='up' distance={20} duration={0.5} delay={0.32}>
                    <section className='flex flex-col gap-8'>
                        {featuredTopics.length > 0 && <TopicGroup label='Featured Topics' icon={<StarIcon className='size-5' />} topics={featuredTopics} />}
                        <TopicGroup label='All Topics' icon={<FileText className='size-5' />} topics={allTopics} />
                    </section>
                </FadeIn>

                <ScrollToTop />
            </main>
        </>
    );
}
