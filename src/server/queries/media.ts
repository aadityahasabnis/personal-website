import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import type { IMedia } from '@/interfaces/schema';

// ============================================================
// Media Queries (Compatibility Layer)
// ============================================================

export const getAllMediaForAdmin = async (): Promise<IMedia[]> => {
    await connectDB();

    const docs = await Media.find({})
        .sort({ createdAt: -1 })
        .lean<IMedia[]>();

    return docs;
};

export const getTotalStorageUsed = async (): Promise<number> => {
    await connectDB();

    const result = await Media.aggregate<{ total: number }>([
        {
            $group: {
                _id: null,
                total: { $sum: '$size' },
            },
        },
    ]);

    return result[0]?.total ?? 0;
};
