'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import { deleteSubtopic } from './deleteSubtopic';
import { publishSubtopic, unpublishSubtopic } from './publishSubtopic';

// ========================================================
// Quick Actions
// ========================================================

export const toggleSubtopicPublished = async (
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<boolean>> => {
    await connectDB();
    const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
    if (!topic) return error('Topic not found', 404);

    const subtopic = await Subtopic.findOne({ topicId: topic._id, slug }).select('published').lean();
    if (!subtopic) return error('Subtopic not found', 404);

    return subtopic.published ? unpublishSubtopic(topicSlug, slug) : publishSubtopic(topicSlug, slug);
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteSubtopics = async (
    topicSlug: string,
    slugs: string[],
    cascade = false,
): Promise<IApiResponse<boolean>> => {
    try {
        for (const slug of slugs) {
            const result = await deleteSubtopic(topicSlug, slug, cascade);
            if (!result.success) return result;
        }
        return success(true, 'Subtopics deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete subtopics');
    }
};

export const bulkPublishSubtopics = async (
    topicSlug: string,
    slugs: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        await Subtopic.updateMany(
            { topicId: topic._id, slug: { $in: slugs } },
            { $set: { published: true, ...updatedNow() } }
        );

        revalidateSubtopicPaths(topicSlug);
        return success(true, 'Subtopics published successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk publish subtopics');
    }
};

export const bulkUnpublishSubtopics = async (
    topicSlug: string,
    slugs: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        await Subtopic.updateMany(
            { topicId: topic._id, slug: { $in: slugs } },
            { $set: { published: false, ...updatedNow() } }
        );

        revalidateSubtopicPaths(topicSlug);
        return success(true, 'Subtopics unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unpublish subtopics');
    }
};
