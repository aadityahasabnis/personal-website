interface IMongoDuplicateError {
    code?: number;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
}

export const isDuplicateSlugError = (err: unknown): boolean => {
    const mongoErr = err as IMongoDuplicateError;
    if (mongoErr?.code !== 11000) return false;
    return Boolean(mongoErr?.keyPattern?.slug) || Boolean(mongoErr?.keyValue?.slug);
};
