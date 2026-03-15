'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { cleanUndefined, created, error, handleError, timestamps } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import type { ISubtopicCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createSubtopic = async (input: ISubtopicCreateInput): Promise<IApiResponse<string>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: input.topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const existing = await Subtopic.findOne({ topicId: topic._id, slug: input.slug }).select('_id').lean();
        if (existing) return error('Subtopic with this slug already exists in topic', 409);

        const createdSubtopic = await Subtopic.create(
            cleanUndefined({
                topicId: topic._id,
                slug: input.slug,
                title: input.title,
                description: input.description ?? null,
                order: input.order ?? 0,
                published: input.published ?? false,
                contentCount: 0,
                ...timestamps(),
            })
        );

        revalidateSubtopicPaths(input.topicSlug);
        return created(createdSubtopic._id.toString(), 'Subtopic created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create subtopic');
    }
};
