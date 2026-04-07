'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId, revalidateTopicPaths } from '../shared';
import { deleteTopic } from './deleteTopic';
import { publishTopic, unpublishTopic } from './publishTopic';

const parseTopicObjectIds = (topicIds: string[]): ObjectId[] | null => {
    if (!topicIds.every((id) => ObjectId.isValid(id))) return null;
    return topicIds.map((id) => new ObjectId(id));
};

// ========================================================
// Quick Actions
// ========================================================

export const toggleTopicPublished = async (topicId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id published').lean();
        if (!topic) return error('Topic not found', 404);

        return topic.published ? unpublishTopic(topic._id.toString()) : publishTopic(topic._id.toString());
    } catch (err) {
        return handleError(err, 'Failed to toggle published');
    }
};

export const toggleTopicFeatured = async (topicId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id slug featured').lean();
        if (!topic) return { success: false, status: 404, error: 'Topic not found' };

        const featured = !topic.featured;
        await Topic.updateOne({ _id: topic._id }, { $set: { featured, ...updatedNow() } });
        revalidateTopicPaths(topic.slug);

        return success(featured, featured ? 'Topic featured' : 'Topic unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle featured');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteTopics = async (topicIds: string[], cascade = false): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!topicIds.every((id) => ObjectId.isValid(id))) return error('One or more topic ids are invalid', 400);

        for (const topicId of topicIds) {
            const result = await deleteTopic(topicId, cascade);
            if (!result.success) return result;
        }
        return success(true, 'Topics deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete topics');
    }
};

export const bulkPublishTopics = async (topicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectIds = parseTopicObjectIds(topicIds);
        if (!objectIds) return error('One or more topic ids are invalid', 400);

        await connectDB();
        await Topic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { published: true, ...updatedNow() } }
        );
        revalidateTopicPaths();
        return success(true, 'Topics published successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk publish topics');
    }
};

export const bulkUnpublishTopics = async (topicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectIds = parseTopicObjectIds(topicIds);
        if (!objectIds) return error('One or more topic ids are invalid', 400);

        await connectDB();
        await Topic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { published: false, ...updatedNow() } }
        );
        revalidateTopicPaths();
        return success(true, 'Topics unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unpublish topics');
    }
};

export const bulkFeatureTopics = async (topicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectIds = parseTopicObjectIds(topicIds);
        if (!objectIds) return error('One or more topic ids are invalid', 400);

        await connectDB();
        await Topic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { featured: true, ...updatedNow() } }
        );
        revalidateTopicPaths();
        return success(true, 'Topics featured successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk feature topics');
    }
};

export const bulkUnfeatureTopics = async (topicIds: string[]): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectIds = parseTopicObjectIds(topicIds);
        if (!objectIds) return error('One or more topic ids are invalid', 400);

        await connectDB();
        await Topic.updateMany(
            { _id: { $in: objectIds } },
            { $set: { featured: false, ...updatedNow() } }
        );
        revalidateTopicPaths();
        return success(true, 'Topics unfeatured successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unfeature topics');
    }
};

/*
API Responses:
- 200: Toggle/bulk action completed successfully.
- 400: Invalid topic id or invalid id list.
- 404: Topic not found.
- 500: Unexpected server/database error.
*/
