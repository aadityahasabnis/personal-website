'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Publish
// ========================================================

export const publishSubtopic = async (subtopicId: string): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();

        const subtopic = await Subtopic.findById(subtopicId).select('_id topicId').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const topic = await Topic.findById(subtopic.topicId).select('slug').lean();

        const updated = await Subtopic.updateOne(
            { _id: subtopic._id },
            { $set: { published: true, ...updatedNow() } }
        );

        if (!updated.matchedCount) return error('Subtopic not found', 404);
        revalidateSubtopicPaths(topic?.slug);

        return success(true, 'Subtopic published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish subtopic');
    }
};

export const unpublishSubtopic = async (subtopicId: string): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();

        const subtopic = await Subtopic.findById(subtopicId).select('_id topicId').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const topic = await Topic.findById(subtopic.topicId).select('slug').lean();

        const updated = await Subtopic.updateOne(
            { _id: subtopic._id },
            { $set: { published: false, ...updatedNow() } }
        );

        if (!updated.matchedCount) return error('Subtopic not found', 404);
        revalidateSubtopicPaths(topic?.slug);

        return success(true, 'Subtopic unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish subtopic');
    }
};

/*
API Responses:
- 200: Subtopic published/unpublished successfully.
- 400: Invalid subtopic id.
- 404: Subtopic not found.
- 500: Unexpected server/database error.
*/
