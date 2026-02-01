import type { Metadata } from 'next';

import { getAllTopics, getFeaturedTopics } from '@/server/queries/topics';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { TopicGrid } from '@/components/content/TopicGrid';
import { FadeIn } from '@/components/animation/FadeIn';
import type { ITopic } from '@/interfaces';

export const metadata: Metadata = {
    title: 'Articles',
    description: `Explore articles on software development, DSA, web technologies, and more by ${SITE_CONFIG.author.name}.`,
    openGraph: {
        title: 'Articles',
        description: `Explore articles on software development, DSA, web technologies, and more by ${SITE_CONFIG.author.name}.`,
    },
};

// Static generation - revalidate only on publish
export const revalidate = false;

/**
 * Transform MongoDB topic to plain object for client components
 */
function transformTopic(topic: ITopic): ITopic {
    return {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        coverImage: topic.coverImage,
        order: topic.order,
        published: topic.published,
        featured: topic.featured,
        metadata: {
            articleCount: topic.metadata.articleCount,
            lastUpdated: topic.metadata.lastUpdated,
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
    };
}

/**
 * Articles Page - Topics Grid
 * 
 * Fully static page listing all topics with their article counts.
 * No loading states - content is pre-rendered at build time.
 */
export default async function ArticlesPage() {
    // Fetch all data at build time
    const [featuredTopics, allTopics] = await Promise.all([
        getFeaturedTopics(3),
        getAllTopics(),
    ]);

    const transformedFeatured = featuredTopics.map(transformTopic);
    const transformedAll = allTopics.map(transformTopic);

    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            {/* Page Header */}
            <PageHeader
                label="Knowledge Base"
                title="Articles"
                description="Explore in-depth articles organized by topic. From data structures to web development, find comprehensive tutorials and guides."
            />

            {/* Featured Topics */}
            {transformedFeatured.length > 0 && (
                <FadeIn delay={0.3} as="section" className="mb-16">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
                        Featured Topics
                    </h2>
                    <TopicGrid topics={transformedFeatured} />
                </FadeIn>
            )}

            {/* All Topics Grid */}
            <FadeIn delay={0.4} as="section">
                {transformedAll.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[var(--fg-muted)] text-lg">
                            No topics yet. Check back soon.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
                            All Topics
                        </h2>
                        <TopicGrid topics={transformedAll} />
                    </>
                )}
            </FadeIn>
        </div>
    );
}
