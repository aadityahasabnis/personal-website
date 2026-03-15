'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { handleError, success } from '../../../utils/helper';
import { revalidateTopicPaths } from '../shared';

// ========================================================
// Reorder
// ========================================================

export const reorderTopics = async (slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        if (!slugs.length) return success(true);

        await connectDB();
        const now = new Date();

        await Topic.bulkWrite(
            slugs.map((slug, index) => ({
                updateOne: {
                    filter: { slug },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        revalidateTopicPaths();
        return success(true, 'Topics reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder topics');
    }
};
