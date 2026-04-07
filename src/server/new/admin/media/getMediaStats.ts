'use server';

import type { MediaFileType, MediaFolder } from '@/constants/mediaConstants';
import { MEDIA_FILE_TYPES, MEDIA_FOLDER_OPTIONS, formatBytes } from '@/constants/mediaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { IMediaStats } from './types';

interface ITypeStatsRow {
    _id: MediaFileType | null;
    count: number;
    totalSize: number;
}

interface IFolderStatsRow {
    _id: string | null;
    count: number;
    totalSize: number;
}

const isMediaFolder = (value: string): value is MediaFolder =>
    MEDIA_FOLDER_OPTIONS.includes(value as MediaFolder);

// ========================================================
// Query: Media Statistics
// ========================================================

export const getMediaStats = async (): Promise<IApiResponse<IMediaStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const [typeStats, folderStats, recentCount] = await Promise.all([
            Media.aggregate<ITypeStatsRow>([
                { $group: { _id: '$fileType', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
            ]),
            Media.aggregate<IFolderStatsRow>([
                { $group: { _id: '$folder', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
            ]),
            Media.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        ]);

        const byType = {
            image: { count: 0, size: 0 },
            video: { count: 0, size: 0 },
            file: { count: 0, size: 0 },
        };

        typeStats.forEach((stat) => {
            const normalized = { count: stat.count, size: stat.totalSize };

            if (stat._id === MEDIA_FILE_TYPES.IMAGE) byType.image = normalized;
            else if (stat._id === MEDIA_FILE_TYPES.VIDEO) byType.video = normalized;
            else if (stat._id === MEDIA_FILE_TYPES.FILE) byType.file = normalized;
        });

        const byFolder: Record<MediaFolder, { count: number; size: number }> = {
            root: { count: 0, size: 0 },
            blog: { count: 0, size: 0 },
            articles: { count: 0, size: 0 },
            projects: { count: 0, size: 0 },
            gallery: { count: 0, size: 0 },
            documents: { count: 0, size: 0 },
        };

        folderStats.forEach((stat) => {
            if (typeof stat._id === 'string' && isMediaFolder(stat._id)) {
                byFolder[stat._id] = { count: stat.count, size: stat.totalSize };
            }
        });

        const totalFiles = typeStats.reduce((sum, stat) => sum + stat.count, 0);
        const totalSize = typeStats.reduce((sum, stat) => sum + stat.totalSize, 0);

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
