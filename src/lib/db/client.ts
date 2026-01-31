import { MongoClient } from 'mongodb';

/**
 * MongoDB Client for NextAuth Adapter
 *
 * This creates a shared MongoClient promise that the NextAuth MongoDB adapter uses.
 * Separate from the main db connection to allow for adapter-specific configuration.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

const options = {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
};

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development, use a global variable so the client is not recreated on HMR
    if (!global._mongoClientPromise) {
        const client = new MongoClient(MONGODB_URI, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, create a new client for each instance
    const client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
}

export default clientPromise;
