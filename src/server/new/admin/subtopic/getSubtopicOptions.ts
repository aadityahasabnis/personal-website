'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';

// ========================================================
// Lightweight subtopic list for select dropdowns
// ========================================================

export interface ISubtopicOption {
    id: string;
    topicId: string;
    title: string;
    slug: string;
}

export const getSubtopicOptions = async (): Promise<IApiResponse<ISubtopicOption[]>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const subtopics = await Subtopic.find({})
            .select('_id topicId title slug')
            .sort({ order: 1, title: 1 })
            .lean();

        const options: ISubtopicOption[] = subtopics.map((s) => ({
            id: s._id.toString(),
            topicId: s.topicId.toString(),
            title: s.title,
            slug: s.slug,
        }));

        return success(options);
    } catch (err) {
        return handleError(err, 'Failed to fetch subtopic options');
    }
};