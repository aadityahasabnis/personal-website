'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import { calculateReadingTime } from '@/lib/utils';
import type { IArticle } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logCreate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateArticleRequest {
    title: string;
    slug: string;
    description: string;
    body: string;
    html?: string;
    tableOfContents?: Array<{ id: string; text: string; level: number }>;
    topicSlug: string;
    subtopicSlug?: string;
    tags?: string[];
    coverImage?: string;
    order?: number;
    readingTime?: number;
    seo?: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
}

export interface CreateArticleResponse extends ActionResponse<string> {}

// ===== SCHEMA =====

const tocSchema = z.array(z.object({ id: z.string(), text: z.string(), level: z.number() }));

const seoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional().or(z.literal('')),
});

const schema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    body: z.string().min(1, 'Article body is required'),
    html: z.string().optional(),
    tableOfContents: tocSchema.optional(),
    topicSlug: z.string().min(1, 'Topic is required'),
    subtopicSlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    readingTime: z.number().int().min(1).optional(),
    seo: seoSchema.optional(),
});

// ===== HELPERS =====

const getContentCollection = () => getCollection<IArticle>(COLLECTIONS.content);

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

const verifySubtopicExists = async (topicSlug: string, subtopicSlug: string): Promise<boolean> => {
    const subtopic = await (await getCollection(COLLECTIONS.subtopics)).findOne({ topicSlug, slug: subtopicSlug });
    return !!subtopic;
};

// ===== SERVER ACTION =====

export const createArticle = async (data: CreateArticleRequest): Promise<CreateArticleResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getContentCollection();
        
        // Check for existing
        if (await collection.findOne({ type: 'article', topicSlug: parsed.data.topicSlug, slug: parsed.data.slug })) {
            return duplicate('An article with this slug already exists in this topic');
        }
        
        // Verify topic exists
        if (!(await verifyTopicExists(parsed.data.topicSlug))) {
            return error('Topic not found');
        }
        
        // Verify subtopic if provided
        if (parsed.data.subtopicSlug && !(await verifySubtopicExists(parsed.data.topicSlug, parsed.data.subtopicSlug))) {
            return error('Subtopic not found');
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
        revalidateArticlePaths(parsed.data.topicSlug, parsed.data.slug);
        
        await logCreate('article', parsed.data.title, result.insertedId.toString());
        
        return success(result.insertedId.toString(), 'Article created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create article');
    }
};
