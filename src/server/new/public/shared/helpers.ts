import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

interface IPublicRateLimitRecord {
    scope: string;
    key: string;
    hits: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

interface IConsumePublicRateLimitInput {
    scope: string;
    key: string;
    limit: number;
    windowMs: number;
}

interface IConsumePublicRateLimitResult {
    allowed: boolean;
    hits: number;
    retryAfterSeconds: number;
}

const PUBLIC_RATE_LIMITS_COLLECTION = 'publicRateLimits';
let publicRateLimitIndexesPromise: Promise<void> | null = null;

const ensurePublicRateLimitIndexes = async (): Promise<void> => {
    if (publicRateLimitIndexesPromise) return publicRateLimitIndexesPromise;

    const collection = mongoose.connection.collection<IPublicRateLimitRecord>(PUBLIC_RATE_LIMITS_COLLECTION);
    publicRateLimitIndexesPromise = Promise.all([
        collection.createIndex({ scope: 1, key: 1 }, { unique: true, name: 'scope_1_key_1' }),
        collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'expiresAt_ttl' }),
    ]).then(() => undefined);

    return publicRateLimitIndexesPromise;
};

export const toObjectIdOrNull = (value: string): ObjectId | null => {
    if (!ObjectId.isValid(value)) return null;
    return new ObjectId(value);
};

export const toIsoOrNull = (value: Date | null | undefined): string | null => {
    if (!value) return null;
    return value.toISOString();
};

export const normalizeClientAddress = (value?: string | null): string | null => {
    if (typeof value !== 'string') return null;
    const firstHop = value.split(',')[0]?.trim();
    return firstHop ? firstHop : null;
};

export const normalizeClientUserAgent = (value?: string | null): string | null => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized : null;
};

export const buildClientFingerprint = (
    clientAddress?: string | null,
    userAgent?: string | null,
): string | null => {
    const normalizedAddress = normalizeClientAddress(clientAddress);
    const normalizedUserAgent = normalizeClientUserAgent(userAgent);
    const source = [normalizedAddress, normalizedUserAgent].filter(Boolean).join('|');
    if (!source) return null;
    return createHash('sha256').update(source).digest('hex');
};

export const consumePublicRateLimit = async (
    input: IConsumePublicRateLimitInput,
): Promise<IConsumePublicRateLimitResult> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + input.windowMs);
    const collection = mongoose.connection.collection<IPublicRateLimitRecord>(PUBLIC_RATE_LIMITS_COLLECTION);

    await ensurePublicRateLimitIndexes();
    await collection.deleteMany({
        scope: input.scope,
        key: input.key,
        expiresAt: { $lte: now },
    });

    try {
        await collection.updateOne(
            { scope: input.scope, key: input.key },
            {
                $inc: { hits: 1 },
                $set: { updatedAt: now },
                $setOnInsert: {
                    scope: input.scope,
                    key: input.key,
                    hits: 0,
                    createdAt: now,
                    expiresAt,
                },
            },
            { upsert: true }
        );
    } catch (err) {
        const maybeDuplicateKeyError = err as { code?: number };
        if (maybeDuplicateKeyError.code === 11000) {
            await collection.updateOne(
                { scope: input.scope, key: input.key },
                {
                    $inc: { hits: 1 },
                    $set: { updatedAt: now },
                }
            );
        } else {
            throw err;
        }
    }

    const current = await collection.findOne(
        { scope: input.scope, key: input.key },
        { projection: { _id: 0, hits: 1, expiresAt: 1 } }
    );

    if (!current) {
        return { allowed: true, hits: 0, retryAfterSeconds: 0 };
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((current.expiresAt.getTime() - now.getTime()) / 1000));
    return {
        allowed: current.hits <= input.limit,
        hits: current.hits,
        retryAfterSeconds,
    };
};
