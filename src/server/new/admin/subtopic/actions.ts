'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import { deleteSubtopic } from './deleteSubtopic';

const parseSubtopicObjectIds = (subtopicIds: string[]): ObjectId[] | null => {
    if (!subtopicIds.every((id) => ObjectId.isValid(id))) return null;
    return subtopicIds.map((id) => new ObjectId(id));
};

// ========================================================
// Quick Actions
// ========================================================

export const toggleSubtopicPublished = async (
    subtopicId: string,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();
        const subtopic = await Subtopic.findById(subtopicId).select('_id topicId published').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const published = !subtopic.published;
        await Subtopic.updateOne({ _id: subtopic._id }, { $set: { published, ...updatedNow() } });

        const topic = await Topic.findById(subtopic.topicId).select('slug').lean();
        revalidateSubtopicPaths(topic?.slug);

        return success(published, published ? 'Subtopic published' : 'Subtopic unpublished');
    } catch (err) {
        return handleError(err, 'Failed to toggle subtopic published');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteSubtopics = async (
    subtopicIds: string[],
    cascade = false,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!subtopicIds.every((id) => ObjectId.isValid(id))) return error('One or more subtopic ids are invalid', 400);

        for (const subtopicId of subtopicIds) {
            const result = await deleteSubtopic(subtopicId, cascade);
            if (!result.success) return result;
        }
        return success(true, 'Subtopics deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete subtopics');
    }
};

export const bulkPublishSubtopics = async (
    subtopicIds: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        const objectIds = parseSubtopicObjectIds(subtopicIds);
        if (!objectIds) return error('One or more subtopic ids are invalid', 400);

        await connectDB();
        const topicIds = await Subtopic.distinct('topicId', { _id: { $in: objectIds } });

        await Subtopic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { published: true, ...updatedNow() } }
        );

        const topics = await Topic.find({ _id: { $in: topicIds } }).select('slug').lean();
        topics.forEach((topic) => revalidateSubtopicPaths(topic.slug));
        if (!topics.length) revalidateSubtopicPaths();
        return success(true, 'Subtopics published successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk publish subtopics');
    }
};

export const bulkUnpublishSubtopics = async (
    subtopicIds: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        const objectIds = parseSubtopicObjectIds(subtopicIds);
        if (!objectIds) return error('One or more subtopic ids are invalid', 400);

        await connectDB();
        const topicIds = await Subtopic.distinct('topicId', { _id: { $in: objectIds } });

        await Subtopic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { published: false, ...updatedNow() } }
        );

        const topics = await Topic.find({ _id: { $in: topicIds } }).select('slug').lean();
        topics.forEach((topic) => revalidateSubtopicPaths(topic.slug));
        if (!topics.length) revalidateSubtopicPaths();
        return success(true, 'Subtopics unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unpublish subtopics');
    }
};

/*
API Responses:
- toggleSubtopicPublished
    - 200: Published status toggled and returned as boolean data.
    - 400: Invalid subtopic id.
    - 404: Subtopic not found.
    - 500: Unexpected server/database error.
- bulkDeleteSubtopics
    - 200: All requested subtopics deleted successfully.
    - 400: One or more subtopic ids invalid (propagated from deleteSubtopic).
    - 404: Any requested subtopic not found (propagated from deleteSubtopic).
    - 409: Cascade required due to related content (propagated from deleteSubtopic).
    - 500: Unexpected server/database error.
- bulkPublishSubtopics
    - 200: Requested subtopics published successfully.
    - 400: One or more subtopic ids are invalid.
    - 500: Unexpected server/database error.
- bulkUnpublishSubtopics
    - 200: Requested subtopics unpublished successfully.
    - 400: One or more subtopic ids are invalid.
    - 500: Unexpected server/database error.
*/
