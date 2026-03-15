'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';

interface IArticleReorderRef {
    slug: string;
    subtopicId: ObjectId | null;
}

// ========================================================
// Reorder
// ========================================================

export const reorderArticles = async (
    topicSlug: string,
    slugs: string[],
    subtopicSlug?: string,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!slugs.length) return success(true);

        await connectDB();
        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const now = new Date();
        const baseFilter: Record<string, unknown> = { type: 'article', topicId: topic._id };

        if (typeof subtopicSlug === 'string') {
            const articles = await Content.find({ ...baseFilter, slug: { $in: slugs } })
                .select('slug subtopicId')
                .lean<IArticleReorderRef[]>();
            const targetSubtopic = articles.find((a) => a.slug === slugs[0])?.subtopicId ?? null;
            Object.assign(baseFilter, { subtopicId: targetSubtopic });
        }

        await Content.bulkWrite(
            slugs.map((slug, index) => ({
                updateOne: {
                    filter: { ...baseFilter, slug },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        revalidateArticlePaths(topicSlug);
        return success(true, 'Articles reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder articles');
    }
};
