import { ObjectId } from 'mongodb';

export const toObjectIdOrNull = (value: string): ObjectId | null => {
    if (!ObjectId.isValid(value)) return null;
    return new ObjectId(value);
};

export const toIsoOrNull = (value: Date | null | undefined): string | null => {
    if (!value) return null;
    return value.toISOString();
};
