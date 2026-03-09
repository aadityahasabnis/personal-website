/**
 * Article Helpers
 * 
 * Shared utilities for article operations across admin and public actions.
 */

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticle, ISubtopic } from '@/interfaces/schema';

// ==============================================================
// Collection Helpers
// ==============================================================

export const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);
export const getTopicsCollection = () => getCollection(COLLECTIONS.topics);
export const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);
export const getStatsCollection = () => getCollection(COLLECTIONS.articleStats);
export const getCommentsCollection = () => getCollection(COLLECTIONS.comments);

// ==============================================================
// Query Helpers
// ==============================================================

export const findArticle = async (topicSlug: string, slug: string) =>
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug });

export const findPublishedArticle = async (topicSlug: string, slug: string) =>
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug, published: true });

export const verifyTopicExists = async (topicSlug: string): Promise<boolean> => {
    const topic = await (await getTopicsCollection()).findOne({ slug: topicSlug });
    return !!topic;
};

export const verifySubtopicExists = async (topicSlug: string, subtopicSlug: string): Promise<boolean> => {
    const subtopic = await (await getSubtopicsCollection()).findOne({ topicSlug, slug: subtopicSlug });
    return !!subtopic;
};

// ==============================================================
// Revalidation Helpers
// ==============================================================

export const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    const paths = ['/articles', '/admin/articles', `/articles/${topicSlug}`, '/sitemap.xml'];
    if (articleSlug) {
        paths.push(`/articles/${topicSlug}/${articleSlug}`);
        paths.push(`/admin/articles/${topicSlug}/${articleSlug}/edit`);
    }
    paths.forEach(p => revalidatePath(p));
};

export const revalidateHomePage = (): void => {
    revalidatePath('/');
};

// ==============================================================
// Count Update Helpers
// ==============================================================

export const updateTopicArticleCount = async (topicSlug: string, delta: number): Promise<void> => {
    const collection = await getTopicsCollection();
    await collection.updateOne(
        { slug: topicSlug },
        { $inc: { 'metadata.articleCount': delta }, $set: { 'metadata.lastUpdated': new Date() } }
    );
};

export const updateSubtopicArticleCount = async (
    topicSlug: string,
    subtopicSlug: string,
    delta: number
): Promise<void> => {
    const collection = await getSubtopicsCollection();
    await collection.updateOne(
        { topicSlug, slug: subtopicSlug },
        { $inc: { 'metadata.articleCount': delta } }
    );
};

export const updateArticleCounts = async (
    topicSlug: string,
    subtopicSlug: string | undefined,
    delta: number
): Promise<void> => {
    await updateTopicArticleCount(topicSlug, delta);
    if (subtopicSlug) {
        await updateSubtopicArticleCount(topicSlug, subtopicSlug, delta);
    }
};
