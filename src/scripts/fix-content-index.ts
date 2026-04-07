import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import mongoose from 'mongoose';

interface IIndexSpec {
    name?: string;
    key: Record<string, number>;
    unique?: boolean;
}

const isTypeSlugKey = (idx: IIndexSpec): boolean => {
    const keys = Object.keys(idx.key ?? {});
    return keys.length === 2 && idx.key.type === 1 && idx.key.slug === 1;
};

const isLegacyGlobalSlugIndex = (idx: IIndexSpec): boolean => {
    const keys = Object.keys(idx.key ?? {});
    return idx.unique === true && keys.length === 1 && idx.key.slug === 1;
};

const formatKey = (key: Record<string, number>): string => {
    return JSON.stringify(key);
};

const run = async (): Promise<void> => {
    await connectDB();

    const collection = Content.collection;
    const indexes = (await collection.indexes()) as IIndexSpec[];

    const legacyIndexes = indexes.filter(isLegacyGlobalSlugIndex);

    if (legacyIndexes.length) {
        for (const idx of legacyIndexes) {
            if (!idx.name) continue;
            console.log(`[index-fix] Dropping legacy index: ${idx.name} key=${formatKey(idx.key)}`);
            await collection.dropIndex(idx.name);
        }
    } else {
        console.log('[index-fix] No legacy global slug index found.');
    }

    const duplicateTypeScoped = await Content.aggregate<{ _id: { type: string; slug: string }; count: number }>([
        { $group: { _id: { type: '$type', slug: '$slug' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 20 },
    ]);

    if (duplicateTypeScoped.length) {
        console.error('[index-fix] Cannot enforce unique (type, slug). Duplicate rows found:');
        duplicateTypeScoped.forEach((row) => {
            console.error(`- type=${row._id.type} slug=${row._id.slug} count=${row.count}`);
        });
        process.exitCode = 1;
        return;
    }

    const latestIndexes = (await collection.indexes()) as IIndexSpec[];

    // If a non-unique { type, slug } index exists, drop it so we can recreate it as unique.
    const nonUniqueTypeSlugIndexes = latestIndexes.filter((idx) => isTypeSlugKey(idx) && idx.unique !== true);
    if (nonUniqueTypeSlugIndexes.length) {
        for (const idx of nonUniqueTypeSlugIndexes) {
            if (!idx.name) continue;
            console.log(`[index-fix] Dropping non-unique {type,slug} index: ${idx.name} key=${formatKey(idx.key)}`);
            await collection.dropIndex(idx.name);
        }
    }

    const refreshedIndexes = (await collection.indexes()) as IIndexSpec[];
    const hasUniqueTypeSlugIndex = refreshedIndexes.some((idx) => isTypeSlugKey(idx) && idx.unique === true);

    if (!hasUniqueTypeSlugIndex) {
        console.log('[index-fix] Creating unique index on { type: 1, slug: 1 }');
        await collection.createIndex({ type: 1, slug: 1 }, { unique: true, name: 'type_1_slug_1' });
    } else {
        console.log('[index-fix] Unique { type, slug } index already exists.');
    }

    console.log('[index-fix] Done.');
};

run()
    .catch((err) => {
        console.error('[index-fix] Failed:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
