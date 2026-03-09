'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants/siteConstants';
import type { ITopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, duplicate, error, handleError, logCreate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateTopicRequest {
    title: string;
    slug: string;
    description: string;
    icon?: string;
    coverImage?: string;
    order?: number;
    published?: boolean;
    featured?: boolean;
}

export interface CreateTopicResponse extends ActionResponse<string> {}

// ===== SCHEMA =====

const schema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(500),
    icon: z.string().optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
});

// ===== HELPERS =====

const getTopicsCollection = () => getCollection<ITopic>(COLLECTIONS.topics);

const revalidateTopicPaths = (slug?: string): void => {
    ['/articles', '/admin/topics', '/admin/articles'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/articles/${slug}`);
        revalidatePath(`/admin/topics/${slug}/edit`);
    }
};

// ===== SERVER ACTION =====

export const createTopic = async (data: CreateTopicRequest): Promise<CreateTopicResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getTopicsCollection();
        if (await collection.findOne({ slug: parsed.data.slug })) {
            return duplicate('A topic with this slug');
        }

        const now = new Date();
        const topic: Omit<ITopic, '_id'> = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            metadata: { articleCount: 0, lastUpdated: now },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(topic as ITopic);
        revalidateTopicPaths(parsed.data.slug);
        
        await logCreate('topic', parsed.data.title, result.insertedId.toString());

        return success(result.insertedId.toString(), 'Topic created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create topic');
    }
};
