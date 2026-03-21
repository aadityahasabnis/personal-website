'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { error, handleError, success } from '../../../utils/helper';
import { parsePublicContentObjectId } from '../shared';
import {
    getPublishedArticleRecordById,
    getPublishedSubtopicById,
    getPublishedTopicById,
    toPublicArticleDetail,
} from './shared';
import type { IPublicArticleDetail } from './types';

// ========================================================
// Query: Article By Id
// ========================================================

export const getPublishedArticleById = async (
    contentId: string,
): Promise<IApiResponse<IPublicArticleDetail | null>> => {
    try {
        const objectId = parsePublicContentObjectId(contentId);
        if (!objectId) return error('Invalid content id', 400);

        await connectDB();

        const article = await getPublishedArticleRecordById(objectId);
        if (!article || !article.topicId) return success(null);

        const topic = await getPublishedTopicById(article.topicId);
        if (!topic) return success(null);

        const subtopic = article.subtopicId
            ? await getPublishedSubtopicById(article.subtopicId, topic._id)
            : null;

        return success(toPublicArticleDetail(article, topic, subtopic));
    } catch (err) {
        return handleError(err, 'Failed to fetch article by id');
    }
};

/*
API Responses:
- 200: Published article payload returned by content id (or null when not found/published).
- 400: Invalid content id.
- 500: Unexpected server/database error.
*/
