'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { ITopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, handleError, logDelete } from '../utils';

// ===== RESPONSE TYPE =====

export interface DeleteTopicResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getTopicsCollection = () => getCollection<ITopic>(COLLECTIONS.topics);
const findTopic = async (slug: string) => (await getTopicsCollection()).findOne({ slug });

const revalidateTopicPaths = (slug?: string): void => {
    ['/articles', '/admin/topics', '/admin/articles'].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/articles/${slug}`);
};

// ===== SERVER ACTION =====

export const deleteTopic = async (slug: string, cascade = false): Promise<DeleteTopicResponse> => {
    try {
        const collection = await getTopicsCollection();
        const topic = await findTopic(slug);
        if (!topic) return notFound('Topic');

        if (cascade) {
            const [subtopicsCollection, contentCollection] = await Promise.all([
                getCollection(COLLECTIONS.subtopics),
                getCollection(COLLECTIONS.content),
            ]);
            await Promise.all([
                subtopicsCollection.deleteMany({ topicSlug: slug }),
                contentCollection.deleteMany({ topicSlug: slug, type: 'article' }),
            ]);
        }

        await collection.deleteOne({ slug });
        revalidateTopicPaths(slug);
        
        await logDelete('topic', topic.title, topic._id?.toString());

        return success(undefined, cascade ? 'Topic and all related content deleted' : 'Topic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete topic');
    }
};
