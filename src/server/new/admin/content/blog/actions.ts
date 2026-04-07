'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { getAdminId, revalidateBlogPaths } from '../../shared';
import { isValidPublishStatus, normalizeBlogIds, toObjectIds, type IBlogActionBase } from './helpers';
import { changeBlogPublishStatus } from './publishBlog';

interface IBlogBulkStatusBase {
    _id: ObjectId;
    slug: string;
    publishStatus: PublishStatusType;
}

interface IBlogBulkDeleteBase {
    _id: ObjectId;
    slug: string;
}

// ========================================================
// Quick Actions
// ========================================================

export const setBlogStatus = async (
    blogId: string,
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);
        if (!isValidPublishStatus(status)) return error('Invalid publish status', 400);
        return changeBlogPublishStatus(blogId, status);
    } catch (err) {
        return handleError(err, 'Failed to set blog status');
    }
};

export const toggleBlogFeatured = async (
    blogId: string,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);

        await connectDB();

        const blog = await Content.findOne({ type: 'blog', _id: blogId })
            .select('featured')
            .lean<Pick<IBlogActionBase, 'featured'> | null>();

        if (!blog) return error('Blog not found', 404);
        return setBlogFeatured(blogId, !blog.featured);
    } catch (err) {
        return handleError(err, 'Failed to toggle blog featured');
    }
};

export const setBlogFeatured = async (
    blogId: string,
    featured: boolean,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);

        await connectDB();

        const blog = await Content.findOne({ type: 'blog', _id: blogId })
            .select('_id slug featured')
            .lean<Pick<IBlogActionBase, '_id' | 'slug' | 'featured'> | null>();
        if (!blog) return error('Blog not found', 404);

        if (blog.featured === featured) {
            return success(featured, featured ? 'Blog already featured' : 'Blog already unfeatured');
        }

        await Content.updateOne({ _id: blog._id }, { $set: { featured, ...updatedNow() } });
        revalidateBlogPaths(blog.slug);

        return success(featured, featured ? 'Blog featured' : 'Blog unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to set blog featured state');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteBlogs = async (
    blogIds: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!blogIds.length) return success(true, 'No blogs selected');
        if (!blogIds.every((id) => ObjectId.isValid(id))) return error('One or more blog ids are invalid', 400);

        const uniqueBlogIds = normalizeBlogIds(blogIds);
        const objectIds = toObjectIds(uniqueBlogIds);

        await connectDB();

        const blogs = await Content.find({
            type: 'blog',
            _id: { $in: objectIds },
        }).select('_id slug').lean<IBlogBulkDeleteBase[]>();

        if (blogs.length !== uniqueBlogIds.length) return error('One or more blogs not found', 404);

        await Promise.all([
            Content.deleteMany({ type: 'blog', _id: { $in: objectIds } }),
            PageStats.deleteMany({ contentId: { $in: objectIds } }),
            Comment.deleteMany({ contentId: { $in: objectIds } }),
        ]);

        blogs.forEach((blog) => revalidateBlogPaths(blog.slug));
        return success(true, 'Blogs deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete blogs');
    }
};

export const bulkPublishBlogs = async (
    blogIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetBlogStatus(blogIds, PUBLISH_STATUS.PUBLISHED);
};

export const bulkSetBlogStatus = async (
    blogIds: string[],
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!blogIds.length) return success(true, 'No blogs selected');
        if (!blogIds.every((id) => ObjectId.isValid(id))) return error('One or more blog ids are invalid', 400);
        if (!isValidPublishStatus(status)) return error('Invalid publish status', 400);

        const uniqueBlogIds = normalizeBlogIds(blogIds);
        const objectIds = toObjectIds(uniqueBlogIds);

        await connectDB();

        const blogs = await Content.find({
            type: 'blog',
            _id: { $in: objectIds },
        }).select('_id slug publishStatus').lean<IBlogBulkStatusBase[]>();

        if (blogs.length !== uniqueBlogIds.length) return error('One or more blogs not found', 404);

        const blogsToUpdate = blogs.filter((blog) => blog.publishStatus !== status);

        if (blogsToUpdate.length) {
            const updateIds = blogsToUpdate.map((blog) => blog._id);

            if (status === PUBLISH_STATUS.PUBLISHED) {
                await Content.updateMany(
                    { type: 'blog', _id: { $in: updateIds } },
                    {
                        $set: {
                            publishStatus: status,
                            publishedAt: new Date(),
                            ...updatedNow(),
                        },
                    }
                );
            } else {
                await Content.updateMany(
                    { type: 'blog', _id: { $in: updateIds } },
                    {
                        $set: {
                            publishStatus: status,
                            publishedAt: null,
                            ...updatedNow(),
                        },
                    }
                );
            }
        }

        blogs.forEach((blog) => revalidateBlogPaths(blog.slug));
        return success(true, `Blogs status changed to ${status}`);
    } catch (err) {
        return handleError(err, 'Failed to bulk set blog status');
    }
};

export const bulkArchiveBlogs = async (
    blogIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetBlogStatus(blogIds, PUBLISH_STATUS.ARCHIVED);
};

export const bulkDraftBlogs = async (
    blogIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetBlogStatus(blogIds, PUBLISH_STATUS.DRAFT);
};

/*
API Responses:
- setBlogStatus/setBlogFeatured/toggleBlogFeatured
    - 200: Action completed successfully.
    - 400: Invalid blog id.
    - 404: Blog not found.
    - 500: Unexpected server/database error.
- bulkDeleteBlogs/bulkSetBlogStatus/bulkPublishBlogs/bulkArchiveBlogs/bulkDraftBlogs
    - 200: Bulk action completed successfully.
    - 400: One or more blog ids are invalid.
    - 404: One or more requested blogs not found.
    - 500: Unexpected server/database error.
*/
