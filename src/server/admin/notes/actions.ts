'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { INote } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logCreate, logUpdate, logDelete, logPublish, logUnpublish } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateNoteRequest {
    title: string;
    slug: string;
    description: string;
    body: string;
    tags?: string[];
    coverImage?: string;
    featured?: boolean;
}

export interface UpdateNoteRequest {
    title?: string;
    slug?: string;
    description?: string;
    body?: string;
    tags?: string[];
    coverImage?: string;
    featured?: boolean;
}

export interface CreateNoteResponse extends ActionResponse<string> {}
export interface UpdateNoteResponse extends ActionResponse<void> {}
export interface DeleteNoteResponse extends ActionResponse<void> {}
export interface ToggleNoteResponse extends ActionResponse<boolean> {}

// ===== SCHEMAS =====

const createSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    body: z.string().min(VALIDATION.body.min, 'Note body must be at least 100 characters'),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    featured: z.boolean().default(false),
});

const updateSchema = createSchema.partial();

// ===== HELPERS =====

const getNotesCollection = () => getCollection<INote>(COLLECTIONS.content);
const findNote = async (slug: string) => (await getNotesCollection()).findOne({ type: 'note', slug });

const revalidateNotePaths = (slug?: string): void => {
    ['/notes', '/admin/notes', '/'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/notes/${slug}`);
        revalidatePath(`/admin/notes/${slug}/edit`);
    }
};

// ===== SERVER ACTIONS =====

export const createNote = async (data: CreateNoteRequest): Promise<CreateNoteResponse> => {
    try {
        const parsed = createSchema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getNotesCollection();
        if (await collection.findOne({ type: 'note', slug: parsed.data.slug })) {
            return duplicate('A note with this slug');
        }

        const now = new Date();
        const note: Omit<INote, '_id'> = {
            type: 'note',
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            published: false,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(note as INote);
        revalidateNotePaths(parsed.data.slug);
        
        await logCreate('note', parsed.data.title, result.insertedId.toString());

        return success(result.insertedId.toString(), 'Note created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create note');
    }
};

export const updateNote = async (slug: string, data: UpdateNoteRequest): Promise<UpdateNoteResponse> => {
    try {
        const parsed = updateSchema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getNotesCollection();
        const existing = await findNote(slug);
        if (!existing) return notFound('Note');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ type: 'note', slug: parsed.data.slug })) {
                return duplicate('A note with this slug');
            }
        }

        const updateData = { ...parsed.data, coverImage: parsed.data.coverImage || undefined, updatedAt: new Date() };
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ type: 'note', slug }, { $set: updateData });
        revalidateNotePaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateNotePaths(parsed.data.slug);
        
        await logUpdate('note', existing.title, existing._id?.toString());

        return success(undefined, 'Note updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update note');
    }
};

export const deleteNote = async (slug: string): Promise<DeleteNoteResponse> => {
    try {
        const collection = await getNotesCollection();
        const note = await findNote(slug);
        if (!note) return notFound('Note');

        await collection.deleteOne({ type: 'note', slug });
        await (await getCollection(COLLECTIONS.articleStats)).deleteOne({ slug: `notes/${slug}` });
        revalidateNotePaths(slug);
        
        await logDelete('note', note.title, note._id?.toString());

        return success(undefined, 'Note deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete note');
    }
};

export const toggleNotePublished = async (slug: string): Promise<ToggleNoteResponse> => {
    try {
        const collection = await getNotesCollection();
        const note = await findNote(slug);
        if (!note) return notFound('Note');

        const newPublished = !note.published;
        const updateData: Partial<INote> = { published: newPublished, updatedAt: new Date() };
        if (newPublished && !note.publishedAt) updateData.publishedAt = new Date();

        await collection.updateOne({ type: 'note', slug }, { $set: updateData });
        revalidateNotePaths(slug);
        
        if (newPublished) await logPublish('note', note.title, note._id?.toString());
        else await logUnpublish('note', note.title, note._id?.toString());

        return success(newPublished, newPublished ? 'Note published' : 'Note unpublished');
    } catch (err) {
        return handleError(err, 'Failed to update note');
    }
};

export const toggleNoteFeatured = async (slug: string): Promise<ToggleNoteResponse> => {
    try {
        const collection = await getNotesCollection();
        const note = await findNote(slug);
        if (!note) return notFound('Note');

        const newFeatured = !note.featured;
        await collection.updateOne({ type: 'note', slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateNotePaths(slug);
        
        await logUpdate('note', note.title, note._id?.toString(), { featured: newFeatured });

        return success(newFeatured, newFeatured ? 'Note featured' : 'Note unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to update note');
    }
};
