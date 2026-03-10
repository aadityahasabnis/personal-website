// =================================================
// Activity logger — audit trail for admin actions
// Non-blocking: failures are silently swallowed.
// =================================================

import { getCollection } from '@/lib/db/connectDB';
import { getAuthUser } from './authGuard';
import type { ActivityAction, ActivityEntity } from './types';

interface ActivityLog {
    action:      ActivityAction;
    entity:      ActivityEntity;
    entityId?:   string;
    entityTitle?: string;
    userEmail?:  string;
    details?:    Record<string, unknown>;
    createdAt:   Date;
}

export const logActivity = async (
    action: ActivityAction,
    entity: ActivityEntity,
    opts: { entityId?: string; entityTitle?: string; details?: Record<string, unknown> } = {}
): Promise<void> => {
    try {
        const user = await getAuthUser();
        const col  = await getCollection<ActivityLog>('activityLogs');
        await col.insertOne({ action, entity, ...opts, userEmail: user?.email, createdAt: new Date() });
    } catch { /* non-blocking */ }
};

export const logCreate    = (entity: ActivityEntity, title?: string, id?: string) => logActivity('create',    entity, { entityTitle: title, entityId: id });
export const logUpdate    = (entity: ActivityEntity, title?: string, id?: string) => logActivity('update',    entity, { entityTitle: title, entityId: id });
export const logDelete    = (entity: ActivityEntity, title?: string, id?: string) => logActivity('delete',    entity, { entityTitle: title, entityId: id });
export const logPublish   = (entity: ActivityEntity, title?: string, id?: string) => logActivity('publish',   entity, { entityTitle: title, entityId: id });
export const logUnpublish = (entity: ActivityEntity, title?: string, id?: string) => logActivity('unpublish', entity, { entityTitle: title, entityId: id });
