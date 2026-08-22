/**
 * Create Admin User Script
 * 
 * Usage:
 *   npx tsx src/scripts/create-admin.ts
 *   npx tsx src/scripts/create-admin.ts --email=admin@example.com --password=secure123 --name="Admin User"
 * 
 * Environment variables (optional):
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */

import { connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import bcrypt from 'bcryptjs';

const getArg = (name: string, fallback: string) => {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : process.env[`ADMIN_${name.toUpperCase()}`] ?? fallback;
};

const EMAIL = getArg('email', 'aaditya.hasabnis.dev@gmail.com');
const PASSWORD = getArg('password', 'Admin@123');
const NAME = getArg('name', 'Aaditya Hasabnis');

async function main() {
    await connectDB();
    
    await Admin.init();

    const existing = await Admin.findByEmail(EMAIL);
    if (existing) {
        console.log(`✗ Admin already exists: ${EMAIL}`);
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 12);
    // Salt rounds 12 (industry standard: 10-12)
    const admin = await Admin.create({ email: EMAIL, name: NAME, passwordHash });

    console.log(`✓ Admin created: ${admin.email}`);
    console.log(`  ID: ${admin._id}`);
    console.log(`  Name: ${admin.name}`);
    console.log('\n⚠️  Change password after first login');
    process.exit(0);
}

main().catch((err) => {
    console.error('✗ Error:', err.message);
    process.exit(1);
});
