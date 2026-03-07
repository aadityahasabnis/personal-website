/**
 * MongoDB Client Promise — for NextAuth adapter and any code that needs
 * the raw MongoClient promise.
 *
 * Re-exports the single shared promise from connect.ts so the entire
 * application uses exactly one MongoClient instance (one connection pool).
 */
export { clientPromise as default } from '@/lib/db/connect';
