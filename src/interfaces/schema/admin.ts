import type { IDocument, ITimestamps } from './base';

// ============================================================
// Admin OTP Data - Stored during two-step login flow
// ============================================================

export interface IAdminOtp {
    /** 6-digit OTP code (plaintext) */
    code: string;
    /** Timestamp when OTP expires */
    expiresAt: Date;
    /** Email address OTP was sent to ('main' email or 'recovery' email) */
    targetEmail: string;
}

// ============================================================
// Admin Password Reset Token - Stored during forgot password flow
// ============================================================

export interface IAdminPasswordResetToken {
    /** 16-character secure token */
    token: string;
    /** Timestamp when token expires */
    expiresAt: Date;
}

// ============================================================
// Admin Interface
// ============================================================

export interface IAdmin extends IDocument, ITimestamps {
    email: string;
    name: string;
    image: string | null;
    recoveryEmail: string | null;
    passwordHash: string | null;
    lastLoginAt: Date | null;
    /** OTP data for two-step login (null when not in OTP flow) */
    otp: IAdminOtp | null;
    /** Password reset token data (null when not resetting) */
    passwordResetToken: IAdminPasswordResetToken | null;
}
