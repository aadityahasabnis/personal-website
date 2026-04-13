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
    WELCOME: 'WELCOME',
    CONTACT_RESPONSE: 'CONTACT_RESPONSE',
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
// Welcome Email Content - Shared copy for onboarding emails
// ============================================================

export const WELCOME_EMAIL_CONTENT = {
    subject: `Welcome to ${DEFAULT_SENDER.name}'s Newsletter`,
    previewText: 'Thanks for subscribing! Excited to have you here.',
    intro:
        "Thank you for subscribing to my newsletter! I'm excited to have you join the community.",
    updatesHeading: "You'll receive updates about:",
    updates: [
        'New articles and blog posts',
        'Project updates and launches',
        'Tips, insights, and behind-the-scenes content',
    ],
    ctaLabel: 'Visit My Website',
    replyHint:
        'Feel free to reply to any of my emails - I read and respond to every message.',
} as const;

// ============================================================
// Email Template Colors - Lavender theme from globals.css
// Using hex for maximum email client compatibility
// ============================================================

export const EMAIL_COLORS = {
    // Primary lavender (oklch(0.55 0.24 285) ≈ #9b87f5)
    primary: '#7a67de',
    primaryHover: '#6957cd',
    // Light backgrounds
    lightBg: '#efebff',
    subtleBg: '#f5f2ff',
    // Text colors
    textDark: '#15162f',
    textMuted: '#4f5173',
    textSubtle: '#74779a',
    // Gradient (for header)
    gradientStart: '#6f5fd2',
    gradientMid: '#7f70e4',
    gradientEnd: '#5f50bf',
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    // Borders
    border: '#dbd7f0',
    borderLight: '#ece9fb',
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
    /** Number of digits in OTP */
    length: 6,
    /** OTP validity period in minutes */
    expiresInMinutes: 5,
    /** Human-readable expiry text for emails */
    expiresInText: '5 minutes',
} as const;

// ============================================================
// Password Reset Configuration
// ============================================================

export const PASSWORD_RESET_CONFIG = {
    /** Token validity period in minutes */
    expiresInMinutes: 15,
    /** Human-readable expiry text for emails */
    expiresInText: '15 minutes',
    /** Length of the reset token (secure random string) */
    tokenLength: 16,
} as const;

// ============================================================
// Pending Login Token Configuration (JWT for OTP flow)
// ============================================================

export const PENDING_LOGIN_CONFIG = {
    /** Token validity period in minutes (same as OTP) */
    expiresInMinutes: 5,
    /** JWT purpose identifier */
    purpose: 'login-otp' as const,
} as const;
