'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateTopicPaths } from '../shared';
import type { ITopicUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateTopic = async (slug: string, input: ITopicUpdateInput): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug }).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        if (input.slug && input.slug !== slug) {
            const conflict = await Topic.findOne({ slug: input.slug }).select('_id').lean();
            if (conflict) return error('Topic with this slug already exists', 409);
        }

        const update = cleanUndefined({ ...input, ...updatedNow() });
        await Topic.updateOne({ _id: topic._id }, { $set: update });

        revalidateTopicPaths(slug);
        if (input.slug && input.slug !== slug) revalidateTopicPaths(input.slug);

        return success(true, 'Topic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update topic');
    }
};
