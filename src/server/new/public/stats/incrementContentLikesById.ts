'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import PageStats from '@/server/models/PageStats';
import { headers } from 'next/headers';
import { error, handleError, success } from '../../utils/helper';
import { buildClientFingerprint, consumePublicRateLimit } from '../shared';
import { ensurePublishedContent, parseStatsContentObjectId, toStatsSnapshot } from './shared';
import type { IContentStatsSnapshot } from './types';

const LIKES_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;
const LIKES_DEDUP_MAX_PER_WINDOW = 1;

// ========================================================
// Mutation: Increment Content Likes By Id
// ========================================================

export const incrementContentLikesById = async (
    contentId: string,
): Promise<IApiResponse<IContentStatsSnapshot>> => {
    try {
        const objectId = parseStatsContentObjectId(contentId);
        if (!objectId) return error('Invalid content id', 400);
        await connectDB();

        const canRead = await ensurePublishedContent(objectId);
        if (!canRead) return error('Published content not found', 404);

        let clientFingerprint: string | null = null;
        try {
            const requestHeaders = await headers();
            const clientIp = requestHeaders.get('x-forwarded-for')
                ?? requestHeaders.get('x-real-ip')
                ?? requestHeaders.get('cf-connecting-ip');
            const userAgent = requestHeaders.get('user-agent');
            clientFingerprint = buildClientFingerprint(clientIp, userAgent);
        } catch {
            clientFingerprint = null;
        }

        if (clientFingerprint) {
            const limiter = await consumePublicRateLimit({
                scope: `public:stats:likes:${contentId}`,
                key: clientFingerprint,
                limit: LIKES_DEDUP_MAX_PER_WINDOW,
                windowMs: LIKES_DEDUP_WINDOW_MS,
            });

            if (!limiter.allowed) {
                const current = await PageStats.findOne({ contentId: objectId })
                    .select('views likes lastViewedAt')
                    .lean<{ views?: number; likes?: number; lastViewedAt?: Date | null } | null>();
                return success(toStatsSnapshot(contentId, current), 'Like already counted recently');
            }
        }

        const row = await PageStats.findOneAndUpdate(
            { contentId: objectId },
            {
                $inc: { likes: 1 },
                $setOnInsert: { views: 0 },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).lean<{ views?: number; likes?: number; lastViewedAt?: Date | null } | null>();

        return success(toStatsSnapshot(contentId, row));
    } catch (err) {
        return handleError(err, 'Failed to increment content likes');
    }
};

/*
API Responses:
- 200: Content stats snapshot returned after atomic likes increment.
- 400: Invalid content id.
- 404: Published content not found.
- 500: Unexpected server/database error.
*/
