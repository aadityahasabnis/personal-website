import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IActivityLog, ActivityEntity } from '@/interfaces';

/**
 * Get all activity logs for admin
 */
export const getAllActivityForAdmin = async (limit = 100): Promise<IActivityLog[]> => {
    try {
        const collection = await getCollection<IActivityLog>(COLLECTIONS.activityLogs);
        return await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (error) {
        console.error('Failed to fetch activity logs', error);
        return [];
    }
};

/**
 * Get activity by entity type
 */
export const getActivityByEntityType = async (entity: ActivityEntity, limit = 50): Promise<IActivityLog[]> => {
    try {
        const collection = await getCollection<IActivityLog>(COLLECTIONS.activityLogs);
        return await collection.find({ entity }).sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (error) {
        console.error(`Failed to fetch ${entity} activity`, error);
        return [];
    }
};

/**
 * Get activity count by day for the last N days
 */
export const getActivityCountByDay = async (days = 30): Promise<{ date: string; count: number }[]> => {
    try {
        const collection = await getCollection<IActivityLog>(COLLECTIONS.activityLogs);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const result = await collection.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]).toArray();

        return result.map(r => ({ date: r._id as string, count: r.count as number }));
    } catch (error) {
        console.error('Failed to get activity count by day', error);
        return [];
    }
};

/**
 * Get activity summary stats
 */
export const getActivityStats = async (): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    byAction: Record<string, number>;
}> => {
    try {
        const collection = await getCollection<IActivityLog>(COLLECTIONS.activityLogs);
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        const [total, today, thisWeek, byAction] = await Promise.all([
            collection.countDocuments(),
            collection.countDocuments({ createdAt: { $gte: todayStart } }),
            collection.countDocuments({ createdAt: { $gte: weekStart } }),
            collection.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 } } },
            ]).toArray(),
        ]);

        return {
            total,
            today,
            thisWeek,
            byAction: Object.fromEntries(byAction.map(a => [a._id, a.count])),
        };
    } catch (error) {
        console.error('Failed to get activity stats', error);
        return { total: 0, today: 0, thisWeek: 0, byAction: {} };
    }
};
