'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateTopicPaths } from '../shared';
import { deleteTopic } from './deleteTopic';
import { publishTopic, unpublishTopic } from './publishTopic';

// ========================================================
// Quick Actions
// ========================================================

export const toggleTopicPublished = async (slug: string): Promise<IApiResponse<boolean>> => {
    await connectDB();
    const topic = await Topic.findOne({ slug }).select('published').lean();
    if (!topic) return { success: false, status: 404, error: 'Topic not found' };
    return topic.published ? unpublishTopic(slug) : publishTopic(slug);
};

export const toggleTopicFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug }).select('_id featured').lean();
        if (!topic) return { success: false, status: 404, error: 'Topic not found' };

        const featured = !topic.featured;
        await Topic.updateOne({ _id: topic._id }, { $set: { featured, ...updatedNow() } });
        revalidateTopicPaths(slug);

        return success(featured, featured ? 'Topic featured' : 'Topic unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle featured');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteTopics = async (slugs: string[], cascade = false): Promise<IApiResponse<boolean>> => {
    try {
        for (const slug of slugs) {
            const result = await deleteTopic(slug, cascade);
            if (!result.success) return result;
        }
        return success(true, 'Topics deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete topics');
    }
};

export const bulkPublishTopics = async (slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        await Topic.updateMany({ slug: { $in: slugs } }, { $set: { published: true, ...updatedNow() } });
        revalidateTopicPaths();
        return success(true, 'Topics published successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk publish topics');
    }
};

export const bulkUnpublishTopics = async (slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        await Topic.updateMany({ slug: { $in: slugs } }, { $set: { published: false, ...updatedNow() } });
        revalidateTopicPaths();
        return success(true, 'Topics unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unpublish topics');
    }
};

export const bulkFeatureTopics = async (slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        await Topic.updateMany({ slug: { $in: slugs } }, { $set: { featured: true, ...updatedNow() } });
        revalidateTopicPaths();
        return success(true, 'Topics featured successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk feature topics');
    }
};

export const bulkUnfeatureTopics = async (slugs: string[]): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        await Topic.updateMany({ slug: { $in: slugs } }, { $set: { featured: false, ...updatedNow() } });
        revalidateTopicPaths();
        return success(true, 'Topics unfeatured successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unfeature topics');
    }
};
