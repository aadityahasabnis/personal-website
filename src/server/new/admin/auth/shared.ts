// ============================================================
// Auth Shared Utilities
// Common validation and helper functions for auth actions
// ============================================================

import { OTP_CONFIG } from '@/constants/emailConstants';
import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import type { IAdminDocument } from '@/server/models/types';
import { error, success } from '../../utils/helper';
import type { OtpTargetEmail } from './types';

// ============================================================
// Constants
// ============================================================

const PASSWORD_MIN_LENGTH = 8;

// ============================================================
// Email Validation
// ============================================================

/**
 * Validates email format using the same pattern as schema validation.
 * 
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    return VALIDATION_PATTERNS.EMAIL.test(email);
};

/**
 * Normalizes email address (trim and lowercase).
 * 
 * @param email - Email address to normalize
 * @returns Normalized email
 */
export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

// ============================================================
// Password Validation
// ============================================================

/**
 * Validates password strength for reset/change operations.
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter  
 * - At least one number
 * 
 * @param password - Password to validate
 * @returns Error message or null if valid
 */
export const validatePasswordStrength = (password: string): string | null => {
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must include at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must include at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must include at least one number';
    }
    return null;
};

// ============================================================
// OTP Validation
// ============================================================

/**
 * Validates OTP format (6 digits).
 * 
 * @param otp - OTP string to validate
 * @returns true if valid format, false otherwise
 */
export const isValidOtpFormat = (otp: string): boolean => {
    return /^\d+$/.test(otp) && otp.length === OTP_CONFIG.length;
};

/**
 * Validates target email option.
 * 
 * @param target - Target email option ('main' or 'recovery')
 * @returns true if valid, false otherwise
 */
export const isValidOtpTarget = (target: string): target is OtpTargetEmail => {
    return target === 'main' || target === 'recovery';
};

// ============================================================
// Admin Lookup Utilities
// ============================================================

/**
 * Finds admin by email with password hash included.
 * Used for credential verification.
 * 
 * @param email - Admin email address
 * @returns API response with admin document or error
 */
export const findAdminByEmailWithPassword = async (
    email: string
): Promise<IApiResponse<IAdminDocument>> => {
    await connectDB();
    
    const admin = await Admin.findByEmail(normalizeEmail(email));
    if (!admin) {
        return error('Invalid credentials', 401);
    }
    
    if (!admin.passwordHash) {
        return error('Password authentication is not configured for this account', 409);
    }
    
    return success(admin);
};

/**
 * Finds admin by email with OTP data included.
 * Used for OTP verification.
 * 
 * @param email - Admin email address
 * @returns API response with admin document or error
 */
export const findAdminByEmailWithOtp = async (
    email: string
): Promise<IApiResponse<IAdminDocument>> => {
    await connectDB();
    
    const admin = await Admin.findByEmailWithOtp(normalizeEmail(email));
    if (!admin) {
        return error('Admin not found', 404);
    }
    
    return success(admin);
};

/**
 * Finds admin by password reset token.
 * Used for password reset verification.
 * 
 * @param token - Password reset token
 * @returns API response with admin document or error
 */
export const findAdminByResetToken = async (
    token: string
): Promise<IApiResponse<IAdminDocument>> => {
    await connectDB();
    
    const admin = await Admin.findByResetToken(token);
    if (!admin) {
        return error('Invalid or expired reset token', 400);
    }
    
    return success(admin);
};

/**
 * Gets the target email address based on preference.
 * 
 * @param admin - Admin document
 * @param target - Target email option ('main' or 'recovery')
 * @returns Email address or null if recovery is selected but not set
 */
export const getTargetEmailAddress = (
    admin: IAdminDocument,
    target: OtpTargetEmail
): string | null => {
    if (target === 'main') {
        return admin.email;
    }
    return admin.recoveryEmail;
};
