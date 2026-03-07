'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticle, ISubtopic } from '@/interfaces';

// ===== SERIALIZED TYPES =====

export interface SerializedArticle {
    _id: string;
    slug: string;
    title: string;
    description: string;
    topicSlug: string;
    subtopicSlug?: string;
    published: boolean;
    featured?: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    readingTime?: number;
    tags?: string[];
}

export interface ArticleForEdit extends SerializedArticle {
    body: string;
    html?: string;
    coverImage?: string;
    order: number;
    tableOfContents?: Array<{ id: string; text: string; level: number }>;
    seo?: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
}

export interface ArticleSidebarData {
    subtopics: Array<{ slug: string; title: string; order: number }>;
    articles: Array<{ slug: string; title: string; subtopicSlug?: string; order: number }>;
}

// ===== QUERIES =====

export const getArticles = async (): Promise<SerializedArticle[]> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);
        const articles = await collection
            .find({ type: 'article' })
            .sort({ updatedAt: -1 })
            .project({
                _id: 1, slug: 1, title: 1, description: 1, topicSlug: 1, subtopicSlug: 1,
                published: 1, featured: 1, publishedAt: 1, createdAt: 1, updatedAt: 1, readingTime: 1, tags: 1,
            })
            .toArray();

        return articles.map(a => ({
            _id: a._id!.toString(),
            slug: a.slug,
            title: a.title,
            description: a.description,
            topicSlug: a.topicSlug,
            subtopicSlug: a.subtopicSlug,
            published: a.published,
            featured: a.featured,
            publishedAt: a.publishedAt?.toISOString(),
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            readingTime: a.readingTime,
            tags: a.tags,
        }));
    } catch (err) {
        console.error('Failed to fetch articles:', err);
        return [];
    }
};

export const getArticleForEdit = async (topicSlug: string, slug: string): Promise<ArticleForEdit | null> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);
        const article = await collection.findOne({ type: 'article', topicSlug, slug });
        
        if (!article) return null;

        return {
            _id: article._id!.toString(),
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            html: article.html,
            topicSlug: article.topicSlug,
            subtopicSlug: article.subtopicSlug,
            published: article.published,
            featured: article.featured,
            publishedAt: article.publishedAt?.toISOString(),
            createdAt: article.createdAt.toISOString(),
            updatedAt: article.updatedAt.toISOString(),
            readingTime: article.readingTime,
            tags: article.tags,
            coverImage: article.coverImage,
            order: article.order,
            tableOfContents: article.tableOfContents,
            seo: article.seo,
        };
    } catch (err) {
        console.error('Failed to fetch article for edit:', err);
        return null;
    }
};

export const getArticleSidebarData = async (topicSlug: string): Promise<ArticleSidebarData> => {
    try {
        const [subtopicsCollection, contentCollection] = await Promise.all([
            getCollection<ISubtopic>(COLLECTIONS.subtopics),
            getCollection<IArticle>(COLLECTIONS.content),
        ]);

        const [subtopics, articles] = await Promise.all([
            subtopicsCollection.find({ topicSlug, published: true }).sort({ order: 1 }).toArray(),
            contentCollection
                .find({ type: 'article', topicSlug, published: true })
                .sort({ order: 1 })
                .project({ slug: 1, title: 1, subtopicSlug: 1, order: 1, _id: 0 })
                .toArray(),
        ]);

        return {
            subtopics: subtopics.map(s => ({ slug: s.slug, title: s.title, order: s.order })),
            articles: articles as Array<{ slug: string; title: string; subtopicSlug?: string; order: number }>,
        };
    } catch (err) {
        console.error('Failed to fetch sidebar data:', err);
        return { subtopics: [], articles: [] };
    }
};

export const getArticlesByTopic = async (topicSlug: string): Promise<SerializedArticle[]> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);
        const articles = await collection
            .find({ type: 'article', topicSlug })
            .sort({ order: 1 })
            .project({
                _id: 1, slug: 1, title: 1, description: 1, topicSlug: 1, subtopicSlug: 1,
                published: 1, featured: 1, publishedAt: 1, createdAt: 1, updatedAt: 1, readingTime: 1, tags: 1,
            })
            .toArray();

        return articles.map(a => ({
            _id: a._id!.toString(),
            slug: a.slug,
            title: a.title,
            description: a.description,
            topicSlug: a.topicSlug,
            subtopicSlug: a.subtopicSlug,
            published: a.published,
            featured: a.featured,
            publishedAt: a.publishedAt?.toISOString(),
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            readingTime: a.readingTime,
            tags: a.tags,
        }));
    } catch (err) {
        console.error('Failed to fetch articles by topic:', err);
        return [];
    }
};
