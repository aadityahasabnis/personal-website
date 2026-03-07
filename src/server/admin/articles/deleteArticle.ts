'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticle } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, handleError, logDelete } from '../utils';
import { updateTopicArticleCount } from '../topics/updateTopicArticleCount';
import { updateSubtopicArticleCount } from '../subtopics/updateSubtopicArticleCount';

// ===== RESPONSE TYPE =====

export interface DeleteArticleResponse extends ActionResponse<void> {}

// ===== HELPERS =====

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

// ===== SERVER ACTION =====

export const deleteArticle = async (topicSlug: string, slug: string): Promise<DeleteArticleResponse> => {
    try {
        const collection = await getContentCollection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFound('Article');

        await collection.deleteOne({ type: 'article', topicSlug, slug });

        if (article.published) {
            await updateTopicArticleCount(topicSlug, -1);
            if (article.subtopicSlug) await updateSubtopicArticleCount(topicSlug, article.subtopicSlug, -1);
        }

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
        
        await logDelete('article', article.title, article._id?.toString());
        
        return success(undefined, 'Article deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete article');
    }
};
