// =================================================
// Environment — single source of truth
// Never import process.env directly elsewhere.
// =================================================

const get = (key: string, required = true): string => {
    const value = process.env[key];
    if (required && !value) {
        if (process.env.NODE_ENV === 'production') throw new Error(`Missing env var: ${key}`);
        console.warn(`[env] Missing: ${key}`);
    }
    return value ?? '';
};

export const env = {
    MONGODB_URI:           get('MONGODB_URI'),
    DB_NAME:               get('DB_NAME', false) || 'portfolio',
    CDN_SECRET:            get('CDN_SECRET'),
    NEXTAUTH_SECRET:       get('NEXTAUTH_SECRET'),
    GOOGLE_CLIENT_ID:      get('GOOGLE_CLIENT_ID', false),
    GOOGLE_CLIENT_SECRET:  get('GOOGLE_CLIENT_SECRET', false),
    CLOUDINARY_CLOUD_NAME: get('CLOUDINARY_CLOUD_NAME', false),
    CLOUDINARY_API_KEY:    get('CLOUDINARY_API_KEY',    false),
    CLOUDINARY_API_SECRET: get('CLOUDINARY_API_SECRET', false),
    // Email Configuration (Gmail SMTP)
    GMAIL_ACCOUNT:         get('GMAIL_ACCOUNT', false),
    GMAIL_PASSWORD:        get('GMAIL_PASSWORD', false),
    IS_PROD: process.env.NODE_ENV === 'production',
    IS_DEV:  process.env.NODE_ENV === 'development',
} as const;

export const isCloudinaryConfigured = () =>
    Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

export const isEmailConfigured = () =>
    Boolean(env.GMAIL_ACCOUNT && env.GMAIL_PASSWORD);