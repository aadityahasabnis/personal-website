import { env } from '@/env';
import { clientPromise, connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const googleProviderEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

/**
 * Special marker used by the OTP verification flow to indicate
 * that the user has already been authenticated via OTP.
 * When this marker is passed as the password, we skip password verification.
 */
export const OTP_VERIFIED_MARKER = '__OTP_VERIFIED__';

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
                    if (!admin) return null;

                    // Check if this is an OTP-verified login (from verifyLoginOtp action)
                    // In this case, we skip password verification since the user has
                    // already been authenticated through the OTP flow.
                    const isOtpVerified = credentials.password === OTP_VERIFIED_MARKER;

                    if (isOtpVerified) {
                        // For OTP-verified logins, just return the admin
                        // The OTP verification was already done in verifyLoginOtp
                        // Note: lastLoginAt is already updated by the OTP verification action
                        return {
                            id: admin._id.toString(),
                            email: admin.email,
                            name: admin.name,
                            image: admin.image ?? null,
                        };
                    }

                    // Regular password-based login
                    if (!admin.passwordHash) return null;

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
        ...(googleProviderEnabled
            ? [
                  Google({
                      clientId: env.GOOGLE_CLIENT_ID,
                      clientSecret: env.GOOGLE_CLIENT_SECRET,
                  }),
              ]
            : []),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Google access is restricted to admins that already exist in the admins collection.
            if (account?.provider === 'google') {
                if (!user.email) return false;

                try {
                    await connectDB();
                    const admin = await Admin.findByEmail(user.email);
                    if (!admin) return false;

                    await admin.updateLastLogin();
                    user.id = admin._id.toString();
                    user.name = admin.name;
                    user.image = admin.image ?? user.image ?? null;
                    return true;
                } catch {
                    return false;
                }
            }

            return true;
        },
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
