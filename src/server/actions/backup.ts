'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse } from '@/server/lib/action-utils';

// ===== TYPES =====

export interface IBackupData {
    exportedAt: string;
    version: string;
    collections: {
        topics: unknown[];
        subtopics: unknown[];
        articles: unknown[];
        notes: unknown[];
        projects: unknown[];
        subscribers: unknown[];
        comments: unknown[];
        settings: unknown[];
    };
    stats: {
        topics: number;
        subtopics: number;
        articles: number;
        notes: number;
        projects: number;
        subscribers: number;
        comments: number;
    };
}

// ===== EXPORT ACTIONS =====

export const exportAllContent = async (): Promise<IApiResponse<IBackupData>> => {
    try {
        // Fetch all collections in parallel
        const [topics, subtopics, content, projects, subscribers, comments, settings] = await Promise.all([
            getCollection(COLLECTIONS.topics).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.subtopics).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.content).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.projects).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.subscribers).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.comments).then(c => c.find({}).toArray()),
            getCollection(COLLECTIONS.settings).then(c => c.find({}).toArray()),
        ]);

        // Separate articles and notes from content
        const articles = content.filter((c) => (c as { type?: string }).type === 'article');
        const notes = content.filter((c) => (c as { type?: string }).type === 'note');

        const backupData: IBackupData = {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            collections: {
                topics,
                subtopics,
                articles,
                notes,
                projects,
                subscribers,
                comments,
                settings,
            },
            stats: {
                topics: topics.length,
                subtopics: subtopics.length,
                articles: articles.length,
                notes: notes.length,
                projects: projects.length,
                subscribers: subscribers.length,
                comments: comments.length,
            },
        };

        return createSuccessResponse(backupData, 'Backup created successfully');
    } catch (error) {
        console.error('Export error:', error);
        return createErrorResponse('Failed to export content', 500);
    }
};

export const exportCollection = async (collectionName: string): Promise<IApiResponse<unknown[]>> => {
    try {
        const validCollections = Object.values(COLLECTIONS);
        if (!validCollections.includes(collectionName as typeof validCollections[number])) {
            return createErrorResponse('Invalid collection name');
        }

        const collection = await getCollection(collectionName);
        const data = await collection.find({}).toArray();

        return createSuccessResponse(data);
    } catch (error) {
        console.error('Export collection error:', error);
        return createErrorResponse('Failed to export collection', 500);
    }
};

export const exportArticlesCSV = async (): Promise<IApiResponse<string>> => {
    try {
        const collection = await getCollection(COLLECTIONS.content);
        const articles = await collection.find({ type: 'article' }).toArray();

        const headers = ['Title', 'Slug', 'Status', 'Topic', 'Subtopic', 'Published Date', 'Views', 'Created'];
        const rows = articles.map((a: Record<string, unknown>) => [
            a.title || '',
            a.slug || '',
            a.published ? 'Published' : 'Draft',
            a.topicSlug || '',
            a.subtopicSlug || '',
            a.publishedAt ? new Date(a.publishedAt as string).toLocaleDateString() : '',
            a.views || 0,
            a.createdAt ? new Date(a.createdAt as string).toLocaleDateString() : '',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        return createSuccessResponse(csv);
    } catch (error) {
        console.error('Export articles CSV error:', error);
        return createErrorResponse('Failed to export articles', 500);
    }
};

export const exportNotesCSV = async (): Promise<IApiResponse<string>> => {
    try {
        const collection = await getCollection(COLLECTIONS.content);
        const notes = await collection.find({ type: 'note' }).toArray();

        const headers = ['Title', 'Slug', 'Status', 'Tags', 'Published Date', 'Created'];
        const rows = notes.map((n: Record<string, unknown>) => [
            n.title || '',
            n.slug || '',
            n.published ? 'Published' : 'Draft',
            Array.isArray(n.tags) ? n.tags.join('; ') : '',
            n.publishedAt ? new Date(n.publishedAt as string).toLocaleDateString() : '',
            n.createdAt ? new Date(n.createdAt as string).toLocaleDateString() : '',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        return createSuccessResponse(csv);
    } catch (error) {
        console.error('Export notes CSV error:', error);
        return createErrorResponse('Failed to export notes', 500);
    }
};
