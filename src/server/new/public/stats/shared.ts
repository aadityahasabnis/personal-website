import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import type { IContentStatsSnapshot } from './types';

export const ensurePublishedContent = async (contentId: ObjectId): Promise<boolean> => {
    const row = await Content.findOne({
        _id: contentId,
        publishStatus: PUBLISH_STATUS.PUBLISHED,
    })
        .select('_id')
        .lean<{ _id: ObjectId } | null>();

    return Boolean(row);
};

export const toStatsSnapshot = (
    contentId: string,
    row: { views?: number; likes?: number; lastViewedAt?: Date | null } | null,
): IContentStatsSnapshot => ({
    contentId,
    views: row?.views ?? 0,
    likes: row?.likes ?? 0,
    lastViewedAt: row?.lastViewedAt ? row.lastViewedAt.toISOString() : null,
});
