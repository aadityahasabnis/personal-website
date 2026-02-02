import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticle, INote, ISeries, IProject, ISubtopic } from '@/interfaces';

/**
 * Admin Content Queries
 * 
 * Queries specifically for the admin panel that include drafts and unpublished content
 */

// ===== ARTICLE QUERIES FOR ADMIN =====

/**
 * Get all articles (including drafts) for admin list page
 */
export const getAllArticlesForAdmin = async (): Promise<IArticle[]> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const articles = await collection
            .find({ type: 'article' })
            .sort({ updatedAt: -1 })
            .project({
                _id: 1,
                slug: 1,
                title: 1,
                description: 1,
                topicSlug: 1,
                subtopicSlug: 1,
                published: 1,
                featured: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                readingTime: 1,
                tags: 1,
            })
            .toArray();

        return articles as unknown as IArticle[];
    } catch (error) {
        console.error('Failed to fetch articles for admin', error);
        return [];
    }
};

/**
 * Get a single article for editing (includes drafts and body content)
 */
export const getArticleForEdit = async (
    topicSlug: string,
    slug: string
): Promise<IArticle | null> => {
    try {
        const collection = await getCollection<IArticle>(COLLECTIONS.content);

        const article = await collection.findOne({
            type: 'article',
            topicSlug,
            slug,
        });

        return article;
    } catch (error) {
        console.error(`Failed to fetch article for edit: ${topicSlug}/${slug}`, error);
        return null;
    }
};

// ===== NOTE QUERIES FOR ADMIN =====

/**
 * Get all notes (including drafts) for admin
 */
export const getAllNotesForAdmin = async (): Promise<INote[]> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);

        const notes = await collection
            .find({ type: 'note' })
            .sort({ updatedAt: -1 })
            .project({
                _id: 1,
                slug: 1,
                title: 1,
                description: 1,
                published: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                tags: 1,
            })
            .toArray();

        return notes as unknown as INote[];
    } catch (error) {
        console.error('Failed to fetch notes for admin', error);
        return [];
    }
};

/**
 * Get a single note for editing
 */
export const getNoteForEdit = async (slug: string): Promise<INote | null> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);

        const note = await collection.findOne({
            type: 'note',
            slug,
        });

        return note;
    } catch (error) {
        console.error(`Failed to fetch note for edit: ${slug}`, error);
        return null;
    }
};

// ===== PROJECT QUERIES FOR ADMIN =====

/**
 * Get all projects for admin
 */
export const getAllProjectsForAdmin = async (): Promise<IProject[]> => {
    try {
        const collection = await getCollection<IProject>('projects');

        const projects = await collection
            .find({})
            .sort({ updatedAt: -1 })
            .toArray();

        return projects as unknown as IProject[];
    } catch (error) {
        console.error('Failed to fetch projects for admin', error);
        return [];
    }
};

/**
 * Get a single project for editing
 */
export const getProjectForEdit = async (slug: string): Promise<IProject | null> => {
    try {
        const collection = await getCollection<IProject>('projects');

        const project = await collection.findOne({ slug });

        return project;
    } catch (error) {
        console.error(`Failed to fetch project for edit: ${slug}`, error);
        return null;
    }
};

// ===== SERIES QUERIES FOR ADMIN =====

/**
 * Get all series (including drafts) for admin
 */
export const getAllSeriesForAdmin = async (): Promise<ISeries[]> => {
    try {
        const collection = await getCollection<ISeries>(COLLECTIONS.content);

        const series = await collection
            .find({ type: 'series' })
            .sort({ updatedAt: -1 })
            .project({
                _id: 1,
                slug: 1,
                title: 1,
                description: 1,
                published: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                articles: 1,
            })
            .toArray();

        return series as unknown as ISeries[];
    } catch (error) {
        console.error('Failed to fetch series for admin', error);
        return [];
    }
};

// ===== SUBTOPIC QUERIES FOR ADMIN =====

/**
 * Get all subtopics (including unpublished) for admin
 */
export const getAllSubtopicsForAdmin = async (): Promise<ISubtopic[]> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopics = await collection
            .find({})
            .sort({ topicSlug: 1, order: 1 })
            .toArray();

        return subtopics as unknown as ISubtopic[];
    } catch (error) {
        console.error('Failed to fetch subtopics for admin', error);
        return [];
    }
};

/**
 * Get a single subtopic for editing
 */
export const getSubtopicForEdit = async (
    topicSlug: string,
    slug: string
): Promise<ISubtopic | null> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopic = await collection.findOne({
            topicSlug,
            slug,
        });

        return subtopic;
    } catch (error) {
        console.error(`Failed to fetch subtopic for edit: ${topicSlug}/${slug}`, error);
        return null;
    }
};
