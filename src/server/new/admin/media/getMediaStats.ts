'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { MEDIA_FILE_TYPES, formatBytes } from '@/constants/mediaConstants';
import type { MediaFolder } from '@/constants/mediaConstants';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { IMediaStats } from './types';

// ========================================================
// Query: Media Statistics
// ========================================================

export const getMediaStats = async (): Promise<IApiResponse<IMediaStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const [typeStats, folderStats, recentCount] = await Promise.all([
            Media.aggregate([
                { $group: { _id: '$fileType', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
            ]),
            Media.aggregate([
                { $group: { _id: '$folder', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
            ]),
            Media.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        ]);

        const byType = {
            image: { count: 0, size: 0 },
            video: { count: 0, size: 0 },
            file: { count: 0, size: 0 },
        };

        typeStats.forEach((stat: any) => {
            if (stat._id === MEDIA_FILE_TYPES.IMAGE) byType.image = stat;
            else if (stat._id === MEDIA_FILE_TYPES.VIDEO) byType.video = stat;
            else if (stat._id === MEDIA_FILE_TYPES.FILE) byType.file = stat;
        });

        const byFolder: Record<MediaFolder, { count: number; size: number }> = {
            root: { count: 0, size: 0 },
            blog: { count: 0, size: 0 },
            articles: { count: 0, size: 0 },
            projects: { count: 0, size: 0 },
            gallery: { count: 0, size: 0 },
            documents: { count: 0, size: 0 },
        };

        folderStats.forEach((stat: any) => {
            if (stat._id in byFolder) {
                byFolder[stat._id as MediaFolder] = { count: stat.count, size: stat.totalSize };
            }
        });

        const totalFiles = typeStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const totalSize = typeStats.reduce((sum: number, stat: any) => sum + stat.totalSize, 0);

        const stats: IMediaStats = {
            totalFiles,
            totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            byType,
            byFolder,
            recentUploads: recentCount,
        };

        return success(stats);
    } catch (err) {
        return handleError(err, 'Failed to get media statistics');
    }
};

/*
API Responses:
- 200: Statistics returned successfully.
- 401: Admin authentication required.
- 500: Database error.
*/
