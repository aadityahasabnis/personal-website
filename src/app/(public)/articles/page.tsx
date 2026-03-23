import type { Metadata } from 'next';

import { TopicGrid } from '@/components/content/article/TopicGrid';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedArticleTopics, type IPublicTopicSummary } from '@/server/new/public/content/article';

const description = `Explore articles on software development, DSA, web technologies, and more by ${SITE_CONFIG.author.name}.`;
const FEATURED_TOPICS_DEFAULT_COUNT = 5;
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

// ISR: articles listing regenerates every 10 minutes; on-demand via /api/revalidate
export const revalidate = 600;

/**
 * Load featured and all topic collections for the hub page.
 */
const getArticlesHubData = async (
    featuredCount = FEATURED_TOPICS_DEFAULT_COUNT,
): Promise<{
    featuredTopics: IPublicTopicSummary[];
    allTopics: IPublicTopicSummary[];
}> => {
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

/**
 * Articles Page - Topics Grid
 *
 * Fully static page listing all topics with their article counts.
 * No loading states - content is pre-rendered at build time.
 */
export default async function ArticlesPage() {
    const { featuredTopics, allTopics } = await getArticlesHubData();

    return (
        <main className='mx-auto px-6 py-20 max-w-6xl md:py-28 lg:px-8'>
            {/* Page Header */}
            <PageHeader
                label='Knowledge Base'
                title='Articles'
                description='Explore in-depth articles organized by topic. From data structures to web development, find comprehensive tutorials and guides.'
            />

            {/* Featured Topics */}
            {featuredTopics.length > 0 && (
                <section className='mb-14'>
                    <h2 className='mb-6 text-small font-medium uppercase tracking-wide text-muted-foreground'>Featured Topics</h2>
                    <TopicGrid topics={featuredTopics} />
                </section>
            )}

            {/* All Topics Grid */}
            <section>
                {allTopics.length === 0 ? (
                    <div className='py-16 text-center'>
                        <p className='text-body text-muted-foreground'>No topics yet. Check back soon.</p>
                    </div>
                ) : (
                    <>
                        <h2 className='mb-6 text-small font-medium uppercase tracking-wide text-muted-foreground'>All Topics</h2>
                        <TopicGrid topics={allTopics} />
                    </>
                )}
            </section>
        </main>
    );
}
