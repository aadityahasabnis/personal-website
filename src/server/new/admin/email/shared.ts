// ============================================================
// Admin Email Server Actions - Shared Utilities
// ============================================================

import { isEmailConfigured } from '@/server/new/utils/mail';
import { error } from '../../utils/helper';

// ============================================================
// Check Email Service Configuration
// ============================================================

export const requireEmailService = () => {
    if (!isEmailConfigured()) {
        return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
    }
    return null;
};

// ============================================================
// Generate OTP - Cryptographically random 6-digit code
// ============================================================

export const generateOtp = (length = 6): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

// ============================================================
// Generate Reset Token - URL-safe random string
// ============================================================

export const generateResetToken = (length = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
};
