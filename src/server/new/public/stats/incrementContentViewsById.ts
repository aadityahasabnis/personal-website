'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import PageStats from '@/server/models/PageStats';
import { error, handleError, success } from '../../utils/helper';
import { ensurePublishedContent, parseStatsContentObjectId, toStatsSnapshot } from './shared';
import type { IContentStatsSnapshot } from './types';

// ========================================================
// Mutation: Increment Content Views By Id
// ========================================================

export const incrementContentViewsById = async (
    contentId: string,
): Promise<IApiResponse<IContentStatsSnapshot>> => {
    try {
        const objectId = parseStatsContentObjectId(contentId);
        if (!objectId) return error('Invalid content id', 400);
        await connectDB();

        const canRead = await ensurePublishedContent(objectId);
        if (!canRead) return error('Published content not found', 404);

        const row = await PageStats.findOneAndUpdate(
            { contentId: objectId },
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date() },
                $setOnInsert: { likes: 0 },
            },
            {
                returnDocument: 'after',
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).lean<{ views?: number; likes?: number; lastViewedAt?: Date | null } | null>();

        return success(toStatsSnapshot(contentId, row));
    } catch (err) {
        return handleError(err, 'Failed to increment content views');
    }
};

/*
API Responses:
- 200: Content stats snapshot returned after atomic views increment.
- 400: Invalid content id.
- 404: Published content not found.
- 500: Unexpected server/database error.
*/
