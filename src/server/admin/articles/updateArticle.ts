'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import { calculateReadingTime } from '@/lib/utils';
import type { IArticle } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logUpdate } from '../utils';
import { updateTopicArticleCount } from '../topics/updateTopicArticleCount';
import { updateSubtopicArticleCount } from '../subtopics/updateSubtopicArticleCount';
import { articleUpdateSchema, type ArticleUpdateInput } from '@/server/schemas';

// ==============================================================
// Types
// ==============================================================

export type UpdateArticleRequest = ArticleUpdateInput;
export interface UpdateArticleResponse extends ActionResponse<void> {}

// ==============================================================
// Helpers
// ==============================================================

const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);

const findArticle = async (topicSlug: string, slug: string) => 
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug });

const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    ['/articles', '/admin/articles', `/articles/${topicSlug}`, '/sitemap.xml'].forEach(p => revalidatePath(p));
    if (articleSlug) {
        revalidatePath(`/articles/${topicSlug}/${articleSlug}`);
        revalidatePath(`/admin/articles/${topicSlug}/${articleSlug}/edit`);
    }
};

const verifyTopicExists = async (topicSlug: string): Promise<boolean> => {
    const topic = await (await getCollection(COLLECTIONS.topics)).findOne({ slug: topicSlug });
    return !!topic;
};

// ==============================================================
// Server Action
// ==============================================================

export const updateArticle = async (
    topicSlug: string, 
    slug: string, 
    data: UpdateArticleRequest
): Promise<UpdateArticleResponse> => {
    try {
        const parsed = articleUpdateSchema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getContentCollection();
        const existing = await findArticle(topicSlug, slug);
        if (!existing) return notFound('Article');

        // Check slug conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const conflict = await collection.findOne({ 
                type: 'article', 
                topicSlug: parsed.data.topicSlug || topicSlug, 
                slug: parsed.data.slug 
            });
            if (conflict) return duplicate('An article with this slug');
        }

        // Verify new topic if changing
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            if (!(await verifyTopicExists(parsed.data.topicSlug))) {
                return error('New topic not found');
            }
        }

        const updateData: Partial<IArticle> = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            tableOfContents: parsed.data.tableOfContents as IArticle['tableOfContents'],
            updatedAt: new Date(),
            ...(parsed.data.body && { readingTime: calculateReadingTime(parsed.data.body) }),
        };

        // Clean undefined
        Object.keys(updateData).forEach(k => 
            updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]
        );

        await collection.updateOne({ type: 'article', topicSlug, slug }, { $set: updateData });

        // Handle topic change counts
        if (existing.published && parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            await updateTopicArticleCount(topicSlug, -1);
            if (existing.subtopicSlug) await updateSubtopicArticleCount(topicSlug, existing.subtopicSlug, -1);
            await updateTopicArticleCount(parsed.data.topicSlug, 1);
            if (parsed.data.subtopicSlug) await updateSubtopicArticleCount(parsed.data.topicSlug, parsed.data.subtopicSlug, 1);
        }

        revalidateArticlePaths(topicSlug, slug);
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            revalidateArticlePaths(parsed.data.topicSlug, parsed.data.slug || slug);
        }

        await logUpdate('article', existing.title, existing._id?.toString());
        
        return success(undefined, 'Article updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update article');
    }
};
