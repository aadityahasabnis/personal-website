import { MongoDBAdapter } from '@auth/mongodb-adapter';
import type { Adapter } from 'next-auth/adapters';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { env } from '@/env';
import { clientPromise, connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, { databaseName: env.DB_NAME }) as Adapter,
    secret: env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    pages: { signIn: '/admin/login', error: '/admin/login' },
    trustHost: true,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    await connectDB();
                    const admin = await Admin.findByEmail(credentials.email as string);
                    if (!admin?.passwordHash) return null;

                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        admin.passwordHash
                    );
                    if (!isValid) return null;

                    await admin.updateLastLogin();

                    return {
                        id: admin._id.toString(),
                        email: admin.email,
                        name: admin.name,
                        image: admin.image ?? null,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
            }
            return token;
        },
        session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.image as string | null;
            }
            return session;
        },
    },
});

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image: string | null;
        };
    }
    interface User {
        id: string;
        email: string;
        name: string;
        image: string | null;
    }
}
