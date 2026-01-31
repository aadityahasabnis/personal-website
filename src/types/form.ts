// Type utilities for form handling
// Adapted from refer-2 genericInterfaces.ts

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

// API response types
export interface IApiResponse<T = unknown> {
    success: boolean;
    status: number;
    data?: T;
    message?: string;
    error?: string;
}

// Form data base type
export type IFormData<T = Record<string, any>> = T;

// Handle change event type
export interface IHandleChangeEvent {
    target: {
        name: string;
        value: unknown;
    };
}

export type IHandleChange = (e: IHandleChangeEvent) => void;
