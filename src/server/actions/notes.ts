'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { INote, IApiResponse } from '@/interfaces';

// ===== VALIDATION SCHEMAS =====

const noteInputSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    body: z.string().min(VALIDATION.body.min, 'Note body must be at least 100 characters'),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    featured: z.boolean().default(false),
});

const noteUpdateSchema = noteInputSchema.partial().extend({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
});

type NoteInput = z.infer<typeof noteInputSchema>;
type NoteUpdate = z.infer<typeof noteUpdateSchema>;

// ===== HELPER FUNCTIONS =====

const revalidateNotePaths = (slug?: string): void => {
    revalidatePath('/notes');
    if (slug) {
        revalidatePath(`/notes/${slug}`);
    }
    revalidatePath('/'); // Homepage might show featured notes
};

// ===== SERVER ACTIONS =====

/**
 * Create a new note
 */
export const createNote = async (data: NoteInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = noteInputSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<INote>(COLLECTIONS.content);

        // Check if slug already exists
        const existing = await collection.findOne({ 
            type: 'note',
            slug: parsed.data.slug 
        });
        if (existing) {
            return {
                success: false,
                status: 409,
                error: 'A note with this slug already exists',
            };
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

        return {
            success: true,
            status: 201,
            data: result.insertedId.toString(),
            message: 'Note created successfully',
        };
    } catch (error) {
        console.error('Failed to create note:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to create note. Please try again.',
        };
    }
};

/**
 * Update an existing note
 */
export const updateNote = async (
    slug: string, 
    data: NoteUpdate
): Promise<IApiResponse<void>> => {
    try {
        const parsed = noteUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<INote>(COLLECTIONS.content);

        // Check if note exists
        const existing = await collection.findOne({ type: 'note', slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Note not found',
            };
        }

        // If changing slug, check for conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const slugConflict = await collection.findOne({ 
                type: 'note',
                slug: parsed.data.slug 
            });
            if (slugConflict) {
                return {
                    success: false,
                    status: 409,
                    error: 'A note with this slug already exists',
                };
            }
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            updatedAt: new Date(),
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        await collection.updateOne({ type: 'note', slug }, { $set: updateData });

        revalidateNotePaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) {
            revalidateNotePaths(parsed.data.slug);
        }

        return {
            success: true,
            status: 200,
            message: 'Note updated successfully',
        };
    } catch (error) {
        console.error('Failed to update note:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update note. Please try again.',
        };
    }
};

/**
 * Delete a note
 */
export const deleteNote = async (slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);

        // Check if note exists
        const note = await collection.findOne({ type: 'note', slug });
        if (!note) {
            return {
                success: false,
                status: 404,
                error: 'Note not found',
            };
        }

        await collection.deleteOne({ type: 'note', slug });

        // Also delete associated stats
        const statsCollection = await getCollection(COLLECTIONS.pageStats);
        await statsCollection.deleteOne({ slug: `notes/${slug}` });

        revalidateNotePaths(slug);

        return {
            success: true,
            status: 200,
            message: 'Note deleted successfully',
        };
    } catch (error) {
        console.error('Failed to delete note:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete note. Please try again.',
        };
    }
};

/**
 * Toggle note published status
 */
export const toggleNotePublished = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);

        const note = await collection.findOne({ type: 'note', slug });
        if (!note) {
            return {
                success: false,
                status: 404,
                error: 'Note not found',
            };
        }

        const newPublished = !note.published;
        const updateData: Partial<INote> & { updatedAt: Date } = {
            published: newPublished,
            updatedAt: new Date(),
        };

        // Set publishedAt date when publishing for the first time
        if (newPublished && !note.publishedAt) {
            updateData.publishedAt = new Date();
        }

        await collection.updateOne(
            { type: 'note', slug },
            { $set: updateData }
        );

        revalidateNotePaths(slug);

        return {
            success: true,
            status: 200,
            data: newPublished,
            message: newPublished ? 'Note published' : 'Note unpublished',
        };
    } catch (error) {
        console.error('Failed to toggle note published:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update note. Please try again.',
        };
    }
};

/**
 * Toggle note featured status
 */
export const toggleNoteFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<INote>(COLLECTIONS.content);

        const note = await collection.findOne({ type: 'note', slug });
        if (!note) {
            return {
                success: false,
                status: 404,
                error: 'Note not found',
            };
        }

        const newFeatured = !note.featured;
        await collection.updateOne(
            { type: 'note', slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateNotePaths(slug);

        return {
            success: true,
            status: 200,
            data: newFeatured,
            message: newFeatured ? 'Note featured' : 'Note unfeatured',
        };
    } catch (error) {
        console.error('Failed to toggle note featured:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update note. Please try again.',
        };
    }
};
