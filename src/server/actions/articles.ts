'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import { calculateReadingTime } from '@/lib/utils';
import type { IArticle } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { updateTopicArticleCount } from './topics';
import { updateSubtopicArticleCount } from './subtopics';
import { createAction, createErrorResponse, createSuccessResponse, notFoundError, duplicateError } from '@/server/lib/action-utils';
import { articleCreateSchema, articleUpdateSchema, type ArticleCreateInput, type ArticleUpdateInput } from '@/server/schemas';

// ==============================================================
// Helpers
// ==============================================================

const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);

const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    ['/articles', '/admin/articles', `/articles/${topicSlug}`, '/sitemap.xml'].forEach(p => revalidatePath(p));
    if (articleSlug) {
        revalidatePath(`/articles/${topicSlug}/${articleSlug}`);
        revalidatePath(`/admin/articles/${topicSlug}/${articleSlug}/edit`);
    }
};

const findArticle = async (topicSlug: string, slug: string) => 
    (await getContentCollection()).findOne({ type: 'article', topicSlug, slug });

const verifyTopicExists = async (topicSlug: string) => {
    const topic = await (await getCollection(COLLECTIONS.topics)).findOne({ slug: topicSlug });
    return !!topic;
};

const verifySubtopicExists = async (topicSlug: string, subtopicSlug: string) => {
    const subtopic = await (await getCollection(COLLECTIONS.subtopics)).findOne({ topicSlug, slug: subtopicSlug });
    return !!subtopic;
};

const updateArticleCounts = async (topicSlug: string, subtopicSlug: string | undefined, delta: number) => {
    await updateTopicArticleCount(topicSlug, delta);
    if (subtopicSlug) await updateSubtopicArticleCount(topicSlug, subtopicSlug, delta);
};

// ==============================================================
// Server Actions
// ==============================================================

export const createArticle = createAction<ArticleCreateInput, string>({
    schema: articleCreateSchema,
    handler: async (data) => {
        const collection = await getContentCollection();
        
        // Check for existing
        if (await collection.findOne({ type: 'article', topicSlug: data.topicSlug, slug: data.slug })) {
            throw { response: duplicateError('An article with this slug already exists in this topic') };
        }
        
        // Verify topic exists
        if (!(await verifyTopicExists(data.topicSlug))) {
            throw { response: createErrorResponse('Topic not found', 400) };
        }
        
        // Verify subtopic if provided
        if (data.subtopicSlug && !(await verifySubtopicExists(data.topicSlug, data.subtopicSlug))) {
            throw { response: createErrorResponse('Subtopic not found', 400) };
        }

        const now = new Date();
        const article: Omit<IArticle, '_id'> = {
            type: 'article',
            ...data,
            coverImage: data.coverImage || undefined,
            readingTime: data.readingTime || calculateReadingTime(data.body),
            html: data.html,
            tableOfContents: data.tableOfContents as IArticle['tableOfContents'],
            published: false,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(article as IArticle);
        revalidateArticlePaths(data.topicSlug, data.slug);
        return result.insertedId.toString();
    },
    errorMessage: 'Failed to create article. Please try again.',
});

export const updateArticle = async (
    topicSlug: string, 
    slug: string, 
    data: ArticleUpdateInput
): Promise<IApiResponse<void>> => {
    try {
        const parsed = articleUpdateSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getContentCollection();
        const existing = await findArticle(topicSlug, slug);
        if (!existing) return notFoundError('Article');

        // Check slug conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const conflict = await collection.findOne({ 
                type: 'article', 
                topicSlug: parsed.data.topicSlug || topicSlug, 
                slug: parsed.data.slug 
            });
            if (conflict) return duplicateError('An article with this slug');
        }

        // Verify new topic if changing
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            if (!(await verifyTopicExists(parsed.data.topicSlug))) {
                return createErrorResponse('New topic not found', 400);
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
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ type: 'article', topicSlug, slug }, { $set: updateData });

        // Handle topic change counts
        if (existing.published && parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            await updateArticleCounts(topicSlug, existing.subtopicSlug, -1);
            await updateArticleCounts(parsed.data.topicSlug, parsed.data.subtopicSlug, 1);
        }

        revalidateArticlePaths(topicSlug, slug);
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            revalidateArticlePaths(parsed.data.topicSlug, parsed.data.slug || slug);
        }

        return createSuccessResponse(undefined, 'Article updated successfully');
    } catch (error) {
        console.error('Failed to update article:', error);
        return createErrorResponse('Failed to update article. Please try again.', 500);
    }
};

export const publishArticle = async (topicSlug: string, slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        
        if (!article) return notFoundError('Article');
        if (article.published) return createErrorResponse('Article is already published');

        const now = new Date();
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { published: true, publishedAt: now, updatedAt: now } }
        );

        await updateArticleCounts(topicSlug, article.subtopicSlug, 1);
        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/');

        return createSuccessResponse(undefined, 'Article published successfully');
    } catch (error) {
        console.error('Failed to publish article:', error);
        return createErrorResponse('Failed to publish article. Please try again.', 500);
    }
};

export const unpublishArticle = async (topicSlug: string, slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        
        if (!article) return notFoundError('Article');
        if (!article.published) return createErrorResponse('Article is already unpublished');

        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { published: false, updatedAt: new Date() }, $unset: { publishedAt: '' } }
        );

        await updateArticleCounts(topicSlug, article.subtopicSlug, -1);
        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/');

        return createSuccessResponse(undefined, 'Article unpublished successfully');
    } catch (error) {
        console.error('Failed to unpublish article:', error);
        return createErrorResponse('Failed to unpublish article. Please try again.', 500);
    }
};

export const deleteArticle = async (topicSlug: string, slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        await collection.deleteOne({ type: 'article', topicSlug, slug });

        if (article.published) await updateArticleCounts(topicSlug, article.subtopicSlug, -1);

        // Cleanup associated data
        const [statsCollection, commentsCollection] = await Promise.all([
            getCollection(COLLECTIONS.articleStats),
            getCollection(COLLECTIONS.comments),
        ]);
        await Promise.all([
            statsCollection.deleteOne({ slug: `${topicSlug}/${slug}` }),
            commentsCollection.deleteMany({ articleSlug: `${topicSlug}/${slug}` }),
        ]);

        revalidateArticlePaths(topicSlug, slug);
        return createSuccessResponse(undefined, 'Article deleted successfully');
    } catch (error) {
        console.error('Failed to delete article:', error);
        return createErrorResponse('Failed to delete article. Please try again.', 500);
    }
};

export const reorderArticles = async (
    topicSlug: string, 
    subtopicSlug: string | undefined,
    slugs: string[]
): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return createErrorResponse('Invalid slugs array');
        }

        const collection = await getContentCollection();
        await Promise.all(slugs.map((slug, index) => {
            const filter: Record<string, unknown> = { type: 'article', topicSlug, slug };
            if (subtopicSlug) filter.subtopicSlug = subtopicSlug;
            return collection.updateOne(filter, { $set: { order: index, updatedAt: new Date() } });
        }));

        revalidateArticlePaths(topicSlug);
        return createSuccessResponse(undefined, 'Articles reordered successfully');
    } catch (error) {
        console.error('Failed to reorder articles:', error);
        return createErrorResponse('Failed to reorder articles. Please try again.', 500);
    }
};

export const toggleArticleFeatured = async (topicSlug: string, slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        const newFeatured = !article.featured;
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/');

        return createSuccessResponse(newFeatured, newFeatured ? 'Article featured' : 'Article unfeatured');
    } catch (error) {
        console.error('Failed to toggle article featured:', error);
        return createErrorResponse('Failed to update article. Please try again.', 500);
    }
};

export const toggleArticlePublished = async (topicSlug: string, slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        const newPublished = !article.published;
        const updateData: Partial<IArticle> = { published: newPublished, updatedAt: new Date() };
        if (newPublished && !article.publishedAt) updateData.publishedAt = new Date();

        await collection.updateOne({ type: 'article', topicSlug, slug }, { $set: updateData });
        await updateArticleCounts(topicSlug, article.subtopicSlug, newPublished ? 1 : -1);

        revalidateArticlePaths(topicSlug, slug);
        return createSuccessResponse(newPublished, newPublished ? 'Article published' : 'Article unpublished');
    } catch (error) {
        console.error('Failed to toggle article published:', error);
        return createErrorResponse('Failed to update article. Please try again.', 500);
    }
};
