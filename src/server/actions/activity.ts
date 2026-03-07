'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IActivityLog, ActivityAction, ActivityEntity, IApiResponse } from '@/interfaces';
import { createErrorResponse, createSuccessResponse } from '@/server/lib/action-utils';

// ===== HELPERS =====

const getActivityCollection = () => getCollection<IActivityLog>(COLLECTIONS.activityLogs);

// ===== LOG ACTIVITY =====

export const logActivity = async (
    action: ActivityAction,
    entity: ActivityEntity,
    options?: {
        entityId?: string;
        entityTitle?: string;
        userId?: string;
        userEmail?: string;
        details?: Record<string, unknown>;
    }
): Promise<void> => {
    try {
        const collection = await getActivityCollection();
        await collection.insertOne({
            action,
            entity,
            entityId: options?.entityId,
            entityTitle: options?.entityTitle,
            userId: options?.userId ? new ObjectId(options.userId) : undefined,
            userEmail: options?.userEmail,
            details: options?.details,
            createdAt: new Date(),
        } as IActivityLog);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

// ===== QUERY ACTIONS =====

export const getRecentActivity = async (limit = 50): Promise<IApiResponse<IActivityLog[]>> => {
    try {
        const collection = await getActivityCollection();
        const logs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
        return createSuccessResponse(logs);
    } catch (error) {
        console.error('Get recent activity error:', error);
        return createErrorResponse('Failed to get activity logs', 500);
    }
};

export const getActivityByEntity = async (
    entity: ActivityEntity,
    entityId?: string,
    limit = 20
): Promise<IApiResponse<IActivityLog[]>> => {
    try {
        const collection = await getActivityCollection();
        const query: Record<string, unknown> = { entity };
        if (entityId) query.entityId = entityId;
        
        const logs = await collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
        return createSuccessResponse(logs);
    } catch (error) {
        console.error('Get activity by entity error:', error);
        return createErrorResponse('Failed to get activity logs', 500);
    }
};

export const clearOldActivity = async (daysToKeep = 90): Promise<IApiResponse<number>> => {
    try {
        const collection = await getActivityCollection();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const result = await collection.deleteMany({ createdAt: { $lt: cutoffDate } });
        revalidatePath('/admin/activity');
        return createSuccessResponse(result.deletedCount, `Deleted ${result.deletedCount} old activity logs`);
    } catch (error) {
        console.error('Clear old activity error:', error);
        return createErrorResponse('Failed to clear activity logs', 500);
    }
};
