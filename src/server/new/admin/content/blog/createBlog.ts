'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import { created, error, handleError, timestamps } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateBlogPaths } from '../../shared';
import { isDuplicateSlugError, isValidPublishStatus } from './helpers';
import type { IBlogCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createBlog = async (input: IBlogCreateInput): Promise<IApiResponse<string>> => {
    try {
        const publishStatus: PublishStatusType = input.publishStatus ?? PUBLISH_STATUS.DRAFT;
        if (!isValidPublishStatus(publishStatus)) return error('Invalid publish status', 400);

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const now = timestamps();
        const createdBlog = await Content.create({
            type: 'blog',
            slug: input.slug,
            title: input.title,
            description: input.description,
            body: input.body,
            tags: input.tags ?? [],
            coverImage: input.coverImage ?? null,
            readingTime: input.readingTime ?? calculateReadingTime(input.body),
            publishStatus,
            publishedAt: publishStatus === PUBLISH_STATUS.PUBLISHED ? new Date() : null,
            featured: input.featured ?? false,
            seo: buildSeo(input.seo),
            createdBy: admin.data,
            updatedBy: admin.data,
            ...now,
        });

        revalidateBlogPaths(input.slug);
        return created(createdBlog._id.toString(), 'Blog created successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Blog with this slug already exists', 409);
        return handleError(err, 'Failed to create blog');
    }
};

/*
API Responses:
- 201: Blog created successfully.
- 400: Invalid publish status.
- 401: Unauthorized admin session.
- 409: Blog slug already exists.
- 500: Unexpected server/database error.
*/
