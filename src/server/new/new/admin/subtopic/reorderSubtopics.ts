'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Reorder
// ========================================================

export const reorderSubtopics = async (topicSlug: string, slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        if (!slugs.length) return success(true);

        await connectDB();
        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const now = new Date();
        await Subtopic.bulkWrite(
            slugs.map((slug, index) => ({
                updateOne: {
                    filter: { topicId: topic._id, slug },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        revalidateSubtopicPaths(topicSlug);
        return success(true, 'Subtopics reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder subtopics');
    }
};
