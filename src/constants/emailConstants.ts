// ============================================================
// Email Constants - Configuration and defaults for email service
// ============================================================

// ============================================================
// Email Types - Categorization for logging and tracking
// ============================================================

export const EMAIL_TYPE = {
    OTP: 'OTP',
    PASSWORD_RESET: 'PASSWORD_RESET',
    TEST: 'TEST',
    NEWSLETTER: 'NEWSLETTER',
} as const;
export type EmailType = (typeof EMAIL_TYPE)[keyof typeof EMAIL_TYPE];

// ============================================================
// Email Status - For tracking newsletter sends
// ============================================================

export const EMAIL_STATUS = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    FAILED: 'FAILED',
} as const;
export type EmailStatusType = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];

// ============================================================
// Gmail SMTP Configuration
// ============================================================

export const GMAIL_SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
} as const;

// ============================================================
// Retry Configuration - Exponential backoff for failed sends
// ============================================================

export const EMAIL_RETRY_CONFIG = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
} as const;

// ============================================================
// Rate Limit Configuration - Gmail limits (500/day for free accounts)
// ============================================================

export const EMAIL_RATE_LIMIT = {
    dailyLimit: 500,
    warningThreshold: 450,
    batchSize: 25,
    batchDelayMs: 2000,
} as const;

// ============================================================
// Default Sender Information - Personalized branding
// ============================================================

export const DEFAULT_SENDER = {
    name: 'Aaditya Hasabnis',
    website: 'aadityahasabnis.com',
} as const;

// ============================================================
// Email Template Colors - Lavender theme from globals.css
// Using hex for maximum email client compatibility
// ============================================================

export const EMAIL_COLORS = {
    // Primary lavender (oklch(0.55 0.24 285) ≈ #9b87f5)
    primary: '#9b87f5',
    primaryHover: '#8b77e5',
    // Light backgrounds
    lightBg: '#f5f3ff',
    subtleBg: '#faf9fe',
    // Text colors
    textDark: '#1a1a2e',
    textMuted: '#6b6b8f',
    textSubtle: '#9999b3',
    // Gradient (for header)
    gradientStart: '#9b87f5',
    gradientMid: '#a78bfa',
    gradientEnd: '#8b5cf6',
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    // Borders
    border: '#e5e5f0',
    borderLight: '#f0f0f8',
} as const;

// ============================================================
// Email Validation - RFC 5322 compliant regex
// ============================================================

export const EMAIL_VALIDATION = {
    // RFC 5322 compliant email regex
    regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    maxLength: 254,
} as const;

// ============================================================
// OTP Configuration
// ============================================================

export const OTP_CONFIG = {
    length: 6,
    expiresInMinutes: 10,
    expiresInText: '10 minutes',
} as const;

// ============================================================
// Password Reset Configuration
// ============================================================

export const PASSWORD_RESET_CONFIG = {
    expiresInHours: 1,
    expiresInText: '1 hour',
} as const;
