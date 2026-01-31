import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';

import clientPromise from '@/lib/db/client';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IUser } from '@/interfaces';

/**
 * NextAuth v5 Configuration
 *
 * Uses credentials provider for owner-only login.
 * MongoDB adapter for session and user storage.
 *
 * Note: Auth protection for admin routes is handled in the admin layout,
 * not in middleware, since MongoDB cannot run in edge runtime.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: 'portfolio',
    }),
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/admin/login',
        error: '/admin/login',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                try {
                    const collection = await getCollection<IUser>(COLLECTIONS.users);
                    const user = await collection.findOne({ email });

                    if (!user) {
                        return null;
                    }

                    // Check if user has a password hash (for credentials login)
                    const userWithPassword = user as IUser & { passwordHash?: string };
                    if (!userWithPassword.passwordHash) {
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);
                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user._id?.toString() ?? '',
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role ?? 'editor';
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    trustHost: true,
});

// Extend session types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            role: string;
        };
    }
}
