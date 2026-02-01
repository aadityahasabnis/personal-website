import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic, IArticle } from '@/interfaces';

// ===== SUBTOPIC QUERIES =====

/**
 * Get all subtopics for a topic
 */
export const getSubtopicsByTopic = async (topicSlug: string): Promise<ISubtopic[]> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopics = await collection
            .find({ topicSlug, published: true })
            .sort({ order: 1 })
            .toArray();

        return subtopics;
    } catch (error) {
        console.error(`Failed to fetch subtopics for topic: ${topicSlug}`, error);
        return [];
    }
};

/**
 * Get a single subtopic by slug
 */
export const getSubtopic = async (slug: string): Promise<ISubtopic | null> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopic = await collection.findOne({
            slug,
            published: true,
        });

        return subtopic;
    } catch (error) {
        console.error(`Failed to fetch subtopic: ${slug}`, error);
        return null;
    }
};

/**
 * Get subtopic with its articles
 */
export const getSubtopicWithArticles = async (
    topicSlug: string,
    subtopicSlug: string
): Promise<{
    subtopic: ISubtopic | null;
    articles: Pick<IArticle, 'slug' | 'title' | 'description' | 'order' | 'readingTime'>[];
}> => {
    try {
        const subtopicsCollection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        const contentCollection = await getCollection<IArticle>(COLLECTIONS.content);

        const [subtopic, articles] = await Promise.all([
            subtopicsCollection.findOne({ slug: subtopicSlug, topicSlug, published: true }),
            contentCollection
                .find({
                    type: 'article',
                    topicSlug,
                    subtopicSlug,
                    published: true,
                })
                .sort({ order: 1 })
                .project({
                    slug: 1,
                    title: 1,
                    description: 1,
                    order: 1,
                    readingTime: 1,
                    _id: 0,
                })
                .toArray(),
        ]);

        return {
            subtopic,
            articles: articles as Pick<IArticle, 'slug' | 'title' | 'description' | 'order' | 'readingTime'>[],
        };
    } catch (error) {
        console.error(`Failed to fetch subtopic with articles: ${subtopicSlug}`, error);
        return { subtopic: null, articles: [] };
    }
};

/**
 * Get all subtopic slugs for a topic (for static generation)
 */
export const getSubtopicSlugs = async (topicSlug: string): Promise<string[]> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopics = await collection
            .find({ topicSlug, published: true })
            .project({ slug: 1, _id: 0 })
            .toArray();

        return subtopics.map((s) => s.slug);
    } catch (error) {
        console.error(`Failed to fetch subtopic slugs for topic: ${topicSlug}`, error);
        return [];
    }
};
