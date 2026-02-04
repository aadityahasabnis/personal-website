'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { IArticle, IApiResponse } from '@/interfaces';
import { updateTopicArticleCount } from './topics';
import { updateSubtopicArticleCount } from './subtopics';

// ===== VALIDATION SCHEMAS =====

const articleInputSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    
    // Markdown content
    body: z.string().min(1, 'Article body is required'),
    
    // Pre-rendered HTML for SSR (generated on save)
    html: z.string().optional(),
    
    // Table of contents extracted from headings
    tableOfContents: z.array(z.object({
        id: z.string(),
        text: z.string(),
        level: z.number(),
    })).optional(),
    
    topicSlug: z.string().min(1, 'Topic is required'),
    subtopicSlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    readingTime: z.number().int().min(1).optional(),
    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        ogImage: z.string().url().optional().or(z.literal('')),
    }).optional(),
});

const articleUpdateSchema = articleInputSchema.partial().extend({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
    body: z.string().optional(), // Make body optional for updates
    tableOfContents: z.array(z.object({
        id: z.string(),
        text: z.string(),
        level: z.number(),
    })).optional(),
});

type ArticleInput = z.infer<typeof articleInputSchema>;
type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

// ===== HELPER FUNCTIONS =====

const calculateReadingTime = (body: string): number => {
    const wordsPerMinute = 200;
    const wordCount = body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const revalidateArticlePaths = (topicSlug: string, articleSlug?: string): void => {
    revalidatePath('/articles');
    revalidatePath('/admin/articles'); // Admin list page
    revalidatePath(`/articles/${topicSlug}`);
    if (articleSlug) {
        revalidatePath(`/articles/${topicSlug}/${articleSlug}`);
        revalidatePath(`/admin/articles/${topicSlug}/${articleSlug}/edit`);
    }
};

// ===== SERVER ACTIONS =====

/**
 * Create a new article
 */
export const createArticle = async (data: ArticleInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = articleInputSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        // Check if slug already exists within this topic
        const existing = await collection.findOne({ 
            type: 'article',
            topicSlug: parsed.data.topicSlug, 
            slug: parsed.data.slug 
        });
        if (existing) {
            return {
                success: false,
                status: 409,
                error: 'An article with this slug already exists in this topic',
            };
        }

        // Verify parent topic exists
        const topicsCollection = await getCollection(COLLECTIONS.topics);
        const parentTopic = await topicsCollection.findOne({ slug: parsed.data.topicSlug });
        if (!parentTopic) {
            return {
                success: false,
                status: 400,
                error: 'Topic not found',
            };
        }

        // Verify subtopic exists if provided
        if (parsed.data.subtopicSlug) {
            const subtopicsCollection = await getCollection(COLLECTIONS.subtopics);
            const subtopic = await subtopicsCollection.findOne({ 
                topicSlug: parsed.data.topicSlug,
                slug: parsed.data.subtopicSlug 
            });
            if (!subtopic) {
                return {
                    success: false,
                    status: 400,
                    error: 'Subtopic not found',
                };
            }
        }

        const now = new Date();
        const article: Omit<IArticle, '_id'> = {
            type: 'article',
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            readingTime: parsed.data.readingTime || calculateReadingTime(parsed.data.body),
            html: parsed.data.html,
            tableOfContents: parsed.data.tableOfContents as IArticle['tableOfContents'],
            published: false,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(article as IArticle);

        // Note: Don't update article counts until published
        revalidateArticlePaths(parsed.data.topicSlug, parsed.data.slug);

        return {
            success: true,
            status: 201,
            data: result.insertedId.toString(),
            message: 'Article created successfully',
        };
    } catch (error) {
        console.error('Failed to create article:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to create article. Please try again.',
        };
    }
};

/**
 * Update an existing article
 */
export const updateArticle = async (
    topicSlug: string, 
    slug: string, 
    data: ArticleUpdate
): Promise<IApiResponse<void>> => {
    try {
        const parsed = articleUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        // Check if article exists
        const existing = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        // If changing slug, check for conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const slugConflict = await collection.findOne({ 
                type: 'article',
                topicSlug: parsed.data.topicSlug || topicSlug,
                slug: parsed.data.slug 
            });
            if (slugConflict) {
                return {
                    success: false,
                    status: 409,
                    error: 'An article with this slug already exists',
                };
            }
        }

        // If changing topic, verify new topic exists
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            const topicsCollection = await getCollection(COLLECTIONS.topics);
            const newTopic = await topicsCollection.findOne({ slug: parsed.data.topicSlug });
            if (!newTopic) {
                return {
                    success: false,
                    status: 400,
                    error: 'New topic not found',
                };
            }
        }

        // Recalculate reading time if body changed
        const readingTime = parsed.data.body 
            ? calculateReadingTime(parsed.data.body) 
            : undefined;

        const updateData: Partial<IArticle> & { updatedAt: Date } = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            tableOfContents: parsed.data.tableOfContents as IArticle['tableOfContents'],
            updatedAt: new Date(),
        };

        if (readingTime) {
            updateData.readingTime = readingTime;
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        await collection.updateOne({ type: 'article', topicSlug, slug }, { $set: updateData });

        // If article is published and moved topics, update article counts
        if (existing.published && parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            // Decrease count on old topic
            await updateTopicArticleCount(topicSlug, -1);
            if (existing.subtopicSlug) {
                await updateSubtopicArticleCount(topicSlug, existing.subtopicSlug, -1);
            }
            
            // Increase count on new topic
            await updateTopicArticleCount(parsed.data.topicSlug, 1);
            if (parsed.data.subtopicSlug) {
                await updateSubtopicArticleCount(parsed.data.topicSlug, parsed.data.subtopicSlug, 1);
            }
        }

        // Revalidate paths
        revalidateArticlePaths(topicSlug, slug);
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            revalidateArticlePaths(parsed.data.topicSlug, parsed.data.slug || slug);
        }

        return {
            success: true,
            status: 200,
            message: 'Article updated successfully',
        };
    } catch (error) {
        console.error('Failed to update article:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update article. Please try again.',
        };
    }
};

/**
 * Publish an article
 */
export const publishArticle = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!article) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        if (article.published) {
            return {
                success: false,
                status: 400,
                error: 'Article is already published',
            };
        }

        const now = new Date();
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { 
                $set: { 
                    published: true, 
                    publishedAt: now,
                    updatedAt: now 
                } 
            }
        );

        // Update article counts
        await updateTopicArticleCount(topicSlug, 1);
        if (article.subtopicSlug) {
            await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, 1);
        }

        // Revalidate all related paths
        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/'); // Homepage might show recent articles

        return {
            success: true,
            status: 200,
            message: 'Article published successfully',
        };
    } catch (error) {
        console.error('Failed to publish article:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to publish article. Please try again.',
        };
    }
};

/**
 * Unpublish an article
 */
export const unpublishArticle = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!article) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        if (!article.published) {
            return {
                success: false,
                status: 400,
                error: 'Article is already unpublished',
            };
        }

        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { 
                $set: { 
                    published: false, 
                    updatedAt: new Date() 
                },
                $unset: { publishedAt: '' }
            }
        );

        // Update article counts
        await updateTopicArticleCount(topicSlug, -1);
        if (article.subtopicSlug) {
            await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, -1);
        }

        // Revalidate all related paths
        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/');

        return {
            success: true,
            status: 200,
            message: 'Article unpublished successfully',
        };
    } catch (error) {
        console.error('Failed to unpublish article:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to unpublish article. Please try again.',
        };
    }
};

/**
 * Delete an article
 */
export const deleteArticle = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        // Check if article exists
        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!article) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        // Delete the article
        await collection.deleteOne({ type: 'article', topicSlug, slug });

        // If it was published, update article counts
        if (article.published) {
            await updateTopicArticleCount(topicSlug, -1);
            if (article.subtopicSlug) {
                await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, -1);
            }
        }

        // Also delete associated stats and comments
        const statsCollection = await getCollection(COLLECTIONS.articleStats);
        await statsCollection.deleteOne({ slug: `${topicSlug}/${slug}` });

        const commentsCollection = await getCollection(COLLECTIONS.comments);
        await commentsCollection.deleteMany({ articleSlug: `${topicSlug}/${slug}` });

        // Revalidate paths
        revalidateArticlePaths(topicSlug, slug);

        return {
            success: true,
            status: 200,
            message: 'Article deleted successfully',
        };
    } catch (error) {
        console.error('Failed to delete article:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete article. Please try again.',
        };
    }
};

/**
 * Reorder articles within a subtopic or topic
 */
export const reorderArticles = async (
    topicSlug: string, 
    subtopicSlug: string | undefined,
    slugs: string[]
): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return {
                success: false,
                status: 400,
                error: 'Invalid slugs array',
            };
        }

        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        // Update order for each article using individual updates
        // This avoids complex filter typing issues with bulkWrite
        const updatePromises = slugs.map((slug, index) => {
            const filter: { type: 'article'; topicSlug: string; slug: string; subtopicSlug?: string } = {
                type: 'article',
                topicSlug,
                slug,
            };
            
            if (subtopicSlug) {
                filter.subtopicSlug = subtopicSlug;
            }
            
            return collection.updateOne(
                filter,
                { $set: { order: index, updatedAt: new Date() } }
            );
        });

        await Promise.all(updatePromises);

        revalidateArticlePaths(topicSlug);

        return {
            success: true,
            status: 200,
            message: 'Articles reordered successfully',
        };
    } catch (error) {
        console.error('Failed to reorder articles:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to reorder articles. Please try again.',
        };
    }
};

/**
 * Toggle article featured status
 */
export const toggleArticleFeatured = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!article) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        const newFeatured = !article.featured;
        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateArticlePaths(topicSlug, slug);
        revalidatePath('/'); // Homepage might show featured articles

        return {
            success: true,
            status: 200,
            data: newFeatured,
            message: newFeatured ? 'Article featured' : 'Article unfeatured',
        };
    } catch (error) {
        console.error('Failed to toggle article featured:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update article. Please try again.',
        };
    }
};

/**
 * Toggle article published status
 */
export const toggleArticlePublished = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        if (!article) {
            return {
                success: false,
                status: 404,
                error: 'Article not found',
            };
        }

        const newPublished = !article.published;
        const updateData: Partial<IArticle> & { updatedAt: Date } = {
            published: newPublished,
            updatedAt: new Date(),
        };

        // Set publishedAt date when publishing for the first time
        if (newPublished && !article.publishedAt) {
            updateData.publishedAt = new Date();
        }

        await collection.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: updateData }
        );

        // Update article counts for topic and subtopic
        const countChange = newPublished ? 1 : -1;
        await updateTopicArticleCount(topicSlug, countChange);
        if (article.subtopicSlug) {
            await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, countChange);
        }

        revalidateArticlePaths(topicSlug, slug);

        return {
            success: true,
            status: 200,
            data: newPublished,
            message: newPublished ? 'Article published' : 'Article unpublished',
        };
    } catch (error) {
        console.error('Failed to toggle article published:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update article. Please try again.',
        };
    }
};

