'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';

// ========================================================
// Reorder
// ========================================================

export const reorderArticles = async (
    topicId: string,
    articleIds: string[],
    subtopicId?: string | null,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!articleIds.length) return success(true);
        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);
        if (!articleIds.every((id) => ObjectId.isValid(id))) return error('One or more article ids are invalid', 400);
        if (typeof subtopicId === 'string' && !ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        const now = new Date();
        const baseFilter: Record<string, unknown> = { type: 'article', topicId: topic._id };
        if (typeof subtopicId === 'string') Object.assign(baseFilter, { subtopicId: new ObjectId(subtopicId) });
        if (subtopicId === null) Object.assign(baseFilter, { subtopicId: null });

        const scopedCount = await Content.countDocuments({
            ...baseFilter,
            _id: { $in: articleIds.map((id) => new ObjectId(id)) },
        });
        if (scopedCount !== articleIds.length) {
            return error('One or more articles are outside the requested topic/subtopic scope', 404);
        }

        await Content.bulkWrite(
            articleIds.map((id, index) => ({
                updateOne: {
                    filter: { ...baseFilter, _id: new ObjectId(id) },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        revalidateArticlePaths(topic.slug);
        return success(true, 'Articles reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder articles');
    }
};

/*
API Responses:
- 200: Articles reordered successfully.
- 400: Invalid topic/article/subtopic id input.
- 404: Topic not found, or one or more articles outside the requested scope.
- 500: Unexpected server/database error.
*/
