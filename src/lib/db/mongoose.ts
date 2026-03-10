/**
 * Mongoose Connection
 *
 * Singleton connection for Mongoose, matching the native MongoClient
 * pattern in connect.ts. Survives Next.js HMR in development.
 *
 * All server actions in src/server/new/ that use Mongoose models
 * must call `await connectMongoose()` before any model operation.
 * The helper.ts `ensureConnection()` wrapper handles this automatically.
 */

import mongoose from 'mongoose';
import { env } from '@/env';

const MONGODB_URI = env.MONGODB_URI;
const DB_NAME = 'portfolio';

declare global {
    // eslint-disable-next-line no-var
    var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

const createMongooseConnection = (): Promise<typeof mongoose> => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }

    return mongoose
        .connect(MONGODB_URI, {
            dbName: DB_NAME,
            maxPoolSize: 5,
            minPoolSize: 1,
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
            retryWrites: true,
        })
        .then((m) => {
            console.log('✅ Connected to MongoDB (Mongoose)');
            return m;
        })
        .catch((err) => {
            global._mongoosePromise = undefined;
            throw err;
        });
};

/**
 * Get or create the Mongoose connection.
 * Safe to call multiple times — returns the cached promise.
 */
export async function connectMongoose(): Promise<typeof mongoose> {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!global._mongoosePromise) {
        global._mongoosePromise = createMongooseConnection();
    }

    return global._mongoosePromise;
}
