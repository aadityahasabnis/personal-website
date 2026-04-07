import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { auth } from '@/lib/auth/admin';
import { connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import type { IAdminDocument } from '@/server/models/types';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { error, success } from '../../utils/helper';
import type { IAdminSettingsProfile } from './types';

const ADMIN_NAME_MIN = 2;
const ADMIN_NAME_MAX = SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH;
const ADMIN_PASSWORD_MIN = 8;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const normalizeOptionalString = (value?: string | null): string | null => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized : null;
};

export const validateAdminEmail = (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email);

export const validateAdminName = (name: string): string | null => {
    const normalized = name.trim();
    if (normalized.length < ADMIN_NAME_MIN) return `Name must be at least ${String(ADMIN_NAME_MIN)} characters`;
    if (normalized.length > ADMIN_NAME_MAX) return `Name cannot exceed ${String(ADMIN_NAME_MAX)} characters`;
    return null;
};

export const validateImageUrl = (image: string | null): string | null => {
    if (!image) return null;
    return VALIDATION_PATTERNS.URL.test(image) ? null : 'Image URL must be a valid URL';
};

export const validatePasswordStrength = (password: string): string | null => {
    if (password.length < ADMIN_PASSWORD_MIN) {
        return `New password must be at least ${String(ADMIN_PASSWORD_MIN)} characters`;
    }
    if (!/[A-Z]/.test(password)) return 'New password must include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'New password must include at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'New password must include at least one number';
    return null;
};

export const getAuthenticatedAdmin = async (
    includePasswordHash = false,
): Promise<IApiResponse<IAdminDocument>> => {
    const session = await auth();
    const adminId = session?.user?.id;
    const adminEmail = session?.user?.email;
    if (!adminId && !adminEmail) return error('Unauthorized', 401);

    await connectDB();

    const selectProjection = includePasswordHash
        ? 'email name image recoveryEmail lastLoginAt updatedAt +passwordHash'
        : 'email name image recoveryEmail lastLoginAt updatedAt';

    let admin: IAdminDocument | null = null;

    if (adminId && ObjectId.isValid(adminId)) {
        admin = await Admin.findById(adminId).select(selectProjection);
    }

    if (!admin && adminEmail) {
        admin = await Admin.findOne({ email: normalizeEmail(adminEmail) }).select(selectProjection);
    }

    if (!admin) return error('Admin not found', 404);
    return success(admin);
};

export const mapAdminSettingsProfile = (admin: IAdminDocument): IAdminSettingsProfile => ({
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    image: admin.image ?? null,
    recoveryEmail: admin.recoveryEmail ?? null,
    lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
    updatedAt: admin.updatedAt.toISOString(),
});

export const revalidateAdminSettingsPaths = (): void => {
    const paths = ['/admin/settings', '/admin'];
    paths.forEach((path) => revalidatePath(path));
};