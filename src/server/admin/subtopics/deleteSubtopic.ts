'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, handleError, logDelete } from '../utils';

// ===== RESPONSE TYPE =====

export interface DeleteSubtopicResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);
const findSubtopic = async (topicSlug: string, slug: string) => 
    (await getSubtopicsCollection()).findOne({ topicSlug, slug });

const revalidateSubtopicPaths = (topicSlug: string, slug?: string): void => {
    ['/admin/subtopics', '/admin/articles', `/articles/${topicSlug}`].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/admin/subtopics/${topicSlug}/${slug}/edit`);
};

// ===== SERVER ACTION =====

export const deleteSubtopic = async (topicSlug: string, slug: string, cascade = false): Promise<DeleteSubtopicResponse> => {
    try {
        const collection = await getSubtopicsCollection();
        const subtopic = await findSubtopic(topicSlug, slug);
        if (!subtopic) return notFound('Subtopic');

        if (cascade) {
            const contentCollection = await getCollection(COLLECTIONS.content);
            await contentCollection.deleteMany({ topicSlug, subtopicSlug: slug, type: 'article' });
        } else {
            // Unlink articles from this subtopic
            const contentCollection = await getCollection(COLLECTIONS.content);
            await contentCollection.updateMany(
                { topicSlug, subtopicSlug: slug, type: 'article' },
                { $unset: { subtopicSlug: '' } }
            );
        }

        await collection.deleteOne({ topicSlug, slug });
        revalidateSubtopicPaths(topicSlug, slug);
        
        await logDelete('subtopic', subtopic.title, subtopic._id?.toString());

        return success(undefined, cascade ? 'Subtopic and articles deleted' : 'Subtopic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete subtopic');
    }
};
