'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IArticle } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, error, handleError, logUpdate, logReorder } from '../utils';

// ===== RESPONSE TYPES =====

export interface ToggleFeaturedResponse extends ActionResponse<boolean> {}
export interface ReorderArticlesResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);

const findArticle = async (topicSlug: string, slug: string) => 
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug });

const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    ['/articles', '/admin/articles', `/articles/${topicSlug}`, '/sitemap.xml', '/'].forEach(p => revalidatePath(p));
    if (articleSlug) {
        revalidatePath(`/articles/${topicSlug}/${articleSlug}`);
    }
};

// ===== SERVER ACTIONS =====

export const toggleArticleFeatured = async (topicSlug: string, slug: string): Promise<ToggleFeaturedResponse> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFound('Article');

        const newFeatured = !article.featured;
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateArticlePaths(topicSlug, slug);
        
        await logUpdate('article', article.title, article._id?.toString(), { featured: newFeatured });

        return success(newFeatured, newFeatured ? 'Article featured' : 'Article unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to update article');
    }
};

export const reorderArticles = async (
    topicSlug: string, 
    subtopicSlug: string | undefined,
    slugs: string[]
): Promise<ReorderArticlesResponse> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return error('Invalid slugs array');
        }

        const collection = await getContentCollection();
        await Promise.all(slugs.map((slug, index) => {
            const filter: Record<string, unknown> = { type: 'article', topicSlug, slug };
            if (subtopicSlug) filter.subtopicSlug = subtopicSlug;
            return collection.updateOne(filter, { $set: { order: index, updatedAt: new Date() } });
        }));

        revalidateArticlePaths(topicSlug);
        
        await logReorder('article', { topicSlug, subtopicSlug, count: slugs.length });
        
        return success(undefined, 'Articles reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder articles');
    }
};
