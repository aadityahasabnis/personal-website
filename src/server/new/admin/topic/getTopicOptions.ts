'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';

// ========================================================
// Lightweight topic list for select dropdowns
// ========================================================

export interface ITopicOption {
    id: string;
    title: string;
    slug: string;
}

export const getTopicOptions = async (): Promise<IApiResponse<ITopicOption[]>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const topics = await Topic.find({})
            .select('_id title slug')
            .sort({ order: 1, title: 1 })
            .lean();

        const options: ITopicOption[] = topics.map((t) => ({
            id: t._id.toString(),
            title: t.title,
            slug: t.slug,
        }));

        return success(options);
    } catch (err) {
        return handleError(err, 'Failed to fetch topic options');
    }
};
