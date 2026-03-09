'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ITopic } from '@/interfaces/schema';

// ===== SERIALIZED TYPES =====

export interface SerializedTopic {
    _id: string;
    slug: string;
    title: string;
    description: string;
    icon?: string;
    coverImage?: string;
    order: number;
    published: boolean;
    featured: boolean;
    metadata: { articleCount: number; lastUpdated?: string };
    createdAt: string;
    updatedAt: string;
}

export interface TopicForEdit extends SerializedTopic {}

// ===== QUERIES =====

export const getTopics = async (): Promise<SerializedTopic[]> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);
        const topics = await collection.find({}).sort({ order: 1 }).toArray();

        return topics.map(t => ({
            _id: t._id!.toString(),
            slug: t.slug,
            title: t.title,
            description: t.description,
            icon: t.icon,
            coverImage: t.coverImage,
            order: t.order,
            published: t.published,
            featured: t.featured,
            metadata: {
                articleCount: t.metadata.articleCount,
                lastUpdated: t.metadata.lastUpdated?.toISOString(),
            },
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch topics:', err);
        return [];
    }
};

export const getTopicForEdit = async (slug: string): Promise<TopicForEdit | null> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);
        const topic = await collection.findOne({ slug });
        
        if (!topic) return null;

        return {
            _id: topic._id!.toString(),
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            icon: topic.icon,
            coverImage: topic.coverImage,
            order: topic.order,
            published: topic.published,
            featured: topic.featured,
            metadata: {
                articleCount: topic.metadata.articleCount,
                lastUpdated: topic.metadata.lastUpdated?.toISOString(),
            },
            createdAt: topic.createdAt.toISOString(),
            updatedAt: topic.updatedAt.toISOString(),
        };
    } catch (err) {
        console.error('Failed to fetch topic for edit:', err);
        return null;
    }
};

export const getPublishedTopics = async (): Promise<SerializedTopic[]> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);
        const topics = await collection.find({ published: true }).sort({ order: 1 }).toArray();

        return topics.map(t => ({
            _id: t._id!.toString(),
            slug: t.slug,
            title: t.title,
            description: t.description,
            icon: t.icon,
            coverImage: t.coverImage,
            order: t.order,
            published: t.published,
            featured: t.featured,
            metadata: {
                articleCount: t.metadata.articleCount,
                lastUpdated: t.metadata.lastUpdated?.toISOString(),
            },
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch published topics:', err);
        return [];
    }
};
