'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId, revalidateTopicPaths } from '../shared';
import type { ITopicUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateTopic = async (topicId: string, input: ITopicUpdateInput): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();

        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        if (input.slug && input.slug !== topic.slug) {
            const conflict = await Topic.findOne({ slug: input.slug, _id: { $ne: topic._id } }).select('_id').lean();
            if (conflict) return error('Topic with this slug already exists', 409);
        }

        const update = cleanUndefined({ ...input, ...updatedNow() });
        await Topic.updateOne({ _id: topic._id }, { $set: update });

        revalidateTopicPaths(topic.slug);
        if (input.slug && input.slug !== topic.slug) revalidateTopicPaths(input.slug);

        return success(true, 'Topic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update topic');
    }
};

/*
API Responses:
- 200: Topic updated successfully.
- 400: Invalid topic id.
- 404: Topic not found.
- 409: Topic slug conflict.
- 500: Unexpected server/database error.
*/
