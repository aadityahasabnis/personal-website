'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import { calculateReadingTime } from '@/lib/utils';
import type { IArticle } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, duplicate, error, handleError, logCreate } from '../utils';
import { articleCreateSchema, type ArticleCreateInput } from '@/server/schemas';

// ==============================================================
// Types
// ==============================================================

export type CreateArticleRequest = ArticleCreateInput;
export interface CreateArticleResponse extends ActionResponse<string> {}

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

const verifyTopicExists = async (topicSlug: string): Promise<boolean> => {
    const topic = await (await getCollection(COLLECTIONS.topics)).findOne({ slug: topicSlug });
    return !!topic;
};

const verifySubtopicExists = async (topicSlug: string, subtopicSlug: string): Promise<boolean> => {
    const subtopic = await (await getCollection(COLLECTIONS.subtopics)).findOne({ topicSlug, slug: subtopicSlug });
    return !!subtopic;
};

// ==============================================================
// Server Action
// ==============================================================

export const createArticle = async (data: CreateArticleRequest): Promise<CreateArticleResponse> => {
    try {
        const parsed = articleCreateSchema.safeParse(data);
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
