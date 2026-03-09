'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IArticle } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, error, handleError, logPublish, logUnpublish } from '../utils';
import { updateTopicArticleCount } from '../topics/updateTopicArticleCount';
import { updateSubtopicArticleCount } from '../subtopics/updateSubtopicArticleCount';

// ===== RESPONSE TYPES =====

export interface PublishArticleResponse extends ActionResponse<void> {}
export interface TogglePublishedResponse extends ActionResponse<boolean> {}

// ===== HELPERS =====

const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);

const findArticle = async (topicSlug: string, slug: string) => 
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug });

const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    ['/articles', '/admin/articles', `/articles/${topicSlug}`, '/sitemap.xml', '/'].forEach(p => revalidatePath(p));
    if (articleSlug) {
        revalidatePath(`/articles/${topicSlug}/${articleSlug}`);
        revalidatePath(`/admin/articles/${topicSlug}/${articleSlug}/edit`);
    }
};

// ===== SERVER ACTIONS =====

export const publishArticle = async (topicSlug: string, slug: string): Promise<PublishArticleResponse> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        
        if (!article) return notFound('Article');
        if (article.published) return error('Article is already published');

        const now = new Date();
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { published: true, publishedAt: now, updatedAt: now } }
        );

        await updateTopicArticleCount(topicSlug, 1);
        if (article.subtopicSlug) await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, 1);
        
        revalidateArticlePaths(topicSlug, slug);
        
        await logPublish('article', article.title, article._id?.toString());

        return success(undefined, 'Article published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish article');
    }
};

export const unpublishArticle = async (topicSlug: string, slug: string): Promise<PublishArticleResponse> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        
        if (!article) return notFound('Article');
        if (!article.published) return error('Article is already unpublished');

        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { published: false, updatedAt: new Date() }, $unset: { publishedAt: '' } }
        );

        await updateTopicArticleCount(topicSlug, -1);
        if (article.subtopicSlug) await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, -1);
        
        revalidateArticlePaths(topicSlug, slug);
        
        await logUnpublish('article', article.title, article._id?.toString());

        return success(undefined, 'Article unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish article');
    }
};

export const toggleArticlePublished = async (topicSlug: string, slug: string): Promise<TogglePublishedResponse> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFound('Article');

        const newPublished = !article.published;
        const updateData: Partial<IArticle> = { published: newPublished, updatedAt: new Date() };
        if (newPublished && !article.publishedAt) updateData.publishedAt = new Date();

        await collection.updateOne({ type: 'article', topicSlug, slug }, { $set: updateData });
        
        await updateTopicArticleCount(topicSlug, newPublished ? 1 : -1);
        if (article.subtopicSlug) await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, newPublished ? 1 : -1);

        revalidateArticlePaths(topicSlug, slug);
        
        if (newPublished) {
            await logPublish('article', article.title, article._id?.toString());
        } else {
            await logUnpublish('article', article.title, article._id?.toString());
        }
        
        return success(newPublished, newPublished ? 'Article published' : 'Article unpublished');
    } catch (err) {
        return handleError(err, 'Failed to update article');
    }
};
