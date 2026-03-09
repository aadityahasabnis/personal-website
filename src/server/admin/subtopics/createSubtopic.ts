'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, duplicate, error, handleError, logCreate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateSubtopicRequest {
    topicSlug: string;
    slug: string;
    title: string;
    description?: string;
    order?: number;
    published?: boolean;
}

export interface CreateSubtopicResponse extends ActionResponse<string> {}

// ===== SCHEMA =====

const schema = z.object({
    topicSlug: z.string().min(1, 'Topic is required'),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
});

// ===== HELPERS =====

const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);

const revalidateSubtopicPaths = (topicSlug: string, slug?: string): void => {
    ['/admin/subtopics', '/admin/articles', `/articles/${topicSlug}`].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/admin/subtopics/${topicSlug}/${slug}/edit`);
};

const verifyTopicExists = async (topicSlug: string): Promise<boolean> => {
    const topic = await (await getCollection(COLLECTIONS.topics)).findOne({ slug: topicSlug });
    return !!topic;
};

// ===== SERVER ACTION =====

export const createSubtopic = async (data: CreateSubtopicRequest): Promise<CreateSubtopicResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        if (!(await verifyTopicExists(parsed.data.topicSlug))) {
            return error('Topic not found');
        }

        const collection = await getSubtopicsCollection();
        if (await collection.findOne({ topicSlug: parsed.data.topicSlug, slug: parsed.data.slug })) {
            return duplicate('A subtopic with this slug already exists in this topic');
        }

        const now = new Date();
        const subtopic: Omit<ISubtopic, '_id'> = {
            ...parsed.data,
            metadata: { articleCount: 0 },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(subtopic as ISubtopic);
        revalidateSubtopicPaths(parsed.data.topicSlug, parsed.data.slug);
        
        await logCreate('subtopic', parsed.data.title, result.insertedId.toString());

        return success(result.insertedId.toString(), 'Subtopic created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create subtopic');
    }
};
