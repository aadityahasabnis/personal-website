'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateBlogPaths } from '../../shared';
import { isPublishedBlog, isValidPublishStatus, type IBlogActionBase } from './helpers';

// ========================================================
// Status Change
// ========================================================

export const changeBlogPublishStatus = async (
    blogId: string,
    nextStatus: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);
        if (!isValidPublishStatus(nextStatus)) return error('Invalid publish status', 400);

        await connectDB();

        const blog = await Content.findOne({
            type: 'blog',
            _id: blogId,
        }).select('_id slug publishStatus').lean<Pick<IBlogActionBase, '_id' | 'slug' | 'publishStatus'> | null>();

        if (!blog) return error('Blog not found', 404);
        if (blog.publishStatus === nextStatus) return success(true, `Blog already ${nextStatus}`);

        const wasPublished = isPublishedBlog(blog);
        const willBePublished = nextStatus === PUBLISH_STATUS.PUBLISHED;
        const nextPublishedAt = !wasPublished && willBePublished
            ? new Date()
            : wasPublished && !willBePublished
                ? null
                : undefined;

        await Content.updateOne(
            { _id: blog._id },
            {
                $set: {
                    publishStatus: nextStatus,
                    publishedAt: nextPublishedAt,
                    ...updatedNow(),
                },
            }
        );

        revalidateBlogPaths(blog.slug);
        return success(true, `Blog status changed to ${nextStatus}`);
    } catch (err) {
        return handleError(err, 'Failed to change blog status');
    }
};

export const setBlogPublished = async (blogId: string): Promise<IApiResponse<boolean>> => {
    return changeBlogPublishStatus(blogId, PUBLISH_STATUS.PUBLISHED);
};

export const setBlogDraft = async (blogId: string): Promise<IApiResponse<boolean>> => {
    return changeBlogPublishStatus(blogId, PUBLISH_STATUS.DRAFT);
};

export const setBlogArchived = async (blogId: string): Promise<IApiResponse<boolean>> => {
    return changeBlogPublishStatus(blogId, PUBLISH_STATUS.ARCHIVED);
};

/*
API Responses:
- changeBlogPublishStatus/setBlogPublished/setBlogDraft/setBlogArchived
    - 200: Action completed successfully.
    - 400: Invalid blog id or publish status.
    - 404: Blog not found.
    - 500: Unexpected server/database error.
*/
