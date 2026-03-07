'use server';

/**
 * Activity Admin Queries
 * 
 * Server queries for fetching activity logs in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IActivityLog } from '@/interfaces';
import type { ActionResponse, PaginatedResponse, ActivityEntity, ActivityAction } from '../utils/types';
import { success, paginated } from '../utils/response';
import { handleError } from '../utils/errorHandler';

// ===== TYPES =====

export interface AdminActivityLog {
    _id: string;
    action: ActivityAction;
    entity: ActivityEntity;
    entityId?: string;
    entityTitle?: string;
    userId?: string;
    userEmail?: string;
    details?: Record<string, unknown>;
    createdAt: string;
}

export interface GetActivityRequest {
    limit?: number;
    offset?: number;
    entity?: ActivityEntity;
    action?: ActivityAction;
}

export interface ActivityStats {
    total: number;
    today: number;
    thisWeek: number;
    byAction: Record<ActivityAction, number>;
    byEntity: Record<ActivityEntity, number>;
}

// ===== HELPERS =====

const getActivityCollection = () => getCollection<IActivityLog>(COLLECTIONS.activityLogs);

const serializeActivityLog = (log: IActivityLog): AdminActivityLog => ({
    _id: log._id!.toString(),
    action: log.action as ActivityAction,
    entity: log.entity as ActivityEntity,
    entityId: log.entityId,
    entityTitle: log.entityTitle,
    userId: log.userId?.toString(),
    userEmail: log.userEmail,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
});

// ===== QUERIES =====

/**
 * Get activity logs with optional filtering and pagination
 */
export const getActivityLogs = async (request: GetActivityRequest = {}): Promise<PaginatedResponse<AdminActivityLog>> => {
    try {
        const { limit = 50, offset = 0, entity, action } = request;
        const collection = await getActivityCollection();

        // Build query
        const query: Record<string, unknown> = {};
        if (entity) query.entity = entity;
        if (action) query.action = action;

        const [logs, total] = await Promise.all([
            collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return paginated(logs.map(serializeActivityLog), total, limit, offset);
    } catch (err) {
        const errorResult = handleError(err, 'Failed to get activity logs');
        return {
            ...errorResult,
            data: [],
            metadata: { total: 0, limit: 50, offset: 0, hasMore: false },
        };
    }
};

/**
 * Get recent activity (simplified)
 */
export const getRecentActivity = async (limit = 50): Promise<ActionResponse<AdminActivityLog[]>> => {
    try {
        const collection = await getActivityCollection();
        const logs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
        return success(logs.map(serializeActivityLog));
    } catch (err) {
        return handleError(err, 'Failed to get recent activity');
    }
};

/**
 * Get activity by entity
 */
export const getActivityByEntity = async (
    entity: ActivityEntity,
    entityId?: string,
    limit = 20
): Promise<ActionResponse<AdminActivityLog[]>> => {
    try {
        const collection = await getActivityCollection();
        const query: Record<string, unknown> = { entity };
        if (entityId) query.entityId = entityId;

        const logs = await collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
        return success(logs.map(serializeActivityLog));
    } catch (err) {
        return handleError(err, 'Failed to get activity by entity');
    }
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (): Promise<ActionResponse<ActivityStats>> => {
    try {
        const collection = await getActivityCollection();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const [
            total,
            today,
            thisWeek,
            createCount,
            updateCount,
            deleteCount,
            publishCount,
            unpublishCount,
            loginCount,
            exportCount,
            reorderCount,
            articleCount,
            noteCount,
            projectCount,
            topicCount,
            subtopicCount,
            commentCount,
            subscriberCount,
            mediaCount,
            settingsCount,
            userCount,
            messageCount,
        ] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({ createdAt: { $gte: startOfDay } }),
            collection.countDocuments({ createdAt: { $gte: startOfWeek } }),
            // By action
            collection.countDocuments({ action: 'create' }),
            collection.countDocuments({ action: 'update' }),
            collection.countDocuments({ action: 'delete' }),
            collection.countDocuments({ action: 'publish' }),
            collection.countDocuments({ action: 'unpublish' }),
            collection.countDocuments({ action: 'login' }),
            collection.countDocuments({ action: 'export' }),
            collection.countDocuments({ action: 'reorder' }),
            // By entity
            collection.countDocuments({ entity: 'article' }),
            collection.countDocuments({ entity: 'note' }),
            collection.countDocuments({ entity: 'project' }),
            collection.countDocuments({ entity: 'topic' }),
            collection.countDocuments({ entity: 'subtopic' }),
            collection.countDocuments({ entity: 'comment' }),
            collection.countDocuments({ entity: 'subscriber' }),
            collection.countDocuments({ entity: 'media' }),
            collection.countDocuments({ entity: 'settings' }),
            collection.countDocuments({ entity: 'user' }),
            collection.countDocuments({ entity: 'message' }),
        ]);

        return success({
            total,
            today,
            thisWeek,
            byAction: {
                create: createCount,
                update: updateCount,
                delete: deleteCount,
                publish: publishCount,
                unpublish: unpublishCount,
                login: loginCount,
                export: exportCount,
                reorder: reorderCount,
            },
            byEntity: {
                article: articleCount,
                note: noteCount,
                project: projectCount,
                topic: topicCount,
                subtopic: subtopicCount,
                comment: commentCount,
                subscriber: subscriberCount,
                media: mediaCount,
                settings: settingsCount,
                user: userCount,
                message: messageCount,
            },
        });
    } catch (err) {
        return handleError(err, 'Failed to get activity stats');
    }
};
