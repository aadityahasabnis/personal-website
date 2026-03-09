'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { INote } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse, notFoundError, duplicateError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

const noteInputSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    body: z.string().min(VALIDATION.body.min, 'Note body must be at least 100 characters'),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    featured: z.boolean().default(false),
});

const noteUpdateSchema = noteInputSchema.partial();

type NoteInput = z.infer<typeof noteInputSchema>;
type NoteUpdate = z.infer<typeof noteUpdateSchema>;

// ===== HELPERS =====

const getNotesCollection = () => getCollection<INote>(COLLECTIONS.content);

const revalidateNotePaths = (slug?: string): void => {
    ['/notes', '/admin/notes', '/'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/notes/${slug}`);
        revalidatePath(`/admin/notes/${slug}/edit`);
    }
};

const findNote = async (slug: string) => (await getNotesCollection()).findOne({ type: 'note', slug });

// ===== SERVER ACTIONS =====

export const createNote = async (data: NoteInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = noteInputSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getNotesCollection();
        if (await collection.findOne({ type: 'note', slug: parsed.data.slug })) {
            return duplicateError('A note with this slug');
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

        return { success: true, status: 201, data: result.insertedId.toString(), message: 'Note created successfully' };
    } catch (error) {
        console.error('Failed to create note:', error);
        return createErrorResponse('Failed to create note. Please try again.', 500);
    }
};

export const updateNote = async (slug: string, data: NoteUpdate): Promise<IApiResponse<void>> => {
    try {
        const parsed = noteUpdateSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getNotesCollection();
        if (!(await findNote(slug))) return notFoundError('Note');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ type: 'note', slug: parsed.data.slug })) {
                return duplicateError('A note with this slug');
            }
        }

        const updateData = { ...parsed.data, coverImage: parsed.data.coverImage || undefined, updatedAt: new Date() };
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ type: 'note', slug }, { $set: updateData });
        revalidateNotePaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateNotePaths(parsed.data.slug);

        return createSuccessResponse(undefined, 'Note updated successfully');
    } catch (error) {
        console.error('Failed to update note:', error);
        return createErrorResponse('Failed to update note. Please try again.', 500);
    }
};

export const deleteNote = async (slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getNotesCollection();
        if (!(await findNote(slug))) return notFoundError('Note');

        await collection.deleteOne({ type: 'note', slug });
        await (await getCollection(COLLECTIONS.articleStats)).deleteOne({ slug: `notes/${slug}` });
        revalidateNotePaths(slug);

        return createSuccessResponse(undefined, 'Note deleted successfully');
    } catch (error) {
        console.error('Failed to delete note:', error);
        return createErrorResponse('Failed to delete note. Please try again.', 500);
    }
};

export const toggleNotePublished = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getNotesCollection();
        const note = await findNote(slug);
        if (!note) return notFoundError('Note');

        const newPublished = !note.published;
        const updateData: Partial<INote> = { published: newPublished, updatedAt: new Date() };
        if (newPublished && !note.publishedAt) updateData.publishedAt = new Date();

        await collection.updateOne({ type: 'note', slug }, { $set: updateData });
        revalidateNotePaths(slug);

        return createSuccessResponse(newPublished, newPublished ? 'Note published' : 'Note unpublished');
    } catch (error) {
        console.error('Failed to toggle note published:', error);
        return createErrorResponse('Failed to update note. Please try again.', 500);
    }
};

export const toggleNoteFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getNotesCollection();
        const note = await findNote(slug);
        if (!note) return notFoundError('Note');

        const newFeatured = !note.featured;
        await collection.updateOne({ type: 'note', slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateNotePaths(slug);

        return createSuccessResponse(newFeatured, newFeatured ? 'Note featured' : 'Note unfeatured');
    } catch (error) {
        console.error('Failed to toggle note featured:', error);
        return createErrorResponse('Failed to update note. Please try again.', 500);
    }
};
