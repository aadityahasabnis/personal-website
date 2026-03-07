'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import type { IApiResponse } from '@/interfaces';

// ===== TYPES =====

export interface IAdminQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
    queryKey: QueryKey;
    queryFn: () => Promise<TData>;
    searchFields?: (keyof TData extends string ? keyof TData : string)[];
    searchFn?: (item: TData, query: string) => boolean;
}

export interface IAdminMutationOptions<TData, TVariables, TContext = unknown> {
    mutationFn: (variables: TVariables) => Promise<IApiResponse<TData>>;
    invalidateKeys?: QueryKey[];
    onOptimisticUpdate?: (variables: TVariables) => TContext;
    onRollback?: (context: TContext) => void;
    onSuccess?: (data: IApiResponse<TData>, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
}

export interface IUseAdminDataReturn<T> {
    // Data
    data: T[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    
    // Search & Filter
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: Record<string, string>;
    setFilter: (key: string, value: string) => void;
    setFilters: (filters: Record<string, string>) => void;
    clearFilters: () => void;
    activeFiltersCount: number;
    filteredData: T[];
    
    // Selection
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    
    // Pagination
    displayedData: T[];
    displayCount: number;
    hasMore: boolean;
    loadMore: () => void;
    
    // Optimistic updates
    optimisticUpdate: (id: string, updateFn: (item: T) => T) => void;
    optimisticDelete: (id: string) => void;
    optimisticBulkUpdate: (ids: string[], updateFn: (item: T) => T) => void;
    rollback: () => void;
}

const ITEMS_PER_PAGE = 15;

// ===== ADMIN DATA HOOK =====

/**
 * TanStack Query-based hook for admin data tables with search, filter, pagination, and optimistic updates.
 * Replaces useAdminTable with proper caching and background refresh.
 */
export function useAdminData<T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T[]>,
    keyExtractor: (item: T) => string,
    options?: {
        searchFields?: (keyof T)[];
        searchFn?: (item: T, query: string) => boolean;
        initialData?: T[];
        staleTime?: number;
    }
): IUseAdminDataReturn<T> {
    const queryClient = useQueryClient();
    
    // Query
    const { data: serverData = [], isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn,
        initialData: options?.initialData,
        staleTime: options?.staleTime ?? 30_000,
        gcTime: 5 * 60_000,
    });
    
    // Local state for optimistic updates and UI
    const [optimisticData, setOptimisticData] = useState<T[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFiltersState] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    
    // Use optimistic data if available, otherwise server data
    const data = optimisticData ?? serverData;
    
    // Reset optimistic data when server data changes
    useMemo(() => { setOptimisticData(null); }, [serverData]);
    
    // ===== SEARCH & FILTER =====
    
    const filteredData = useMemo(() => {
        let result = [...data];
        
        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => {
                if (options?.searchFn) return options.searchFn(item, query);
                return (options?.searchFields ?? []).some(field => {
                    const value = item[field];
                    if (typeof value === 'string') return value.toLowerCase().includes(query);
                    if (Array.isArray(value)) return value.some(v => String(v).toLowerCase().includes(query));
                    return false;
                });
            });
        }
        
        // Filters
        Object.entries(filters).forEach(([key, value]) => {
            if (!value || value === 'all') return;
            result = result.filter(item => {
                const itemValue = (item as Record<string, unknown>)[key];
                if (typeof itemValue === 'boolean') return String(itemValue) === value;
                return itemValue === value;
            });
        });
        
        return result;
    }, [data, searchQuery, filters, options?.searchFields, options?.searchFn]);
    
    const displayedData = useMemo(() => filteredData.slice(0, displayCount), [filteredData, displayCount]);
    const hasMore = displayedData.length < filteredData.length;
    
    // ===== FILTERS =====
    
    const setFilter = useCallback((key: string, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    }, []);
    
    const setFilters = useCallback((newFilters: Record<string, string>) => {
        setFiltersState(newFilters);
    }, []);
    
    const clearFilters = useCallback(() => {
        setFiltersState({});
        setSearchQuery('');
    }, []);
    
    const activeFiltersCount = useMemo(() => 
        Object.values(filters).filter(v => v && v !== 'all').length,
        [filters]
    );
    
    // ===== SELECTION =====
    
    const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);
    
    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }, []);
    
    const selectAll = useCallback(() => {
        setSelectedIds(filteredData.map(keyExtractor));
    }, [filteredData, keyExtractor]);
    
    const clearSelection = useCallback(() => setSelectedIds([]), []);
    
    // ===== PAGINATION =====
    
    const loadMore = useCallback(() => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }, []);
    
    // ===== OPTIMISTIC UPDATES =====
    
    const optimisticUpdate = useCallback((id: string, updateFn: (item: T) => T) => {
        setOptimisticData(prev => {
            const source = prev ?? serverData;
            return source.map(item => keyExtractor(item) === id ? updateFn(item) : item);
        });
    }, [serverData, keyExtractor]);
    
    const optimisticDelete = useCallback((id: string) => {
        setOptimisticData(prev => {
            const source = prev ?? serverData;
            return source.filter(item => keyExtractor(item) !== id);
        });
        setSelectedIds(prev => prev.filter(i => i !== id));
    }, [serverData, keyExtractor]);
    
    const optimisticBulkUpdate = useCallback((ids: string[], updateFn: (item: T) => T) => {
        const idSet = new Set(ids);
        setOptimisticData(prev => {
            const source = prev ?? serverData;
            return source.map(item => idSet.has(keyExtractor(item)) ? updateFn(item) : item);
        });
    }, [serverData, keyExtractor]);
    
    const rollback = useCallback(() => {
        setOptimisticData(null);
    }, []);
    
    return {
        data,
        isLoading,
        isError,
        error: error as Error | null,
        refetch: () => { refetch(); },
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        setFilters,
        clearFilters,
        activeFiltersCount,
        filteredData,
        selectedIds,
        setSelectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
        displayedData,
        displayCount,
        hasMore,
        loadMore,
        optimisticUpdate,
        optimisticDelete,
        optimisticBulkUpdate,
        rollback,
    };
}

// ===== ADMIN MUTATION HOOK =====

/**
 * Mutation hook with optimistic updates and automatic cache invalidation.
 * Use with useAdminData for a complete admin table solution.
 */
export function useAdminMutation<TData = void, TVariables = void>(
    options: IAdminMutationOptions<TData, TVariables>
) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: options.mutationFn,
        
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            if (options.invalidateKeys) {
                await Promise.all(options.invalidateKeys.map(key => 
                    queryClient.cancelQueries({ queryKey: key })
                ));
            }
            
            // Execute optimistic update
            if (options.onOptimisticUpdate) {
                return options.onOptimisticUpdate(variables);
            }
            return undefined;
        },
        
        onError: (error, variables, context) => {
            // Rollback
            if (options.onRollback && context !== undefined) {
                options.onRollback(context);
            }
            options.onError?.(error as Error, variables, context);
        },
        
        onSuccess: (data, variables) => {
            // Invalidate caches
            if (options.invalidateKeys) {
                options.invalidateKeys.forEach(key => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            options.onSuccess?.(data, variables);
        },
    });
}

// ===== HELPER: CREATE OPTIMISTIC MUTATION =====

/**
 * Create a mutation with automatic optimistic update and rollback for admin tables.
 */
export function createOptimisticMutation<T, TVariables>(
    queryKey: QueryKey,
    mutationFn: (variables: TVariables) => Promise<IApiResponse<unknown>>,
    getItemId: (variables: TVariables) => string,
    updateFn: (item: T, variables: TVariables) => T,
    options?: {
        isDelete?: boolean;
        invalidateKeys?: QueryKey[];
        onSuccess?: () => void;
        onError?: (error: Error) => void;
    }
) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn,
        
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData<T[]>(queryKey);
            
            if (previousData) {
                const id = getItemId(variables);
                const newData = options?.isDelete
                    ? previousData.filter((item: T) => (item as { slug?: string }).slug !== id)
                    : previousData.map((item: T) => {
                        const itemId = (item as { slug?: string }).slug ?? (item as { _id?: string })._id;
                        return itemId === id ? updateFn(item, variables) : item;
                    });
                queryClient.setQueryData(queryKey, newData);
            }
            
            return { previousData };
        },
        
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            options?.onError?.(_err as Error);
        },
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            options?.invalidateKeys?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
            options?.onSuccess?.();
        },
    });
}

// ===== ADMIN QUERY KEYS =====

export const ADMIN_QUERY_KEYS = {
    ARTICLES: ['admin', 'articles'] as const,
    NOTES: ['admin', 'notes'] as const,
    PROJECTS: ['admin', 'projects'] as const,
    TOPICS: ['admin', 'topics'] as const,
    SUBTOPICS: ['admin', 'subtopics'] as const,
    COMMENTS: ['admin', 'comments'] as const,
    MESSAGES: ['admin', 'messages'] as const,
    SUBSCRIBERS: ['admin', 'subscribers'] as const,
    MEDIA: ['admin', 'media'] as const,
    SETTINGS: ['admin', 'settings'] as const,
} as const;
