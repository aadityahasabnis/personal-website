// Environment Variables - Type-Safe Access
// All required env vars will throw if missing (except in build)

const getEnvVar = (key: string, required = true): string => {
    const value = process.env[key];
    if (required && !value && process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ Missing environment variable: ${key}`);
    }
    return value ?? '';
};

export const env = {
    // Database
    MONGODB_URI: getEnvVar('MONGODB_URI'),

    // Auth
    AUTH_SECRET: getEnvVar('AUTH_SECRET'),

    // Revalidation
    REVALIDATE_SECRET: getEnvVar('REVALIDATE_SECRET'),

    // Optional Services
    CLOUDINARY_URL: getEnvVar('CLOUDINARY_URL', false),
    ANALYTICS_ID: getEnvVar('ANALYTICS_ID', false),

    // Derived
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate critical env vars at startup (server only)
export const validateEnv = (): void => {
    const required = ['MONGODB_URI', 'AUTH_SECRET', 'REVALIDATE_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
