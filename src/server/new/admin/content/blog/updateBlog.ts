'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateBlogPaths } from '../../shared';
import { isDuplicateSlugError, isPublishedBlog, isValidPublishStatus, type IBlogActionBase } from './helpers';
import type { IBlogUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateBlog = async (
    blogId: string,
    input: IBlogUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);
        if (input.publishStatus && !isValidPublishStatus(input.publishStatus)) return error('Invalid publish status', 400);

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const blog = await Content.findOne({
            type: 'blog',
            _id: blogId,
        }).select('_id slug publishStatus').lean<Pick<IBlogActionBase, '_id' | 'slug' | 'publishStatus'> | null>();

        if (!blog) return error('Blog not found', 404);

        const currentPublished = isPublishedBlog(blog);
        const nextPublishStatus: PublishStatusType = input.publishStatus ?? blog.publishStatus;
        const nextPublished = nextPublishStatus === PUBLISH_STATUS.PUBLISHED;
        const nextPublishedAt = !currentPublished && nextPublished
            ? new Date()
            : currentPublished && !nextPublished
                ? null
                : undefined;

        await Content.updateOne(
            { _id: blog._id },
            {
                $set: cleanUndefined({
                    slug: input.slug,
                    title: input.title,
                    description: input.description,
                    body: input.body,
                    tags: input.tags,
                    coverImage: input.coverImage,
                    readingTime: input.body ? calculateReadingTime(input.body) : input.readingTime,
                    publishStatus: nextPublishStatus,
                    publishedAt: nextPublishedAt,
                    featured: input.featured,
                    seo: input.seo ? buildSeo(input.seo) : undefined,
                    updatedBy: admin.data,
                    ...updatedNow(),
                }),
            }
        );

        revalidateBlogPaths(blog.slug);
        if (input.slug && input.slug !== blog.slug) revalidateBlogPaths(input.slug);
        return success(true, 'Blog updated successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Blog with this slug already exists', 409);
        return handleError(err, 'Failed to update blog');
    }
};

/*
API Responses:
- 200: Blog updated successfully.
- 400: Invalid blog id or publish status.
- 401: Unauthorized admin session.
- 404: Blog not found.
- 409: Blog slug conflict.
- 500: Unexpected server/database error.
*/
