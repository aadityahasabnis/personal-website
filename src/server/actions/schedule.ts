'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IContent, IApiResponse } from '@/interfaces';
import { createErrorResponse, createSuccessResponse, notFoundError } from '@/server/lib/action-utils';
import { logActivity } from './activity';

// ===== SCHEMAS =====

const scheduleSchema = z.object({
    id: z.string().min(1),
    scheduledAt: z.string().datetime(),
});

// ===== HELPERS =====

const getContentCollection = () => getCollection<IContent>(COLLECTIONS.content);
const revalidate = () => {
    revalidatePath('/admin/articles');
    revalidatePath('/admin/notes');
    revalidatePath('/articles');
    revalidatePath('/notes');
    revalidatePath('/admin');
};

// ===== SCHEDULE ACTIONS =====

export const scheduleContent = async (data: z.infer<typeof scheduleSchema>): Promise<IApiResponse<void>> => {
    try {
        const parsed = scheduleSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getContentCollection();
        const content = await collection.findOne({ _id: new ObjectId(parsed.data.id) });
        if (!content) return notFoundError('Content');

        const scheduledDate = new Date(parsed.data.scheduledAt);
        if (scheduledDate <= new Date()) {
            return createErrorResponse('Scheduled date must be in the future');
        }

        await collection.updateOne(
            { _id: new ObjectId(parsed.data.id) },
            { $set: { scheduledAt: scheduledDate, updatedAt: new Date() } }
        );

        await logActivity('update', content.type as 'article' | 'note', {
            entityId: parsed.data.id,
            entityTitle: content.title,
            details: { action: 'scheduled', scheduledAt: scheduledDate.toISOString() },
        });

        revalidate();
        return createSuccessResponse(undefined, `Scheduled for ${scheduledDate.toLocaleString()}`);
    } catch (error) {
        console.error('Schedule content error:', error);
        return createErrorResponse('Failed to schedule content', 500);
    }
};

export const cancelSchedule = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getContentCollection();
        const content = await collection.findOne({ _id: new ObjectId(id) });
        if (!content) return notFoundError('Content');

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $unset: { scheduledAt: '' }, $set: { updatedAt: new Date() } }
        );

        await logActivity('update', content.type as 'article' | 'note', {
            entityId: id,
            entityTitle: content.title,
            details: { action: 'schedule_cancelled' },
        });

        revalidate();
        return createSuccessResponse(undefined, 'Schedule cancelled');
    } catch (error) {
        console.error('Cancel schedule error:', error);
        return createErrorResponse('Failed to cancel schedule', 500);
    }
};

export const getScheduledContent = async (): Promise<IApiResponse<IContent[]>> => {
    try {
        const collection = await getContentCollection();
        const scheduled = await collection
            .find({ scheduledAt: { $exists: true, $gt: new Date() }, published: false })
            .sort({ scheduledAt: 1 })
            .toArray();
        return createSuccessResponse(scheduled);
    } catch (error) {
        console.error('Get scheduled content error:', error);
        return createErrorResponse('Failed to get scheduled content', 500);
    }
};

export const publishScheduledContent = async (): Promise<IApiResponse<number>> => {
    try {
        const collection = await getContentCollection();
        const now = new Date();

        // Find all content scheduled to be published now or before
        const toPublish = await collection
            .find({ scheduledAt: { $lte: now }, published: false })
            .toArray();

        if (toPublish.length === 0) {
            return createSuccessResponse(0, 'No content to publish');
        }

        // Publish all scheduled content
        const result = await collection.updateMany(
            { scheduledAt: { $lte: now }, published: false },
            {
                $set: { published: true, publishedAt: now, updatedAt: now },
                $unset: { scheduledAt: '' },
            }
        );

        // Log activity for each published item
        for (const content of toPublish) {
            await logActivity('publish', content.type as 'article' | 'note', {
                entityId: content._id?.toString(),
                entityTitle: content.title,
                details: { action: 'auto_published' },
            });
        }

        revalidate();
        return createSuccessResponse(result.modifiedCount, `Published ${result.modifiedCount} items`);
    } catch (error) {
        console.error('Publish scheduled content error:', error);
        return createErrorResponse('Failed to publish scheduled content', 500);
    }
};
