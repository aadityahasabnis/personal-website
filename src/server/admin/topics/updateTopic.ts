'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ITopic } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logUpdate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface UpdateTopicRequest {
    title?: string;
    slug?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    order?: number;
    published?: boolean;
    featured?: boolean;
}

export interface UpdateTopicResponse extends ActionResponse<void> {}

// ===== SCHEMA =====

const schema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max).optional(),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
});

// ===== HELPERS =====

const getTopicsCollection = () => getCollection<ITopic>(COLLECTIONS.topics);
const findTopic = async (slug: string) => (await getTopicsCollection()).findOne({ slug });

const revalidateTopicPaths = (slug?: string): void => {
    ['/articles', '/admin/topics', '/admin/articles'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/articles/${slug}`);
        revalidatePath(`/admin/topics/${slug}/edit`);
    }
};

// ===== SERVER ACTION =====

export const updateTopic = async (slug: string, data: UpdateTopicRequest): Promise<UpdateTopicResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getTopicsCollection();
        const existing = await findTopic(slug);
        if (!existing) return notFound('Topic');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ slug: parsed.data.slug })) {
                return duplicate('A topic with this slug');
            }
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            updatedAt: new Date(),
            'metadata.lastUpdated': new Date(),
        };
        Object.keys(updateData).forEach(k => 
            updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]
        );

        await collection.updateOne({ slug }, { $set: updateData });
        revalidateTopicPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateTopicPaths(parsed.data.slug);
        
        await logUpdate('topic', existing.title, existing._id?.toString());

        return success(undefined, 'Topic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update topic');
    }
};
