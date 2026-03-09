'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';

// ===== SERIALIZED TYPES =====

export interface SerializedSubtopic {
    _id: string;
    topicSlug: string;
    slug: string;
    title: string;
    description?: string;
    order: number;
    published: boolean;
    metadata: { articleCount: number };
    createdAt: string;
    updatedAt: string;
}

export interface SubtopicForEdit extends SerializedSubtopic {}

// ===== QUERIES =====

export const getSubtopics = async (): Promise<SerializedSubtopic[]> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        const subtopics = await collection.find({}).sort({ topicSlug: 1, order: 1 }).toArray();

        return subtopics.map(s => ({
            _id: s._id!.toString(),
            topicSlug: s.topicSlug,
            slug: s.slug,
            title: s.title,
            description: s.description,
            order: s.order,
            published: s.published,
            metadata: { articleCount: s.metadata.articleCount },
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch subtopics:', err);
        return [];
    }
};

export const getSubtopicForEdit = async (topicSlug: string, slug: string): Promise<SubtopicForEdit | null> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        const subtopic = await collection.findOne({ topicSlug, slug });
        
        if (!subtopic) return null;

        return {
            _id: subtopic._id!.toString(),
            topicSlug: subtopic.topicSlug,
            slug: subtopic.slug,
            title: subtopic.title,
            description: subtopic.description,
            order: subtopic.order,
            published: subtopic.published,
            metadata: { articleCount: subtopic.metadata.articleCount },
            createdAt: subtopic.createdAt.toISOString(),
            updatedAt: subtopic.updatedAt.toISOString(),
        };
    } catch (err) {
        console.error('Failed to fetch subtopic for edit:', err);
        return null;
    }
};

export const getSubtopicsByTopic = async (topicSlug: string): Promise<SerializedSubtopic[]> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        const subtopics = await collection.find({ topicSlug }).sort({ order: 1 }).toArray();

        return subtopics.map(s => ({
            _id: s._id!.toString(),
            topicSlug: s.topicSlug,
            slug: s.slug,
            title: s.title,
            description: s.description,
            order: s.order,
            published: s.published,
            metadata: { articleCount: s.metadata.articleCount },
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch subtopics by topic:', err);
        return [];
    }
};
