import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IContent, IArticle, INote, ISeries } from '@/interfaces';

/**
 * Get a single published article by slug
 */
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const article = await collection.findOne({
            type: 'article',
            slug,
            published: true,
        });

        return article as IArticle | null;
    } catch (error) {
        console.error(`Failed to fetch article: ${slug}`, error);
        return null;
    }
};

/**
 * Get recent published articles
 */
export const getRecentArticles = async (
    limit = 10,
    skip = 0
): Promise<IArticle[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const articles = await collection
            .find({
                type: 'article',
                published: true,
            })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .project({
                body: 0,
                html: 0,
            })
            .toArray();

        return articles as IArticle[];
    } catch (error) {
        console.error('Failed to fetch recent articles', error);
        return [];
    }
};

/**
 * Get all published articles for sitemap
 */
export const getAllArticleSlugs = async (): Promise<string[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const articles = await collection
            .find({ type: 'article', published: true })
            .project({ slug: 1 })
            .toArray();

        return articles.map((a) => a.slug);
    } catch (error) {
        console.error('Failed to fetch article slugs', error);
        return [];
    }
};

/**
 * Get featured articles
 */
export const getFeaturedArticles = async (limit = 3): Promise<IArticle[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const articles = await collection
            .find({
                type: 'article',
                published: true,
                featured: true,
            })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .project({ body: 0, html: 0 })
            .toArray();

        return articles as IArticle[];
    } catch (error) {
        console.error('Failed to fetch featured articles', error);
        return [];
    }
};

/**
 * Get articles by tag
 */
export const getArticlesByTag = async (
    tag: string,
    limit = 10
): Promise<IArticle[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const articles = await collection
            .find({
                type: 'article',
                published: true,
                tags: tag,
            })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .project({ body: 0, html: 0 })
            .toArray();

        return articles as IArticle[];
    } catch (error) {
        console.error(`Failed to fetch articles by tag: ${tag}`, error);
        return [];
    }
};

/**
 * Get a series by slug with its articles
 */
export const getSeries = async (slug: string): Promise<ISeries | null> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const series = await collection.findOne({
            type: 'series',
            slug,
            published: true,
        });

        return series as ISeries | null;
    } catch (error) {
        console.error(`Failed to fetch series: ${slug}`, error);
        return null;
    }
};

/**
 * Get articles belonging to a series, ordered by seriesOrder
 */
export const getSeriesArticles = async (
    seriesSlug: string
): Promise<Pick<IArticle, 'slug' | 'title'>[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const articles = await collection
            .find({
                type: 'article',
                seriesSlug,
                published: true,
            })
            .sort({ seriesOrder: 1 })
            .project({ slug: 1, title: 1, _id: 0 })
            .toArray();

        return articles as Pick<IArticle, 'slug' | 'title'>[];
    } catch (error) {
        console.error(`Failed to fetch series articles: ${seriesSlug}`, error);
        return [];
    }
};

// ===== NOTES QUERIES =====

/**
 * Get a single published note by slug
 */
export const getNote = async (slug: string): Promise<INote | null> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const note = await collection.findOne({
            type: 'note',
            slug,
            published: true,
        });

        return note as INote | null;
    } catch (error) {
        console.error(`Failed to fetch note: ${slug}`, error);
        return null;
    }
};

/**
 * Get recent published notes
 */
export const getRecentNotes = async (
    limit = 20,
    skip = 0
): Promise<INote[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const notes = await collection
            .find({
                type: 'note',
                published: true,
            })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .project({
                body: 0,
                html: 0,
            })
            .toArray();

        return notes as INote[];
    } catch (error) {
        console.error('Failed to fetch recent notes', error);
        return [];
    }
};

/**
 * Get all published note slugs for sitemap
 */
export const getAllNoteSlugs = async (): Promise<string[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const notes = await collection
            .find({ type: 'note', published: true })
            .project({ slug: 1 })
            .toArray();

        return notes.map((n) => n.slug);
    } catch (error) {
        console.error('Failed to fetch note slugs', error);
        return [];
    }
};

/**
 * Get notes by tag
 */
export const getNotesByTag = async (
    tag: string,
    limit = 20
): Promise<INote[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const notes = await collection
            .find({
                type: 'note',
                published: true,
                tags: tag,
            })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .project({ body: 0, html: 0 })
            .toArray();

        return notes as INote[];
    } catch (error) {
        console.error(`Failed to fetch notes by tag: ${tag}`, error);
        return [];
    }
};

// ===== GENERIC CONTENT QUERIES =====

/**
 * Get a static page by slug (about, privacy, terms, etc.)
 */
export const getPage = async (slug: string): Promise<IContent | null> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const page = await collection.findOne({
            type: 'page',
            slug,
            published: true,
        });

        return page;
    } catch (error) {
        console.error(`Failed to fetch page: ${slug}`, error);
        return null;
    }
};

/**
 * Get all content slugs for sitemap (articles, notes, pages)
 */
export const getAllContentSlugs = async (): Promise<
    { slug: string; type: string; updatedAt: Date }[]
> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);

        const content = await collection
            .find({ published: true })
            .project({ slug: 1, type: 1, updatedAt: 1, _id: 0 })
            .toArray();

        return content as { slug: string; type: string; updatedAt: Date }[];
    } catch (error) {
        console.error('Failed to fetch all content slugs', error);
        return [];
    }
};
