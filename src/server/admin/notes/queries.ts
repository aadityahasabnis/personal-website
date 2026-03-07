'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { INote } from '@/interfaces';

// ===== SERIALIZED TYPES =====

export interface SerializedNote {
    _id: string;
    slug: string;
    title: string;
    description: string;
    published: boolean;
    featured?: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}

export interface NoteForEdit extends SerializedNote {
    body: string;
    coverImage?: string;
}

// ===== QUERIES =====

export const getNotes = async (): Promise<SerializedNote[]> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);
        const notes = await collection
            .find({ type: 'note' })
            .sort({ updatedAt: -1 })
            .project({ _id: 1, slug: 1, title: 1, description: 1, published: 1, featured: 1, publishedAt: 1, createdAt: 1, updatedAt: 1, tags: 1 })
            .toArray();

        return notes.map(n => ({
            _id: n._id!.toString(),
            slug: n.slug,
            title: n.title,
            description: n.description,
            published: n.published,
            featured: n.featured,
            publishedAt: n.publishedAt?.toISOString(),
            createdAt: n.createdAt.toISOString(),
            updatedAt: n.updatedAt.toISOString(),
            tags: n.tags,
        }));
    } catch (err) {
        console.error('Failed to fetch notes:', err);
        return [];
    }
};

export const getNoteForEdit = async (slug: string): Promise<NoteForEdit | null> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);
        const note = await collection.findOne({ type: 'note', slug });
        
        if (!note) return null;

        return {
            _id: note._id!.toString(),
            slug: note.slug,
            title: note.title,
            description: note.description,
            body: note.body,
            coverImage: note.coverImage,
            published: note.published,
            featured: note.featured,
            publishedAt: note.publishedAt?.toISOString(),
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
            tags: note.tags,
        };
    } catch (err) {
        console.error('Failed to fetch note for edit:', err);
        return null;
    }
};
