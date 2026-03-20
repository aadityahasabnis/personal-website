'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { revalidateTopicPaths } from '../shared';

// ========================================================
// Publish
// ========================================================

export const publishTopic = async (topicId: string): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        await Topic.updateOne({ _id: topic._id }, { $set: { published: true, ...updatedNow() } });
        revalidateTopicPaths(topic.slug);

        return success(true, 'Topic published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish topic');
    }
};

export const unpublishTopic = async (topicId: string): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        await Topic.updateOne({ _id: topic._id }, { $set: { published: false, ...updatedNow() } });
        revalidateTopicPaths(topic.slug);

        return success(true, 'Topic unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish topic');
    }
};

/*
API Responses:
- 200: Topic published/unpublished successfully.
- 400: Invalid topic id.
- 404: Topic not found.
- 500: Unexpected server/database error.
*/
