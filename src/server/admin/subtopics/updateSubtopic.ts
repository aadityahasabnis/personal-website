'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logUpdate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface UpdateSubtopicRequest {
    slug?: string;
    title?: string;
    description?: string;
    order?: number;
    published?: boolean;
}

export interface UpdateSubtopicResponse extends ActionResponse<void> {}

// ===== SCHEMA =====

const schema = z.object({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max).optional(),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0).optional(),
    published: z.boolean().optional(),
});

// ===== HELPERS =====

const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);
const findSubtopic = async (topicSlug: string, slug: string) => 
    (await getSubtopicsCollection()).findOne({ topicSlug, slug });

const revalidateSubtopicPaths = (topicSlug: string, slug?: string): void => {
    ['/admin/subtopics', '/admin/articles', `/articles/${topicSlug}`].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/admin/subtopics/${topicSlug}/${slug}/edit`);
};

// ===== SERVER ACTION =====

export const updateSubtopic = async (
    topicSlug: string,
    slug: string,
    data: UpdateSubtopicRequest
): Promise<UpdateSubtopicResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getSubtopicsCollection();
        const existing = await findSubtopic(topicSlug, slug);
        if (!existing) return notFound('Subtopic');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ topicSlug, slug: parsed.data.slug })) {
                return duplicate('A subtopic with this slug');
            }
        }

        const updateData = { ...parsed.data, updatedAt: new Date() };
        Object.keys(updateData).forEach(k => 
            updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]
        );

        await collection.updateOne({ topicSlug, slug }, { $set: updateData });
        revalidateSubtopicPaths(topicSlug, slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateSubtopicPaths(topicSlug, parsed.data.slug);
        
        await logUpdate('subtopic', existing.title, existing._id?.toString());

        return success(undefined, 'Subtopic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update subtopic');
    }
};
