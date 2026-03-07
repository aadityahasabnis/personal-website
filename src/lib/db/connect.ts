import { MongoClient, type Db } from 'mongodb';
import { env } from '@/env';

const MONGODB_URI = env.MONGODB_URI;
const DB_NAME = 'portfolio';

const options = {
    // Atlas free tier (M0) allows 500 connections total shared across all clients.
    // Keep this small so multiple serverless instances don't exhaust the limit.
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
};

// ---------------------------------------------------------------------------
// Global singleton — survives Next.js HMR in dev and module-level re-imports.
//
// The critical fix vs. the previous implementation:
//   BEFORE: cached the resolved client/db — so 6 parallel awaits all saw
//           `cachedDb = null` simultaneously and each opened a new connection.
//   AFTER:  cache the *in-flight Promise* — all parallel callers await the
//           exact same promise, so MongoClient.connect() is called exactly once
//           no matter how many concurrent queries fire at startup.
// ---------------------------------------------------------------------------

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }
    const client = new MongoClient(MONGODB_URI, options);
    return client.connect().then((c) => {
        console.log('✅ Connected to MongoDB');
        return c;
    });
}

// Reuse the global promise across HMR reloads in dev.
// In production the module is loaded once per process so global is the same object.
if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;

/**
 * Connect to MongoDB and return the database instance.
 *
 * All concurrent callers share the same Promise so MongoClient.connect()
 * is only ever called once per process.
 */
export const connectDB = async (): Promise<Db> => {
    const client = await clientPromise;
    return client.db(DB_NAME);
};

/**
 * Get a typed collection from the database.
 */
export const getCollection = async <T extends object>(
    collectionName: string
) => {
    const db = await connectDB();
    return db.collection<T>(collectionName);
};

/**
 * Expose the raw client promise for adapters (e.g. NextAuth) that need it.
 */
export { clientPromise };
