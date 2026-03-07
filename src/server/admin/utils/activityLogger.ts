/**
 * Activity Logger Utility
 * 
 * Logs admin actions for audit trail and activity feed.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IActivityLog } from '@/interfaces';
import type { ActivityAction, ActivityEntity, ActivityLogOptions } from './types';
import { getAuthUser } from './authGuard';

// ===== ACTIVITY LOGGER =====

export const logActivity = async (
    action: ActivityAction,
    entity: ActivityEntity,
    options: ActivityLogOptions = {}
): Promise<void> => {
    try {
        const user = await getAuthUser();
        const collection = await getCollection<IActivityLog>(COLLECTIONS.activityLogs);
        
        await collection.insertOne({
            action,
            entity,
            entityId: options.entityId,
            entityTitle: options.entityTitle,
            userId: user?.id ? undefined : undefined, // Convert to ObjectId if needed
            userEmail: user?.email,
            details: options.details,
            createdAt: new Date(),
        });
    } catch (err) {
        // Don't fail the main action if logging fails
        console.error('[Activity Log Error]:', err);
    }
};

// ===== CONVENIENCE METHODS =====

export const logCreate = (entity: ActivityEntity, title?: string, id?: string) =>
    logActivity('create', entity, { entityTitle: title, entityId: id });

export const logUpdate = (entity: ActivityEntity, title?: string, id?: string, details?: Record<string, unknown>) =>
    logActivity('update', entity, { entityTitle: title, entityId: id, details });

export const logDelete = (entity: ActivityEntity, title?: string, id?: string) =>
    logActivity('delete', entity, { entityTitle: title, entityId: id });

export const logPublish = (entity: ActivityEntity, title?: string, id?: string) =>
    logActivity('publish', entity, { entityTitle: title, entityId: id });

export const logUnpublish = (entity: ActivityEntity, title?: string, id?: string) =>
    logActivity('unpublish', entity, { entityTitle: title, entityId: id });

export const logExport = (entity: ActivityEntity, details?: Record<string, unknown>) =>
    logActivity('export', entity, { details });

export const logReorder = (entity: ActivityEntity, details?: Record<string, unknown>) =>
    logActivity('reorder', entity, { details });

// ===== ACTION WITH LOGGING WRAPPER =====

export const withActivityLog = <TInput, TOutput>(
    action: ActivityAction,
    entity: ActivityEntity,
    getOptions: (input: TInput, result: TOutput) => ActivityLogOptions,
    handler: (input: TInput) => Promise<{ success: boolean; data?: TOutput; error?: string; message?: string }>
) => async (input: TInput) => {
    const result = await handler(input);
    if (result.success && result.data !== undefined) {
        await logActivity(action, entity, getOptions(input, result.data));
    }
    return result;
};
