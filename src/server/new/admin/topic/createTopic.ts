'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { cleanUndefined, created, error, handleError, timestamps } from '../../utils/helper';
import { revalidateTopicPaths } from '../shared';
import type { ITopicCreateInput, ITopicDocumentInput } from './types';

// ========================================================
// Create
// ========================================================

export const createTopic = async (input: ITopicCreateInput): Promise<IApiResponse<string>> => {
    try {
        await connectDB();

        const existing = await Topic.findOne({ slug: input.slug }).select('_id').lean();
        if (existing) return error('Topic with this slug already exists', 409);

        const doc: ITopicDocumentInput = cleanUndefined({
            slug: input.slug,
            title: input.title,
            description: input.description,
            coverImage: input.coverImage ?? null,
            order: input.order ?? 0,
            subTopicCount: 0,
            contentCount: 0,
            ...timestamps(),
        }) as ITopicDocumentInput;

        const createdTopic = await Topic.create(doc);
        revalidateTopicPaths(createdTopic.slug);

        return created(createdTopic._id.toString(), 'Topic created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create topic');
    }
};

/*
API Responses:
- 201: Topic created successfully.
- 409: Topic slug already exists.
- 500: Unexpected server/database error.
*/
