// ============================================================
// Auth Token Utilities
// Secure token generation and JWT handling for auth flows
// ============================================================

import { OTP_CONFIG, PASSWORD_RESET_CONFIG, PENDING_LOGIN_CONFIG } from '@/constants/emailConstants';
import { env } from '@/env';
import { randomBytes, randomInt } from 'crypto';
import jwt from 'jsonwebtoken';

// ============================================================
// Types
// ============================================================

export interface IPendingLoginPayload {
    /** Admin MongoDB ObjectId */
    adminId: string;
    /** Admin email address */
    email: string;
    /** Token purpose identifier */
    purpose: typeof PENDING_LOGIN_CONFIG.purpose;
    /** Issued at timestamp */
    iat: number;
    /** Expiration timestamp */
    exp: number;
}

// ============================================================
// OTP Generation
// ============================================================

/**
 * Generates a cryptographically secure numeric OTP.
 * Uses crypto.randomInt for unbiased random number generation.
 * 
 * @returns 6-digit OTP string (zero-padded)
 * 
 * @example
 * generateOtp() // "042851"
 */
export const generateOtp = (): string => {
    const max = Math.pow(10, OTP_CONFIG.length);
    const otp = randomInt(0, max);
    return otp.toString().padStart(OTP_CONFIG.length, '0');
};

/**
 * Calculates OTP expiration timestamp.
 * 
 * @returns Date object representing when the OTP expires
 */
export const getOtpExpiry = (): Date => {
    return new Date(Date.now() + OTP_CONFIG.expiresInMinutes * 60 * 1000);
};

/**
 * Checks if an OTP has expired.
 * 
 * @param expiresAt - The expiration timestamp
 * @returns true if expired, false otherwise
 */
export const isOtpExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};

// ============================================================
// Password Reset Token Generation
// ============================================================

/**
 * Generates a cryptographically secure random token for password reset.
 * Uses URL-safe base64 encoding for easy inclusion in URLs.
 * 
 * @returns 16-character alphanumeric token
 * 
 * @example
 * generateResetToken() // "a7Bx9kM2pQ4rS1tV"
 */
export const generateResetToken = (): string => {
    // Generate more bytes than needed, then take first N characters
    // This ensures we have enough characters after base64 encoding
    const bytes = randomBytes(PASSWORD_RESET_CONFIG.tokenLength);
    return bytes
        .toString('base64url')
        .slice(0, PASSWORD_RESET_CONFIG.tokenLength);
};

/**
 * Calculates password reset token expiration timestamp.
 * 
 * @returns Date object representing when the token expires
 */
export const getResetTokenExpiry = (): Date => {
    return new Date(Date.now() + PASSWORD_RESET_CONFIG.expiresInMinutes * 60 * 1000);
};

/**
 * Checks if a password reset token has expired.
 * 
 * @param expiresAt - The expiration timestamp
 * @returns true if expired, false otherwise
 */
export const isResetTokenExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};

// ============================================================
// Pending Login JWT (for OTP flow)
// ============================================================

/**
 * Creates a signed JWT for the pending login state (between password verification and OTP verification).
 * This token proves the user has successfully entered their password.
 * 
 * @param adminId - Admin MongoDB ObjectId
 * @param email - Admin email address
 * @returns Signed JWT string
 * 
 * @example
 * const token = createPendingLoginToken('507f1f77bcf86cd799439011', 'admin@example.com');
 */
export const createPendingLoginToken = (adminId: string, email: string): string => {
    const payload: Omit<IPendingLoginPayload, 'iat' | 'exp'> = {
        adminId,
        email,
        purpose: PENDING_LOGIN_CONFIG.purpose,
    };

    return jwt.sign(payload, env.NEXTAUTH_SECRET, {
        expiresIn: `${PENDING_LOGIN_CONFIG.expiresInMinutes}m`,
    });
};

/**
 * Verifies and decodes a pending login JWT.
 * Validates signature, expiration, and purpose claim.
 * 
 * @param token - JWT string to verify
 * @returns Decoded payload if valid, null if invalid/expired
 * 
 * @example
 * const payload = verifyPendingLoginToken(token);
 * if (!payload) throw new Error('Invalid or expired token');
 */
export const verifyPendingLoginToken = (token: string): IPendingLoginPayload | null => {
    try {
        const decoded = jwt.verify(token, env.NEXTAUTH_SECRET) as IPendingLoginPayload;
        
        // Validate purpose claim
        if (decoded.purpose !== PENDING_LOGIN_CONFIG.purpose) {
            return null;
        }

        return decoded;
    } catch {
        // Token is invalid, expired, or malformed
        return null;
    }
};

// ============================================================
// Email Masking Utilities
// ============================================================

/**
 * Masks an email address for display, showing only first 2 characters and domain.
 * Used to show users which email OTP was sent to without revealing full address.
 * 
 * @param email - Full email address
 * @returns Masked email (e.g., "ad***@gmail.com")
 * 
 * @example
 * maskEmail('admin@gmail.com') // "ad***@gmail.com"
 * maskEmail('a@example.com')   // "a***@example.com"
 */
export const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    
    const visibleChars = Math.min(2, local.length);
    const masked = local.slice(0, visibleChars) + '***';
    
    return `${masked}@${domain}`;
};
