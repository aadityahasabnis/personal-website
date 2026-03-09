// Type utilities for form handling

/* eslint-disable @typescript-eslint/no-explicit-any */

// Strong Omit - better than built-in Omit
export type StrongOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Make specific keys optional
export type MakeOptional<T, K extends keyof T> = StrongOmit<T, K> & Partial<Pick<T, K>>;

// Dot-notated keys for nested objects (scalar values only)
export type DotNestedScalarKeys<T> = T extends object
    ? {
        [K in keyof T & string]: T[K] extends Array<any>
        ? K
        : T[K] extends object
        ? K | `${K}.${DotNestedScalarKeys<T[K]>}`
        : K;
    }[keyof T & string]
    : never;

// Dot-notated keys for boolean properties
export type DotNestedBooleanKeys<T> = T extends object
    ? {
        [K in keyof T & string]: T[K] extends boolean
        ? K
        : T[K] extends object
        ? `${K}.${DotNestedBooleanKeys<T[K]>}`
        : never;
    }[keyof T & string]
    : never;

// Deep partial type
export type DeepPartial<T> = T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

// Re-export IApiResponse from canonical source (interfaces/index.ts)
export type { IApiResponse, IFormData } from '@/interfaces/schema';

// Form data base type (kept for legacy compatibility — prefer IFormData from @/interfaces)
// Handle change event type
export interface IHandleChangeEvent {
    target: {
        name: string;
        value: unknown;
    };
}

export type IHandleChange = (e: IHandleChangeEvent) => void;

