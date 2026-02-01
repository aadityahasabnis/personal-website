import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ITopic, ISubtopic, IArticle } from '@/interfaces';

// ===== TOPIC QUERIES =====

/**
 * Get all published topics ordered by display order
 */
export const getAllTopics = async (): Promise<ITopic[]> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topics = await collection
            .find({ published: true })
            .sort({ order: 1 })
            .toArray();

        return topics;
    } catch (error) {
        console.error('Failed to fetch topics', error);
        return [];
    }
};

/**
 * Get featured topics for homepage
 */
export const getFeaturedTopics = async (limit = 6): Promise<ITopic[]> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topics = await collection
            .find({ published: true, featured: true })
            .sort({ order: 1 })
            .limit(limit)
            .toArray();

        return topics;
    } catch (error) {
        console.error('Failed to fetch featured topics', error);
        return [];
    }
};

/**
 * Get a single topic by slug
 */
export const getTopic = async (slug: string): Promise<ITopic | null> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topic = await collection.findOne({
            slug,
            published: true,
        });

        return topic;
    } catch (error) {
        console.error(`Failed to fetch topic: ${slug}`, error);
        return null;
    }
};

/**
 * Get topic with its subtopics and articles (for topic page)
 */
export const getTopicWithContent = async (
    topicSlug: string
): Promise<{
    topic: ITopic | null;
    subtopics: ISubtopic[];
    articles: Pick<IArticle, 'slug' | 'title' | 'description' | 'subtopicSlug' | 'order' | 'readingTime' | 'publishedAt'>[];
}> => {
    try {
        const topicsCollection = await getCollection<ITopic>(COLLECTIONS.topics);
        const subtopicsCollection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        const contentCollection = await getCollection<IArticle>(COLLECTIONS.content);

        // Parallel fetch
        const [topic, subtopics, articles] = await Promise.all([
            topicsCollection.findOne({ slug: topicSlug, published: true }),
            subtopicsCollection
                .find({ topicSlug, published: true })
                .sort({ order: 1 })
                .toArray(),
            contentCollection
                .find({
                    type: 'article',
                    topicSlug,
                    published: true,
                })
                .sort({ order: 1 })
                .project({
                    slug: 1,
                    title: 1,
                    description: 1,
                    subtopicSlug: 1,
                    order: 1,
                    readingTime: 1,
                    publishedAt: 1,
                    _id: 0,
                })
                .toArray(),
        ]);

        return {
            topic,
            subtopics,
            articles: articles as Pick<IArticle, 'slug' | 'title' | 'description' | 'subtopicSlug' | 'order' | 'readingTime' | 'publishedAt'>[],
        };
    } catch (error) {
        console.error(`Failed to fetch topic with content: ${topicSlug}`, error);
        return { topic: null, subtopics: [], articles: [] };
    }
};

/**
 * Get all topic slugs for static generation
 */
export const getAllTopicSlugs = async (): Promise<string[]> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topics = await collection
            .find({ published: true })
            .project({ slug: 1, _id: 0 })
            .toArray();

        return topics.map((t) => t.slug);
    } catch (error) {
        console.error('Failed to fetch topic slugs', error);
        return [];
    }
};
