'use server';

import { CONTENT_TYPES } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import { handleError, success } from '../../../utils/helper';
import { buildPublishedContentMatch, toStableSort } from '../shared';
import {
    getPublishedTopicBySlug,
    toArticleCard,
    toTopicSummary,
    type IArticleLean,
    type ISubtopicLean,
} from './shared';
import type { IPublicArticleCard, IPublicSubtopicSection, IPublicTopicTree } from './types';

// ========================================================
// Query: Topic Tree
// ========================================================

export const getPublishedTopicTreeBySlug = async (
    topicSlug: string,
): Promise<IApiResponse<IPublicTopicTree | null>> => {
    try {
        await connectDB();

        const topic = await getPublishedTopicBySlug(topicSlug);
        if (!topic) return success(null);

        const [subtopics, articles] = await Promise.all([
            Subtopic.find({ topicId: topic._id, published: true })
                .sort(toStableSort({ order: 1, updatedAt: -1 }))
                .select('_id slug title description order contentCount')
                .lean<ISubtopicLean[]>(),
            Content.find(
                buildPublishedContentMatch(CONTENT_TYPES.ARTICLE, {
                    topicId: topic._id,
                })
            )
                .sort(toStableSort({ subtopicId: 1, order: 1, publishedAt: -1 }))
                .select('_id slug title description readingTime order featured publishedAt subtopicId')
                .lean<IArticleLean[]>(),
        ]);

        const articleCards = articles.map(toArticleCard);
        const bySubtopic = new Map<string, IPublicArticleCard[]>();

        for (let index = 0; index < articles.length; index += 1) {
            const article = articles[index];
            if (!article.subtopicId) continue;

            const key = article.subtopicId.toString();
            const list = bySubtopic.get(key) ?? [];
            list.push(articleCards[index]);
            bySubtopic.set(key, list);
        }

        const sections: IPublicSubtopicSection[] = subtopics.map((subtopic) => ({
            id: subtopic._id.toString(),
            slug: subtopic.slug,
            title: subtopic.title,
            description: subtopic.description ?? null,
            order: subtopic.order ?? 0,
            contentCount: subtopic.contentCount ?? 0,
            articles: bySubtopic.get(subtopic._id.toString()) ?? [],
        }));

        const uncategorizedArticles = articleCards.filter((_, index) => !articles[index].subtopicId);

        return success({
            topic: toTopicSummary(topic),
            subtopics: sections,
            uncategorizedArticles,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch topic content tree');
    }
};

/*
API Responses:
- 200: Published topic tree returned (or null when topic not found/published).
- 500: Unexpected server/database error.
*/
