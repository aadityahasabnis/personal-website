'use server';

/**
 * Schedule Admin Queries
 * 
 * Server queries for fetching scheduled content in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IContent } from '@/interfaces';
import type { ActionResponse } from '../utils/types';
import { success } from '../utils/response';
import { handleError } from '../utils/errorHandler';

// ===== TYPES =====

export interface ScheduledContent {
    _id: string;
    type: 'article' | 'note';
    title: string;
    slug: string;
    scheduledAt: string;
    createdAt: string;
}

export interface ScheduleStats {
    totalScheduled: number;
    dueToday: number;
    dueThisWeek: number;
    overdueCount: number;
}

// ===== HELPERS =====

const getContentCollection = () => getCollection<IContent>(COLLECTIONS.content);

const serializeScheduledContent = (content: IContent): ScheduledContent => ({
    _id: content._id!.toString(),
    type: content.type as 'article' | 'note',
    title: content.title,
    slug: content.slug,
    scheduledAt: content.scheduledAt!.toISOString(),
    createdAt: content.createdAt.toISOString(),
});

// ===== QUERIES =====

/**
 * Get all scheduled content
 */
export const getScheduledContent = async (): Promise<ActionResponse<ScheduledContent[]>> => {
    try {
        const collection = await getContentCollection();
        const scheduled = await collection
            .find({ scheduledAt: { $exists: true, $gt: new Date() }, published: false })
            .sort({ scheduledAt: 1 })
            .toArray();

        return success(scheduled.map(serializeScheduledContent));
    } catch (err) {
        return handleError(err, 'Failed to get scheduled content');
    }
};

/**
 * Get overdue scheduled content (should have been published but wasn't)
 */
export const getOverdueContent = async (): Promise<ActionResponse<ScheduledContent[]>> => {
    try {
        const collection = await getContentCollection();
        const overdue = await collection
            .find({ scheduledAt: { $lte: new Date() }, published: false })
            .sort({ scheduledAt: 1 })
            .toArray();

        return success(overdue.map(serializeScheduledContent));
    } catch (err) {
        return handleError(err, 'Failed to get overdue content');
    }
};

/**
 * Get schedule statistics
 */
export const getScheduleStats = async (): Promise<ActionResponse<ScheduleStats>> => {
    try {
        const collection = await getContentCollection();
        const now = new Date();
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        const [totalScheduled, dueToday, dueThisWeek, overdueCount] = await Promise.all([
            collection.countDocuments({ 
                scheduledAt: { $exists: true, $gt: now }, 
                published: false 
            }),
            collection.countDocuments({ 
                scheduledAt: { $gt: now, $lte: endOfDay }, 
                published: false 
            }),
            collection.countDocuments({ 
                scheduledAt: { $gt: now, $lte: endOfWeek }, 
                published: false 
            }),
            collection.countDocuments({ 
                scheduledAt: { $lte: now }, 
                published: false 
            }),
        ]);

        return success({
            totalScheduled,
            dueToday,
            dueThisWeek,
            overdueCount,
        });
    } catch (err) {
        return handleError(err, 'Failed to get schedule stats');
    }
};

/**
 * Get content scheduled for a specific date range
 */
export const getScheduledInRange = async (
    startDate: Date,
    endDate: Date
): Promise<ActionResponse<ScheduledContent[]>> => {
    try {
        const collection = await getContentCollection();
        const scheduled = await collection
            .find({
                scheduledAt: { $gte: startDate, $lte: endDate },
                published: false,
            })
            .sort({ scheduledAt: 1 })
            .toArray();

        return success(scheduled.map(serializeScheduledContent));
    } catch (err) {
        return handleError(err, 'Failed to get scheduled content for range');
    }
};
