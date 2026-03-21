'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { getAdminId, revalidateBlogPaths } from '../../shared';

interface IBlogDeleteBase {
    _id: ObjectId;
    slug: string;
}

// ========================================================
// Delete
// ========================================================

export const deleteBlog = async (blogId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);

        await connectDB();

        const blog = await Content.findOne({
            type: 'blog',
            _id: blogId,
        }).select('_id slug').lean<IBlogDeleteBase | null>();

        if (!blog) return error('Blog not found', 404);

        await Promise.all([
            Content.deleteOne({ _id: blog._id }),
            PageStats.deleteOne({ contentId: blog._id }),
            Comment.deleteMany({ contentId: blog._id }),
        ]);

        revalidateBlogPaths(blog.slug);
        return success(true, 'Blog deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete blog');
    }
};

/*
API Responses:
- 200: Blog deleted successfully.
- 400: Invalid blog id.
- 404: Blog not found.
- 500: Unexpected server/database error.
*/
