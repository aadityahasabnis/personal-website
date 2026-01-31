import { MongoClient, type Db } from 'mongodb';
import { env } from '@/env';

const MONGODB_URI = env.MONGODB_URI;
const DB_NAME = 'portfolio';

// Connection options optimized for MongoDB Atlas
const options = {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    // TLS configuration for MongoDB Atlas
    tls: true,
    tlsAllowInvalidCertificates: false,
};

// Singleton pattern for connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB and return the database instance.
 * Uses connection pooling and caching for optimal performance.
 */
export const connectDB = async (): Promise<Db> => {
    // Return cached connection if available
    if (cachedDb && cachedClient) {
        return cachedDb;
    }

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }

    try {
        const client = await MongoClient.connect(MONGODB_URI, options);
        const db = client.db(DB_NAME);

        // Cache the connection
        cachedClient = client;
        cachedDb = db;

        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

/**
 * Get a typed collection from the database
 */
export const getCollection = async <T extends object>(
    collectionName: string
) => {
    const db = await connectDB();
    return db.collection<T>(collectionName);
};

/**
 * Close the database connection (for cleanup)
 */
export const closeConnection = async (): Promise<void> => {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
        console.log('🔌 MongoDB connection closed');
    }
};
