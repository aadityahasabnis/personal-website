'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Reorder
// ========================================================

export const reorderSubtopics = async (topicId: string, subtopicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        if (!subtopicIds.length) return success(true);
        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);
        if (!subtopicIds.every((id) => ObjectId.isValid(id))) return error('One or more subtopic ids are invalid', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        const topicScopedCount = await Subtopic.countDocuments({
            topicId: topic._id,
            _id: { $in: subtopicIds.map((id) => new ObjectId(id)) },
        });

        if (topicScopedCount !== subtopicIds.length) {
            return error('One or more subtopics do not belong to the topic', 404);
        }

        const now = new Date();
        await Subtopic.bulkWrite(
            subtopicIds.map((id, index) => ({
                updateOne: {
                    filter: { topicId: topic._id, _id: new ObjectId(id) },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        revalidateSubtopicPaths(topic.slug);
        return success(true, 'Subtopics reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder subtopics');
    }
};

/*
API Responses:
- 200: Subtopics reordered successfully.
- 400: Invalid topic id or invalid subtopic id list.
- 404: Topic not found, or one or more subtopics are outside the topic.
- 500: Unexpected server/database error.
*/
