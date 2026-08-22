import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =================================================
// Styling
// =================================================

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// =================================================
// DB Utilities — ObjectId helpers (client-safe)
// =================================================

const OBJECT_ID_HEX_24 = /^[a-f0-9]{24}$/i;

export const isValidObjectId = (id: string): boolean =>
    typeof id === 'string' && OBJECT_ID_HEX_24.test(id);

export const toObjectId = (id: string): string | null => {
    try {
        return isValidObjectId(id) ? id : null;
    } catch { return null; }
};

export const toObjectIds = (ids: string[]): string[] =>
    ids.map(toObjectId).filter((id): id is string => id !== null);


// =================================================
// Date & Time
// =================================================

export const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateTime = (date?: Date | string): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(new Date(date));
};

export const formatRelativeTime = (date: Date | string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 7)  return formatDate(date);
    if (d > 0)  return `${d}d ago`;
    if (h > 0)  return `${h}h ago`;
    if (m > 0)  return `${m}m ago`;
    return 'Just now';
};

// =================================================
// String
// =================================================

export const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const calculateReadingTime = (text: string) =>
    Math.ceil(text.trim().split(/\s+/).length / 120); // ~120 wpm

export const formatNumber = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
    : n.toLocaleString();

export const truncate = (text: string, length: number) =>
    text.length <= length ? text : `${text.slice(0, length).trim()}...`;

// =================================================
// Serialization (Server → Client Components)
// =================================================

export const serialize = <T extends Record<string, unknown>>(doc: T): T =>
    JSON.parse(JSON.stringify(doc, (_, v) => {
        if (v?._bsontype === 'ObjectId') return v.toString();
        if (v instanceof Date) return v.toISOString();
        return v;
    }));

export const serializeMany = <T extends Record<string, unknown>>(docs: T[]): T[] =>
    docs.map(serialize);

// =================================================
// Error
// =================================================

export const getErrorMessage = (err: unknown): string =>
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'An unexpected error occurred';

// =================================================
// Environment
// =================================================

export const isServer = typeof window === 'undefined';
export const isClient = !isServer;
