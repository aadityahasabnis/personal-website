/**
 * Create Admin User Script
 *
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Creates an admin user for the admin panel login.
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { env } from '@/env';

const MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;
const DB_NAME = 'portfolio';

interface IAdminUser {
    email: string;
    name: string;
    passwordHash: string;
    role: 'admin' | 'editor';
    createdAt: Date;
    updatedAt: Date;
}

const createAdmin = async (): Promise<void> => {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const users = db.collection<IAdminUser>('users');

        // Admin credentials - CHANGE THESE IN PRODUCTION!
        const adminEmail = 'aaditya.hasabnis@gmail.com';
        const adminPassword = 'Admin@123'; // Change this!
        const adminName = 'Aaditya Hasabnis';

        // Check if admin already exists
        const existing = await users.findOne({ email: adminEmail });
        if (existing) {
            console.log(`⚠️ Admin user already exists: ${adminEmail}`);
            console.log('To reset password, delete the user and run this script again.');
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const result = await users.insertOne({
            email: adminEmail,
            name: adminName,
            passwordHash,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   ID: ${result.insertedId.toString()}`);
        console.log('');
        console.log('⚠️ IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        throw error;
    } finally {
        await client.close();
        console.log('🔌 Connection closed');
    }
};

createAdmin().catch(console.error);
