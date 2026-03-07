import { MongoClient, type Db } from 'mongodb';
import { env } from '@/env';

const MONGODB_URI = env.MONGODB_URI;
const DB_NAME = 'portfolio';

const options = {
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
};

// Global singleton — survives Next.js HMR in dev and module-level re-imports.
// Caches the in-flight Promise so concurrent callers share one connection attempt.
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const createClientPromise = (): Promise<MongoClient> => {
    if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not defined');
    const client = new MongoClient(MONGODB_URI, options);
    return client.connect()
        .then((c) => {
            console.log('✅ Connected to MongoDB');
            // Reset the global when the connection pool closes so the next
            // request creates a fresh connection instead of reusing a dead one.
            c.on('close', () => { global._mongoClientPromise = undefined; });
            return c;
        })
        .catch((err) => {
            // Clear the cached promise so the next request retries rather than
            // awaiting a permanently-rejected promise.
            global._mongoClientPromise = undefined;
            throw err;
        });
};

if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;

export const connectDB = async (): Promise<Db> => {
    const client = await clientPromise;
    return client.db(DB_NAME);
};

export const getCollection = async <T extends object>(collectionName: string) => {
    const db = await connectDB();
    return db.collection<T>(collectionName);
};

export { clientPromise };
