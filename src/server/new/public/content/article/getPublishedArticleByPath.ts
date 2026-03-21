'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { handleError, success } from '../../../utils/helper';
import { toIsoOrNull } from '../../shared';
import {
    getPublishedArticleRecordByPath,
    getPublishedSubtopicById,
    getPublishedTopicBySlug,
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

        return success({
            id: article._id.toString(),
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            html: article.html ?? null,
            tags: article.tags ?? [],
            coverImage: article.coverImage ?? null,
            readingTime: article.readingTime ?? 0,
            featured: Boolean(article.featured),
            publishedAt: toIsoOrNull(article.publishedAt),
            updatedAt: article.updatedAt.toISOString(),
            topic: {
                id: topic._id.toString(),
                slug: topic.slug,
                title: topic.title,
            },
            subtopic: subtopic
                ? {
                      id: subtopic._id.toString(),
                      slug: subtopic.slug,
                      title: subtopic.title,
                  }
                : null,
            seo: article.seo
                ? {
                      title: article.seo.title ?? null,
                      description: article.seo.description ?? null,
                      keywords: article.seo.keywords ?? [],
                      ogImage: article.seo.ogImage ?? null,
                      canonicalUrl: article.seo.canonicalUrl ?? null,
                      noIndex: Boolean(article.seo.noIndex),
                  }
                : null,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch article');
    }
};

/*
API Responses:
- 200: Published article payload returned (or null when topic/article not found/published).
- 500: Unexpected server/database error.
*/
