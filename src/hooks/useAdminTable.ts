'use client';

import { useState, useMemo, useCallback, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ===== TYPES =====

export interface IUseAdminTableOptions<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    searchFields?: (keyof T)[];
    searchFn?: (item: T, query: string) => boolean;
}

export interface IUseAdminTableReturn<T> {
    // Data
    items: T[];
    filteredItems: T[];
    displayedItems: T[];
    
    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    // Filters
    filters: Record<string, string>;
    setFilter: (key: string, value: string) => void;
    setFilters: (filters: Record<string, string>) => void;
    clearFilters: () => void;
    activeFiltersCount: number;
    
    // Selection
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    
    // Pagination / Infinite scroll
    displayCount: number;
    hasMore: boolean;
    loadMore: () => void;
    
    // Optimistic updates (skipRefresh parameter allows skipping router.refresh() for better UX)
    optimisticUpdate: <R>(
        id: string,
        updateFn: (item: T) => T,
        serverAction: () => Promise<R>,
        skipRefresh?: boolean
    ) => Promise<R>;
    optimisticDelete: <R>(
        id: string,
        serverAction: () => Promise<R>,
        skipRefresh?: boolean
    ) => Promise<R>;
    optimisticBulkUpdate: <R>(
        ids: string[],
        updateFn: (item: T) => T,
        serverAction: () => Promise<R>,
        skipRefresh?: boolean
    ) => Promise<R>;
    
    // State
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    refresh: () => void;
}

const ITEMS_PER_PAGE = 15;

// ===== HOOK =====

export function useAdminTable<T>({
    data,
    keyExtractor,
    searchFields = [],
    searchFn,
}: IUseAdminTableOptions<T>): IUseAdminTableReturn<T> {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // Local state for optimistic updates
    const [items, setItems] = useState<T[]>(data);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFiltersState] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // Track the previous data prop to detect actual server data changes
    const prevDataRef = useRef<T[]>(data);
    
    // Sync with server data only when prop reference actually changes
    useEffect(() => {
        if (prevDataRef.current !== data) {
            prevDataRef.current = data;
            setItems(data);
        }
    }, [data]);

    // ===== SEARCH & FILTER =====

    const filteredItems = useMemo(() => {
        let result = [...items];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item) => {
                if (searchFn) return searchFn(item, query);
                return searchFields.some((field) => {
                    const value = item[field];
                    if (typeof value === 'string') return value.toLowerCase().includes(query);
                    if (Array.isArray(value)) return value.some((v) => String(v).toLowerCase().includes(query));
                    return false;
                });
            });
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (!value || value === 'all') return;
            result = result.filter((item) => {
                const itemValue = (item as Record<string, unknown>)[key];
                if (typeof itemValue === 'boolean') return String(itemValue) === value;
                return itemValue === value;
            });
        });

        return result;
    }, [items, searchQuery, filters, searchFields, searchFn]);

    const displayedItems = useMemo(() => 
        filteredItems.slice(0, displayCount), 
        [filteredItems, displayCount]
    );

    const hasMore = displayedItems.length < filteredItems.length;

    // ===== FILTERS =====

    const setFilter = useCallback((key: string, value: string) => {
        setFiltersState((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setFilters = useCallback((newFilters: Record<string, string>) => {
        setFiltersState(newFilters);
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState({});
        setSearchQuery('');
    }, []);

    const activeFiltersCount = useMemo(() => 
        Object.values(filters).filter((v) => v && v !== 'all').length,
        [filters]
    );

    // ===== SELECTION =====

    const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => 
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(filteredItems.map(keyExtractor));
    }, [filteredItems, keyExtractor]);

    const clearSelection = useCallback(() => setSelectedIds([]), []);

    // ===== PAGINATION =====

    const loadMore = useCallback(() => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // ===== OPTIMISTIC UPDATES =====
    // Note: These methods perform optimistic updates and optionally refresh from server.
    // The refresh is wrapped in startTransition to keep the UI responsive.
    // For most CRUD operations, the optimistic state is sufficient and refresh
    // is mainly for ensuring eventual consistency.

    const optimisticUpdate = useCallback(async <R,>(
        id: string,
        updateFn: (item: T) => T,
        serverAction: () => Promise<R>,
        skipRefresh = false
    ): Promise<R> => {
        // Optimistically update local state
        setItems((prev) => prev.map((item) => 
            keyExtractor(item) === id ? updateFn(item) : item
        ));

        try {
            const result = await serverAction();
            // Only refresh if not skipped - optimistic state is often sufficient
            if (!skipRefresh) {
                startTransition(() => router.refresh());
            }
            return result;
        } catch (error) {
            // Revert on error
            setItems(data);
            throw error;
        }
    }, [data, keyExtractor, router]);

    const optimisticDelete = useCallback(async <R,>(
        id: string,
        serverAction: () => Promise<R>,
        skipRefresh = false
    ): Promise<R> => {
        // Optimistically remove from local state
        const previousItems = items;
        setItems((prev) => prev.filter((item) => keyExtractor(item) !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));

        try {
            const result = await serverAction();
            if (!skipRefresh) {
                startTransition(() => router.refresh());
            }
            return result;
        } catch (error) {
            // Revert on error
            setItems(previousItems);
            throw error;
        }
    }, [items, keyExtractor, router]);

    const optimisticBulkUpdate = useCallback(async <R,>(
        ids: string[],
        updateFn: (item: T) => T,
        serverAction: () => Promise<R>,
        skipRefresh = false
    ): Promise<R> => {
        const idSet = new Set(ids);
        setItems((prev) => prev.map((item) => 
            idSet.has(keyExtractor(item)) ? updateFn(item) : item
        ));

        try {
            const result = await serverAction();
            if (!skipRefresh) {
                startTransition(() => router.refresh());
            }
            clearSelection();
            return result;
        } catch (error) {
            setItems(data);
            throw error;
        }
    }, [data, keyExtractor, router, clearSelection]);

    const refresh = useCallback(() => {
        startTransition(() => router.refresh());
    }, [router]);

    return {
        items,
        filteredItems,
        displayedItems,
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        setFilters,
        clearFilters,
        activeFiltersCount,
        selectedIds,
        setSelectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
        displayCount,
        hasMore,
        loadMore,
        optimisticUpdate,
        optimisticDelete,
        optimisticBulkUpdate,
        isPending,
        startTransition,
        refresh,
    };
}
