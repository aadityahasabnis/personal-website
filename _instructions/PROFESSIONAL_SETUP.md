# Professional Setup Guide

> Complete implementation patterns missing from initial documentation

---

## Table of Contents

1. [React Query Integration](#1-react-query-integration)
2. [Form Operations Hook](#2-form-operations-hook)
3. [Dialog & Snackbar System](#3-dialog--snackbar-system)
4. [Type Utilities](#4-type-utilities)
5. [Table Component Architecture](#5-table-component-architecture)
6. [Environment Variables](#6-environment-variables)
7. [Middleware Patterns](#7-middleware-patterns)
8. [Utility Functions](#8-utility-functions)

---

## 1. React Query Integration

### Query Client Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

const QUERY_CONFIG = {
    defaultStaleTime: 60_000,     // 1 minute
    defaultGcTime: 300_000,       // 5 minutes
    defaultRetry: 1,
    
    contentStaleTime: 300_000,    // 5 minutes for articles
    contentGcTime: 600_000,       // 10 minutes
    
    statsStaleTime: 30_000,       // 30 seconds for view counts
} as const;

let browserQueryClient: QueryClient | undefined;

const makeQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_CONFIG.defaultStaleTime,
            gcTime: QUERY_CONFIG.defaultGcTime,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: QUERY_CONFIG.defaultRetry
        }
    }
});

export const createQueryClient = (): QueryClient => {
    if (typeof window === 'undefined') return makeQueryClient();
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
};

export const clearQueryCache = (): void => {
    if (browserQueryClient) {
        browserQueryClient.clear();
        browserQueryClient = undefined;
    }
};
```

### Query Keys Factory

```typescript
// lib/queryKeys.ts
export const contentQueryKeys = {
    all: ['content'] as const,
    lists: () => [...contentQueryKeys.all, 'list'] as const,
    list: (type: string, filters?: object) => 
        [...contentQueryKeys.lists(), type, filters] as const,
    details: () => [...contentQueryKeys.all, 'detail'] as const,
    detail: (slug: string) => [...contentQueryKeys.details(), slug] as const,
};

export const statsQueryKeys = {
    all: ['stats'] as const,
    views: (slug: string) => [...statsQueryKeys.all, 'views', slug] as const,
    likes: (slug: string) => [...statsQueryKeys.all, 'likes', slug] as const,
};
```

### useAPIQuery Hook

```typescript
// hooks/useAPIQuery.ts
'use client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

interface IQueryOptions<TData> {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TData>;
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
}

export const useAPIQuery = <TData>({
    queryKey,
    queryFn,
    staleTime = 300_000,
    gcTime = 600_000,
    enabled = true
}: IQueryOptions<TData>): UseQueryResult<TData, Error> => {
    return useQuery({
        queryKey,
        queryFn,
        enabled,
        staleTime,
        gcTime,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount) => failureCount < 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    });
};
```

### Query Provider

```tsx
// providers/QueryProvider.tsx
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/queryClient';

interface IQueryProviderProps {
    children: React.ReactNode;
}

export const QueryProvider = ({ children }: IQueryProviderProps) => {
    const queryClient = createQueryClient();
    
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
};
```

---

## 2. Form Operations Hook

### Complete Form Hook

```typescript
// hooks/useFormOperations.ts
'use client';
import { useCallback, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { cloneDeep, get, set, isEqual } from 'lodash';

export type IFormData = Record<string, unknown>;
type IHandleChange = (e: { target: { name: string; value: unknown } }) => void;

interface IFormResult<TData extends IFormData> {
    formData: TData;
    isModified: boolean;
    handleChange: IHandleChange;
    setFormData: React.Dispatch<React.SetStateAction<TData>>;
    resetForm: () => void;
    submitBtnRef: React.RefObject<HTMLButtonElement>;
}

export const useFormOperations = <TData extends IFormData>(
    initialData: Partial<TData> = {}
): IFormResult<TData> => {
    const [formData, setFormData] = useState<TData>(() => initialData as TData);
    const submitBtnRef = useRef<HTMLButtonElement>(null);
    const isFirstRender = useRef(true);

    // Sync with initial data on first meaningful render
    useLayoutEffect(() => {
        if (!isFirstRender.current) return;
        if (Object.values(initialData).some(v => v !== undefined)) {
            setFormData(initialData as TData);
            isFirstRender.current = false;
        }
    }, [initialData]);

    const isModified = useMemo(
        () => !isEqual(formData, initialData),
        [formData, initialData]
    );

    const handleChange: IHandleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const currentValue = get(prev, name);
            if (isEqual(currentValue, value)) return prev;
            const updated = cloneDeep(prev);
            set(updated, name, value);
            return updated;
        });
    }, []);

    const resetForm = useCallback(
        () => setFormData(initialData as TData),
        [initialData]
    );

    return {
        formData,
        isModified,
        handleChange,
        setFormData,
        resetForm,
        submitBtnRef
    };
};
```

### Form Field Component

```tsx
// components/form/FormField.tsx
import { cn } from '@/lib/utils';

interface IFormFieldProps {
    label: string;
    name: string;
    value: unknown;
    onChange: (e: { target: { name: string; value: unknown } }) => void;
    type?: 'text' | 'email' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
}

export const FormField = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    required,
    error,
    className
}: IFormFieldProps) => {
    const inputClasses = cn(
        'w-full px-3 py-2 border rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        error && 'border-destructive',
        className
    );

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-label text-foreground">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={String(value ?? '')}
                    onChange={(e) => onChange({ target: { name, value: e.target.value } })}
                    placeholder={placeholder}
                    className={inputClasses}
                    rows={4}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={String(value ?? '')}
                    onChange={(e) => onChange({ target: { name, value: e.target.value } })}
                    placeholder={placeholder}
                    className={inputClasses}
                />
            )}
            
            {error && (
                <span className="text-sm text-destructive">{error}</span>
            )}
        </div>
    );
};
```

---

## 3. Dialog & Snackbar System

### useDialog Hook

```typescript
// hooks/useDialog.ts
'use client';
import { useState, useCallback } from 'react';

interface IDialogState<TData = unknown> {
    open: boolean;
    data?: TData;
}

export const useDialog = <TData = unknown>() => {
    const [state, setState] = useState<IDialogState<TData>>({ open: false });

    const openDialog = useCallback((data?: TData) => {
        setState({ open: true, data });
    }, []);

    const closeDialog = useCallback(() => {
        setState(prev => ({ ...prev, open: false }));
    }, []);

    return {
        isOpen: state.open,
        data: state.data,
        openDialog,
        closeDialog
    };
};
```

### Toast/Snackbar with Sonner

```tsx
// components/ui/sonner.tsx
'use client';
import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => (
    <SonnerToaster
        position="bottom-right"
        toastOptions={{
            classNames: {
                toast: 'bg-background border shadow-lg',
                title: 'text-foreground font-semibold',
                description: 'text-muted-foreground',
                actionButton: 'bg-primary text-primary-foreground',
                cancelButton: 'bg-muted text-muted-foreground',
            }
        }}
    />
);
```

### useSnackbar Hook

```typescript
// hooks/useSnackbar.ts
'use client';
import { toast } from 'sonner';

interface ISnackbarOptions {
    successTitle?: string;
    successMessage?: string;
    loadingMessage?: string;
}

interface IActionResult {
    success: boolean;
    error?: string;
    message?: string;
}

export const useSnackbar = () => {
    const triggerSnackbar = async (
        promise: Promise<IActionResult>,
        options: ISnackbarOptions = {}
    ) => {
        const {
            successTitle = 'Success!',
            successMessage = 'Operation completed.',
            loadingMessage = 'Processing...'
        } = options;

        return toast.promise(promise, {
            loading: loadingMessage,
            success: (result) => {
                if (result.error) throw new Error(result.error);
                return result.message ?? successMessage;
            },
            error: (err) => err.message ?? 'Something went wrong'
        });
    };

    return { triggerSnackbar };
};
```

---

## 4. Type Utilities

### Core Type Helpers

```typescript
// types/utils.ts

// Make specific keys optional
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Strong Omit (better than built-in)
export type StrongOmit<T, K extends keyof T> = Omit<T, K>;

// Extract keys of specific type
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T];

// Deep partial (all nested properties optional)
export type DeepPartial<T> = T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

// Non-nullable deep
export type DeepNonNullable<T> = T extends object
    ? { [P in keyof T]: DeepNonNullable<NonNullable<T[P]>> }
    : NonNullable<T>;

// Dot-notation path keys
export type DotNestedKeys<T> = T extends object
    ? { [K in keyof T & string]:
        T[K] extends object
            ? K | `${K}.${DotNestedKeys<T[K]>}`
            : K
    }[keyof T & string]
    : never;
```

### API Response Types

```typescript
// types/api.ts
export interface IApiResponse<T = unknown> {
    success: boolean;
    status: number;
    data?: T;
    metadata?: {
        count?: number;
        id?: string;
    };
    message?: string;
    error?: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    metadata: {
        count: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
}
```

---

## 5. Table Component Architecture

### Table Query State

```typescript
// hooks/useTableState.ts
'use client';
import { useState, useMemo } from 'react';

interface ITableQuery {
    offset: number;
    limit: number;
    search?: string;
    sort?: Record<string, 1 | -1>;
    filter?: Record<string, unknown>;
}

const DEFAULT_LIMIT = 10;

export const useTableState = (initialFilter?: Record<string, unknown>) => {
    const [query, setQuery] = useState<ITableQuery>({
        offset: 0,
        limit: DEFAULT_LIMIT,
        filter: initialFilter
    });

    const setPage = (page: number) => {
        setQuery(prev => ({ ...prev, offset: page * prev.limit }));
    };

    const setSearch = (search: string) => {
        setQuery(prev => ({ ...prev, search, offset: 0 }));
    };

    const setSort = (field: string, direction: 1 | -1) => {
        setQuery(prev => ({ ...prev, sort: { [field]: direction } }));
    };

    const setFilter = (filter: Record<string, unknown>) => {
        setQuery(prev => ({ ...prev, filter, offset: 0 }));
    };

    const currentPage = useMemo(
        () => Math.floor(query.offset / query.limit),
        [query.offset, query.limit]
    );

    return {
        query,
        currentPage,
        setPage,
        setSearch,
        setSort,
        setFilter
    };
};
```

### Column Structure

```typescript
// components/table/types.ts
export interface IColumnStructure<TRow> {
    key: keyof TRow | string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (value: unknown, row: TRow) => React.ReactNode;
}

export interface ITableProps<TRow> {
    columns: IColumnStructure<TRow>[];
    data: TRow[];
    loading?: boolean;
    emptyMessage?: string;
}
```

---

## 6. Environment Variables

### Type-Safe Env

```typescript
// env.ts
const getEnvVar = (key: string, required = true): string => {
    const value = process.env[key];
    if (required && !value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value ?? '';
};

export const env = {
    MONGODB_URI: getEnvVar('MONGODB_URI'),
    AUTH_SECRET: getEnvVar('AUTH_SECRET'),
    REVALIDATE_SECRET: getEnvVar('REVALIDATE_SECRET'),
    
    // Optional
    CLOUDINARY_URL: getEnvVar('CLOUDINARY_URL', false),
    ANALYTICS_ID: getEnvVar('ANALYTICS_ID', false),
    
    // Public (available on client)
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    
    // Derived
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;
```

### .env.example

```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio

# Auth
AUTH_SECRET=your-secret-key-min-32-chars

# Revalidation
REVALIDATE_SECRET=your-revalidation-secret

# Optional Services
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
ANALYTICS_ID=G-XXXXXXXXXX

# Public
NEXT_PUBLIC_SITE_URL=https://aadityahasabnis.site
```

---

## 7. Middleware Patterns

### Complete Middleware

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname;
    const response = NextResponse.next();

    // Add current path header for server actions
    response.headers.set('x-current-path', pathname);

    // Cache static assets aggressively
    if (pathname.startsWith('/images/') || pathname.startsWith('/fonts/')) {
        response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );
    }

    // Security headers for API routes
    if (pathname.startsWith('/api/')) {
        response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    return response;
};

export const config = {
    matcher: [
        // Match all except static files
        '/((?!_next/static|favicon.ico|sitemap.xml|robots.txt).*)'
    ]
};
```

---

## 8. Utility Functions

### Core Utils

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Class name merger
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

// Format date for display
export const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Slugify text
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Calculate reading time
export const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Truncate text
export const truncate = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + '...';
};
```

### Formatters

```typescript
// lib/formatters.ts
export const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
};

export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - d.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) return formatDate(d);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};
```

---

## Summary: What Was Missing

| Pattern | Status | File |
|---------|--------|------|
| React Query Setup | ✅ Added | `lib/queryClient.ts` |
| Query Keys Factory | ✅ Added | `lib/queryKeys.ts` |
| useAPIQuery Hook | ✅ Added | `hooks/useAPIQuery.ts` |
| Form Operations | ✅ Added | `hooks/useFormOperations.ts` |
| useDialog Hook | ✅ Added | `hooks/useDialog.ts` |
| useSnackbar Hook | ✅ Added | `hooks/useSnackbar.ts` |
| Type Utilities | ✅ Added | `types/utils.ts` |
| Table State Hook | ✅ Added | `hooks/useTableState.ts` |
| Environment Config | ✅ Added | `env.ts` |
| Middleware | ✅ Added | `middleware.ts` |
| Utility Functions | ✅ Added | `lib/utils.ts` |
| Formatters | ✅ Added | `lib/formatters.ts` |

---

*Version: 1.0*  
*Project: AadityaHasabnis.site*
