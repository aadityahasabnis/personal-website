'use server';

/**
 * Backup Admin Actions
 * 
 * Server actions for data backup and export in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ActionResponse } from '../utils/types';
import { success, error } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logExport } from '../utils/activityLogger';

// ===== TYPES =====

export interface BackupData {
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

export interface ExportCollectionRequest {
    collectionName: string;
}

// ===== ACTIONS =====

/**
 * Export all content as a backup
 */
export const exportAllContent = async (): Promise<ActionResponse<BackupData>> => {
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

        const backupData: BackupData = {
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

        await logExport('settings', { type: 'full_backup', ...backupData.stats });

        return success(backupData, 'Backup created successfully');
    } catch (err) {
        return handleError(err, 'Failed to export content');
    }
};

/**
 * Export a single collection
 */
export const exportCollection = async (request: ExportCollectionRequest): Promise<ActionResponse<unknown[]>> => {
    try {
        const { collectionName } = request;
        const validCollections = Object.values(COLLECTIONS);
        
        if (!validCollections.includes(collectionName as typeof validCollections[number])) {
            return error('Invalid collection name');
        }

        const collection = await getCollection(collectionName);
        const data = await collection.find({}).toArray();

        await logExport('settings', { type: 'collection_export', collection: collectionName, count: data.length });

        return success(data);
    } catch (err) {
        return handleError(err, 'Failed to export collection');
    }
};

/**
 * Export articles as CSV
 */
export const exportArticlesCSV = async (): Promise<ActionResponse<string>> => {
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

        await logExport('article', { type: 'csv', count: articles.length });

        return success(csv);
    } catch (err) {
        return handleError(err, 'Failed to export articles');
    }
};

/**
 * Export notes as CSV
 */
export const exportNotesCSV = async (): Promise<ActionResponse<string>> => {
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

        await logExport('note', { type: 'csv', count: notes.length });

        return success(csv);
    } catch (err) {
        return handleError(err, 'Failed to export notes');
    }
};

/**
 * Export projects as CSV
 */
export const exportProjectsCSV = async (): Promise<ActionResponse<string>> => {
    try {
        const collection = await getCollection(COLLECTIONS.projects);
        const projects = await collection.find({}).toArray();

        const headers = ['Title', 'Slug', 'Status', 'Featured', 'Tech Stack', 'GitHub URL', 'Live URL', 'Created'];
        const rows = projects.map((p: Record<string, unknown>) => [
            p.title || '',
            p.slug || '',
            p.status || '',
            p.featured ? 'Yes' : 'No',
            Array.isArray(p.techStack) ? p.techStack.join('; ') : '',
            p.githubUrl || '',
            p.liveUrl || '',
            p.createdAt ? new Date(p.createdAt as string).toLocaleDateString() : '',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

        await logExport('project', { type: 'csv', count: projects.length });

        return success(csv);
    } catch (err) {
        return handleError(err, 'Failed to export projects');
    }
};
