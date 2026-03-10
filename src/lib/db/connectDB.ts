// =================================================
// Database — Mongoose connection for Next.js
// Hot-reload safe with global caching
//
// Why two clients?
// - Mongoose (connectDB): All app models & queries
// - MongoClient (clientPromise): NextAuth adapter only
//   (NextAuth's adapter requires native client, not Mongoose)
// =================================================

import { env } from '@/env';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

declare global {
    // eslint-disable-next-line no-var
    var _mongoose: Promise<typeof mongoose> | undefined;
    // eslint-disable-next-line no-var
    var _mongoClient: Promise<MongoClient> | undefined;
}

// =================================================
// Mongoose Connection (for all model operations)
// =================================================

export async function connectDB(): Promise<typeof mongoose> {
    if (mongoose.connection.readyState === 1) return mongoose;
    
    if (!global._mongoose) {
        mongoose.set('autoIndex', true);
        global._mongoose = mongoose
            .connect(env.MONGODB_URI, {
                dbName: env.DB_NAME,
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            })
            .catch((err) => {
                console.error('[MongoDB] Connection failed:', err.message);
                global._mongoose = undefined;
                throw err;
            });
    }
    
    return global._mongoose;
}

// =================================================
// Native MongoClient (NextAuth adapter only)
// =================================================

const getClientPromise = (): Promise<MongoClient> => {
    if (!global._mongoClient) {
        const client = new MongoClient(env.MONGODB_URI);
        global._mongoClient = client.connect()
            .catch((err) => {
                global._mongoClient = undefined;
                throw err;
            });
    }
    return global._mongoClient;
};

/**
 * Native MongoDB client promise.
 * Used exclusively by NextAuth adapter.
 * For all other operations, use connectDB() + Mongoose models.
 */
export const clientPromise: Promise<MongoClient> = getClientPromise();