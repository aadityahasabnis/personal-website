'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { handleError, success } from '../../../utils/helper';
import {
    getPublishedArticleRecordByPath,
    getPublishedSubtopicById,
    getPublishedTopicBySlug,
    toPublicArticleDetail,
} from './shared';
import type { IPublicArticleDetail } from './types';

// ========================================================
// Query: Article By Path
// ========================================================

export const getPublishedArticleByPath = async (
    topicSlug: string,
    articleSlug: string,
): Promise<IApiResponse<IPublicArticleDetail | null>> => {
    try {
        await connectDB();

        const topic = await getPublishedTopicBySlug(topicSlug);
        if (!topic) return success(null);

        const article = await getPublishedArticleRecordByPath(topic._id, articleSlug);
        if (!article) return success(null);

        const subtopic = article.subtopicId
            ? await getPublishedSubtopicById(article.subtopicId, topic._id)
            : null;

        return success(toPublicArticleDetail(article, topic, subtopic));
    } catch (err) {
        return handleError(err, 'Failed to fetch article');
    }
};

/*
API Responses:
- 200: Published article payload returned (or null when topic/article not found/published).
- 500: Unexpected server/database error.
*/
