'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Publish
// ========================================================

export const publishSubtopic = async (topicSlug: string, slug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const updated = await Subtopic.updateOne(
            { topicId: topic._id, slug },
            { $set: { published: true, ...updatedNow() } }
        );

        if (!updated.matchedCount) return error('Subtopic not found', 404);
        revalidateSubtopicPaths(topicSlug);

        return success(true, 'Subtopic published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish subtopic');
    }
};

export const unpublishSubtopic = async (topicSlug: string, slug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const updated = await Subtopic.updateOne(
            { topicId: topic._id, slug },
            { $set: { published: false, ...updatedNow() } }
        );

        if (!updated.matchedCount) return error('Subtopic not found', 404);
        revalidateSubtopicPaths(topicSlug);

        return success(true, 'Subtopic unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish subtopic');
    }
};
