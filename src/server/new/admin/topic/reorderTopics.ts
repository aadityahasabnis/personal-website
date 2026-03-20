'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { revalidateTopicPaths } from '../shared';

// ========================================================
// Reorder
// ========================================================

export const reorderTopics = async (topicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        if (!topicIds.length) return success(true);
        if (!topicIds.every((id) => ObjectId.isValid(id))) return error('One or more topic ids are invalid', 400);

        await connectDB();
        const now = new Date();

        await Topic.bulkWrite(
            topicIds.map((id, index) => ({
                updateOne: {
                    filter: { _id: new ObjectId(id) },
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

/*
API Responses:
- 200: Topics reordered successfully.
- 400: One or more topic ids are invalid.
- 500: Unexpected server/database error.
*/
