'use server';

/**
 * Schedule Admin Actions
 * 
 * Server actions for scheduling content publishing in the admin panel.
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IContent } from '@/interfaces';
import type { ActionResponse } from '../utils/types';
import { success, error, notFound } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logUpdate, logPublish } from '../utils/activityLogger';

// ===== TYPES =====

export interface ScheduleContentRequest {
    id: string;
    scheduledAt: string;
}

export interface CancelScheduleRequest {
    id: string;
}

// ===== SCHEMAS =====

const scheduleSchema = z.object({
    id: z.string().min(1),
    scheduledAt: z.string().datetime(),
});

// ===== HELPERS =====

const getContentCollection = () => getCollection<IContent>(COLLECTIONS.content);

const revalidateContent = () => {
    revalidatePath('/admin/articles');
    revalidatePath('/admin/notes');
    revalidatePath('/articles');
    revalidatePath('/notes');
    revalidatePath('/admin');
};

// ===== ACTIONS =====

/**
 * Schedule content for future publishing
 */
export const scheduleContent = async (request: ScheduleContentRequest): Promise<ActionResponse<void>> => {
    try {
        const parsed = scheduleSchema.safeParse(request);
        if (!parsed.success) {
            return error(parsed.error.issues[0]?.message ?? 'Invalid input');
        }

        const { id, scheduledAt } = parsed.data;

        if (!ObjectId.isValid(id)) {
            return error('Invalid content ID');
        }

        const collection = await getContentCollection();
        const content = await collection.findOne({ _id: new ObjectId(id) });

        if (!content) {
            return notFound('Content');
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return error('Scheduled date must be in the future');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { scheduledAt: scheduledDate, updatedAt: new Date() } }
        );

        await logUpdate(content.type as 'article' | 'note', content.title, id, {
            action: 'scheduled',
            scheduledAt: scheduledDate.toISOString(),
        });

        revalidateContent();

        return success(undefined, `Scheduled for ${scheduledDate.toLocaleString()}`);
    } catch (err) {
        return handleError(err, 'Failed to schedule content');
    }
};

/**
 * Cancel scheduled publishing
 */
export const cancelSchedule = async (request: CancelScheduleRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid content ID');
        }

        const collection = await getContentCollection();
        const content = await collection.findOne({ _id: new ObjectId(id) });

        if (!content) {
            return notFound('Content');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $unset: { scheduledAt: '' }, $set: { updatedAt: new Date() } }
        );

        await logUpdate(content.type as 'article' | 'note', content.title, id, {
            action: 'schedule_cancelled',
        });

        revalidateContent();

        return success(undefined, 'Schedule cancelled');
    } catch (err) {
        return handleError(err, 'Failed to cancel schedule');
    }
};

/**
 * Publish all scheduled content that is due
 * This should be called by a cron job or scheduled task
 */
export const publishScheduledContent = async (): Promise<ActionResponse<number>> => {
    try {
        const collection = await getContentCollection();
        const now = new Date();

        // Find all content scheduled to be published now or before
        const toPublish = await collection
            .find({ scheduledAt: { $lte: now }, published: false })
            .toArray();

        if (toPublish.length === 0) {
            return success(0, 'No content to publish');
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
            await logPublish(content.type as 'article' | 'note', content.title, content._id?.toString());
        }

        revalidateContent();

        return success(result.modifiedCount, `Published ${result.modifiedCount} items`);
    } catch (err) {
        return handleError(err, 'Failed to publish scheduled content');
    }
};

/**
 * Reschedule content to a new date
 */
export const rescheduleContent = async (
    id: string,
    newScheduledAt: string
): Promise<ActionResponse<void>> => {
    try {
        if (!ObjectId.isValid(id)) {
            return error('Invalid content ID');
        }

        const newDate = new Date(newScheduledAt);
        if (isNaN(newDate.getTime())) {
            return error('Invalid date format');
        }

        if (newDate <= new Date()) {
            return error('Scheduled date must be in the future');
        }

        const collection = await getContentCollection();
        const content = await collection.findOne({ _id: new ObjectId(id) });

        if (!content) {
            return notFound('Content');
        }

        if (!content.scheduledAt) {
            return error('Content is not scheduled');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { scheduledAt: newDate, updatedAt: new Date() } }
        );

        await logUpdate(content.type as 'article' | 'note', content.title, id, {
            action: 'rescheduled',
            previousDate: content.scheduledAt.toISOString(),
            newDate: newDate.toISOString(),
        });

        revalidateContent();

        return success(undefined, `Rescheduled to ${newDate.toLocaleString()}`);
    } catch (err) {
        return handleError(err, 'Failed to reschedule content');
    }
};
