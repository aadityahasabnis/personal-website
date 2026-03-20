'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { buildSort, error, handleError, normalizePagination, paginated, success } from '../../../utils/helper';
import type { IBlogEdit, IBlogRow, IBlogTableQuery } from './types';

interface IBlogListDoc {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    publishStatus?: string;
    featured?: boolean;
    readingTime?: number;
    publishedAt?: Date | null;
    updatedAt: Date;
}

interface IBlogEditDoc extends IBlogListDoc {
    body: string;
    tags?: string[];
    coverImage?: string | null;
    seo?: IBlogEdit['seo'];
}

// ========================================================
// Queries
// ========================================================

export const getBlogs = async (params: IBlogTableQuery = {}): Promise<IPaginatedResponse<IBlogRow>> => {
    try {
        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { updatedAt: -1 });
        const match: Record<string, unknown> = { type: 'blog' };

        if (typeof params.publishStatus === 'string') match.publishStatus = params.publishStatus;
        if (typeof params.featured === 'boolean') match.featured = params.featured;
        if (params.query?.trim()) {
            const q = params.query.trim();
            match.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { slug: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
            ];
        }

        const [docs, total] = await Promise.all([
            Content.find(match)
                .select('_id slug title description publishStatus featured readingTime publishedAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean<IBlogListDoc[]>(),
            Content.countDocuments(match),
        ]);

        const rows: IBlogRow[] = docs.map((doc) => ({
            id: doc._id.toString(),
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            publishStatus: (doc.publishStatus ?? PUBLISH_STATUS.DRAFT) as IBlogRow['publishStatus'],
            featured: doc.featured ?? false,
            readingTime: doc.readingTime ?? 0,
            publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
            updatedAt: doc.updatedAt.toISOString(),
        }));

        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch blogs') as IPaginatedResponse<IBlogRow>;
    }
};

export const getBlogForEdit = async (
    blogId: string,
): Promise<IApiResponse<IBlogEdit | null>> => {
    try {
        if (!ObjectId.isValid(blogId)) return error('Invalid blog id', 400);

        await connectDB();

        const doc = await Content.findOne({
            type: 'blog',
            _id: blogId,
        })
            .select('_id slug title description body tags coverImage publishStatus featured readingTime publishedAt seo updatedAt')
            .lean<IBlogEditDoc | null>();

        if (!doc) return success(null);

        const payload: IBlogEdit = {
            id: doc._id.toString(),
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            body: doc.body,
            tags: doc.tags ?? [],
            coverImage: doc.coverImage ?? null,
            publishStatus: (doc.publishStatus ?? PUBLISH_STATUS.DRAFT) as IBlogEdit['publishStatus'],
            featured: doc.featured ?? false,
            readingTime: doc.readingTime ?? 0,
            publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
            seo: doc.seo ?? null,
            updatedAt: doc.updatedAt.toISOString(),
        };

        return success(payload);
    } catch (err) {
        return handleError(err, 'Failed to fetch blog');
    }
};

/*
API Responses:
- getBlogs
    - 200: Blogs list returned with pagination metadata.
    - 500: Unexpected server/database error.
- getBlogForEdit
    - 200: Blog edit payload returned (or null data when not found).
    - 400: Invalid blog id.
    - 500: Unexpected server/database error.
*/
