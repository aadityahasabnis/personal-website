'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateTopicPaths } from '../shared';

// ========================================================
// Publish
// ========================================================

export const publishTopic = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        await Topic.updateOne({ _id: topic._id }, { $set: { published: true, ...updatedNow() } });
        revalidateTopicPaths(slug);

        return success(true, 'Topic published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish topic');
    }
};

export const unpublishTopic = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        await Topic.updateOne({ _id: topic._id }, { $set: { published: false, ...updatedNow() } });
        revalidateTopicPaths(slug);

        return success(true, 'Topic unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish topic');
    }
};
