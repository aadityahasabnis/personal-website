'use server';

/**
 * Activity Admin Actions
 * 
 * Server actions for managing activity logs in the admin panel.
 */

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IActivityLog } from '@/interfaces/schema';
import type { ActionResponse, ActivityAction, ActivityEntity } from '../utils/types';
import { success, error } from '../utils/response';
import { handleError } from '../utils/errorHandler';

// ===== TYPES =====

export interface ClearOldActivityRequest {
    daysToKeep?: number;
}

export interface LogActivityRequest {
    action: ActivityAction;
    entity: ActivityEntity;
    entityId?: string;
    entityTitle?: string;
    details?: Record<string, unknown>;
}

// ===== HELPERS =====

const getActivityCollection = () => getCollection<IActivityLog>(COLLECTIONS.activityLogs);

const revalidateActivity = () => {
    revalidatePath('/admin/activity');
    revalidatePath('/admin');
};

// ===== ACTIONS =====

/**
 * Clear old activity logs
 */
export const clearOldActivity = async (request: ClearOldActivityRequest = {}): Promise<ActionResponse<number>> => {
    try {
        const { daysToKeep = 90 } = request;

        if (daysToKeep < 1) {
            return error('Days to keep must be at least 1');
        }

        const collection = await getActivityCollection();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await collection.deleteMany({ createdAt: { $lt: cutoffDate } });

        revalidateActivity();

        return success(result.deletedCount, `Deleted ${result.deletedCount} old activity logs`);
    } catch (err) {
        return handleError(err, 'Failed to clear activity logs');
    }
};

/**
 * Clear all activity logs
 */
export const clearAllActivity = async (): Promise<ActionResponse<number>> => {
    try {
        const collection = await getActivityCollection();
        const result = await collection.deleteMany({});

        revalidateActivity();

        return success(result.deletedCount, `Deleted ${result.deletedCount} activity logs`);
    } catch (err) {
        return handleError(err, 'Failed to clear all activity logs');
    }
};

/**
 * Delete specific activity logs by IDs
 */
export const deleteActivityLogs = async (ids: string[]): Promise<ActionResponse<number>> => {
    try {
        const { ObjectId } = await import('mongodb');
        
        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid activity log IDs provided');
        }

        const collection = await getActivityCollection();
        const result = await collection.deleteMany({ _id: { $in: validIds } });

        revalidateActivity();

        return success(result.deletedCount, `Deleted ${result.deletedCount} activity logs`);
    } catch (err) {
        return handleError(err, 'Failed to delete activity logs');
    }
};
