'use client';

// =============================================================
// useDataTable - Professional Table Hook with TanStack Query
// Follows project's server-action-first architecture
// =============================================================

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { useDebounce } from '@/hooks/table/useDebounce';
import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import {
    createTableFiltersAtom,
    createTablePageSizeAtom,
    createTableSearchAtom,
    createTableSelectedIdsAtom,
    createTableSortAtom,
} from '@/jotai/atoms';
import type {
    FilterValues,
    IColumnSort,
    ITableConfig,
    ITableContext,
    ITableState,
} from './types';

// =============================================================
// Types
// =============================================================

export interface IServerQueryParams {
    query?: string;
    pagination?: {
        offset: number;
        limit: number;
    };
    sort?: {
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    [key: string]: unknown;
}

export interface IUseDataTableOptions<TData> {
    config: ITableConfig<TData>;
    /** Static data (client-side only) */
    data?: TData[] | undefined;
    /** Server action for fetching paginated data */
    serverAction?: ((params: IServerQueryParams) => Promise<IPaginatedResponse<TData>>) | undefined;
    /** Initial data for SSR */
    initialData?: TData[] | undefined;
    /** Cache time in ms (default: 5 min) */
    staleTime?: number | undefined;
    /** GC time in ms (default: 10 min) */
    gcTime?: number | undefined;
}

// =============================================================
// Hook Implementation
// =============================================================

export function useDataTable<TData>(
    options: IUseDataTableOptions<TData>
): ITableContext<TData> {
    const { 
        config, 
        data: propData, 
        serverAction, 
        initialData, 
        staleTime = 5 * 60 * 1000,  // 5 minutes
        gcTime = 10 * 60 * 1000,     // 10 minutes
    } = options;
    
    const { tableKey, queryKey, keyExtractor, searchFields, searchFn, pagination, reorder, filters: filterConfigs } = config;

    const router = useRouter();
    const queryClient = useQueryClient();
    const [, startTransition] = useTransition();

    // Determine mode
    const isServerMode = !!serverAction;

    // =============================================================
    // Jotai Atoms for Persistent State
    // =============================================================

    const searchAtom = useMemo(() => createTableSearchAtom(tableKey), [tableKey]);
    const filtersAtom = useMemo(() => createTableFiltersAtom(tableKey), [tableKey]);
    const selectedIdsAtom = useMemo(() => createTableSelectedIdsAtom(tableKey), [tableKey]);
    const pageSizeAtom = useMemo(() => createTablePageSizeAtom(tableKey), [tableKey]);
    const sortAtom = useMemo(() => createTableSortAtom(tableKey), [tableKey]);

    const [searchQuery, setSearchQueryState] = useAtom(searchAtom);
    const [filters, setFiltersState] = useAtom(filtersAtom);
    const [selectedIds, setSelectedIdsState] = useAtom(selectedIdsAtom);
    const [pageSize, setPageSizeState] = useAtom(pageSizeAtom);
    const [sortState, setSortState] = useAtom(sortAtom);

    // =============================================================
    // Local State
    // =============================================================

    const [page, setPage] = useState(1);
    const [isReordering, setIsReordering] = useState(false);
    const [optimisticData, setOptimisticData] = useState<TData[] | null>(null);
    const [serverTotal, setServerTotal] = useState(initialData?.length ?? propData?.length ?? 0);

    // Debounce search for server queries (350ms)
    const debouncedSearchQuery = useDebounce(searchQuery, 350);

    // Initialize page size from config
    useEffect(() => {
        if (pagination?.pageSize && pageSize !== pagination.pageSize) {
            setPageSizeState(pagination.pageSize);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =============================================================
    // Build Server Query Params
    // =============================================================

    const serverQueryParams = useMemo((): IServerQueryParams => {
        const params: IServerQueryParams = {};

        // Search
        if (debouncedSearchQuery) {
            params.query = debouncedSearchQuery;
        }

        // Pagination
        if (pagination?.mode === 'server' || isServerMode) {
            params.pagination = {
                offset: (page - 1) * pageSize,
                limit: pageSize,
            };
        }

        // Sort
        if (sortState) {
            params.sort = {
                sortBy: sortState.sortBy,
                sortOrder: sortState.sortOrder,
            };
        }

        // Filters - convert to server format
        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === 'all') return;
            
            // Find filter config to check if it needs conversion
            const filterConfig = filterConfigs?.find(f => f.id === key);
            const serverKey = filterConfig?.serverKey ?? key;
            
            // Convert string booleans
            if (value === 'true') {
                params[serverKey] = true;
            } else if (value === 'false') {
                params[serverKey] = false;
            } else {
                params[serverKey] = value;
            }
        });

        return params;
    }, [debouncedSearchQuery, page, pageSize, sortState, filters, filterConfigs, pagination?.mode, isServerMode]);

    // =============================================================
    // Query Key with Params (for caching)
    // =============================================================

    const fullQueryKey = useMemo(() => {
        if (!isServerMode) return queryKey;
        return [...queryKey, serverQueryParams];
    }, [queryKey, serverQueryParams, isServerMode]);

    // =============================================================
    // Data Fetching with TanStack Query (server-action-first)
    // =============================================================

    const { 
        data: queryResult, 
        isLoading, 
        isError,
        isFetching,
    } = useQuery({
        queryKey: fullQueryKey,
        queryFn: async () => {
            if (!serverAction) {
                // Client mode - wrap data in paginated response
                return {
                    success: true as const,
                    status: 200 as const,
                    data: propData ?? [],
                    pagination: {
                        total: propData?.length ?? 0,
                        offset: 0,
                        limit: propData?.length ?? 0,
                        hasMore: false,
                    },
                };
            }
            // Server mode - call server action
            const response = await serverAction(serverQueryParams);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response;
        },
        initialData: initialData ? {
            success: true as const,
            status: 200 as const,
            data: initialData,
            pagination: {
                total: initialData.length,
                offset: 0,
                limit: initialData.length,
                hasMore: false,
            },
        } : undefined,
        enabled: isServerMode || !!propData,
        staleTime,
        gcTime,
        placeholderData: keepPreviousData,
    });

    // Extract data and pagination from query result
    const serverData = queryResult?.data ?? [];
    const data = optimisticData ?? serverData;

    // Update server total when query result changes
    useEffect(() => {
        if (queryResult?.pagination?.total !== undefined) {
            setServerTotal(queryResult.pagination.total);
        }
    }, [queryResult?.pagination?.total]);

    // Reset optimistic data when server data changes
    useEffect(() => {
        setOptimisticData(null);
    }, [serverData]);

    // =============================================================
    // Sort Conversion
    // =============================================================

    const sort: IColumnSort | null = sortState
        ? { id: sortState.sortBy, direction: sortState.sortOrder }
        : null;

    const setSort = useCallback((newSort: IColumnSort | null) => {
        if (newSort) {
            setSortState({ sortBy: newSort.id, sortOrder: newSort.direction });
        } else {
            setSortState(null);
        }
        setPage(1);
    }, [setSortState]);

    const toggleSort = useCallback((columnId: string) => {
        if (sort?.id === columnId) {
            if (sort.direction === 'asc') {
                setSort({ id: columnId, direction: 'desc' });
            } else {
                setSort(null);
            }
        } else {
            setSort({ id: columnId, direction: 'asc' });
        }
    }, [sort, setSort]);

    // =============================================================
    // Search & Filter
    // =============================================================

    const setSearchQuery = useCallback((query: string) => {
        setSearchQueryState(query);
        setPage(1);
    }, [setSearchQueryState]);

    const setFilter = useCallback((key: string, value: string | string[] | undefined) => {
        setFiltersState({ ...filters, [key]: value as string });
        setPage(1);
    }, [filters, setFiltersState]);

    const setFilters = useCallback((newFilters: FilterValues) => {
        setFiltersState(newFilters as Record<string, string>);
        setPage(1);
    }, [setFiltersState]);

    const clearFilters = useCallback(() => {
        setFiltersState({});
        setSearchQueryState('');
        setPage(1);
    }, [setFiltersState, setSearchQueryState]);

    const activeFiltersCount = useMemo(() => 
        Object.values(filters).filter(v => v && v !== '' && v !== 'all').length,
        [filters]
    );

    // =============================================================
    // Client-Side Filter & Sort (only for client mode)
    // =============================================================

    const filteredData = useMemo(() => {
        // In server mode, data is already filtered by server
        if (isServerMode) return data;

        let result = [...data];

        // Search (client-side)
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(item => {
                if (searchFn) return searchFn(item, query);
                return (searchFields ?? []).some(field => {
                    const value = item[field];
                    if (typeof value === 'string') return value.toLowerCase().includes(query);
                    if (Array.isArray(value)) return value.some(v => String(v).toLowerCase().includes(query));
                    return false;
                });
            });
        }

        // Filters (client-side)
        Object.entries(filters).forEach(([key, value]) => {
            if (!value || value === '' || value === 'all') return;
            result = result.filter(item => {
                const itemValue = (item as Record<string, unknown>)[key];
                if (typeof itemValue === 'boolean') return String(itemValue) === value;
                return itemValue === value;
            });
        });

        // Sort (client-side)
        if (sort) {
            result.sort((a, b) => {
                const column = config.columns.find(col => col.id === sort.id);
                const sortKey = column?.sortKey ?? sort.id;
                const aVal = (a as Record<string, unknown>)[sortKey];
                const bVal = (b as Record<string, unknown>)[sortKey];

                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                let comparison = 0;
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    comparison = aVal.localeCompare(bVal);
                } else if (aVal instanceof Date && bVal instanceof Date) {
                    comparison = aVal.getTime() - bVal.getTime();
                } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return sort.direction === 'desc' ? -comparison : comparison;
            });
        }

        return result;
    }, [data, debouncedSearchQuery, filters, sort, searchFields, searchFn, config.columns, isServerMode]);

    // =============================================================
    // Pagination
    // =============================================================

    const totalItems = isServerMode ? serverTotal : filteredData.length;

    const displayedData = useMemo(() => {
        // Server mode - data is already paginated
        if (isServerMode) return data;

        // Client mode pagination
        if (pagination?.mode === 'none') return filteredData;
        if (pagination?.mode === 'infinite') {
            return filteredData.slice(0, page * pageSize);
        }
        // Client pagination
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, data, page, pageSize, pagination?.mode, isServerMode]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const hasMore = useMemo(() => {
        if (isServerMode) {
            return queryResult?.pagination?.hasMore ?? false;
        }
        if (pagination?.mode === 'infinite') {
            return displayedData.length < filteredData.length;
        }
        return page < totalPages;
    }, [isServerMode, queryResult?.pagination?.hasMore, pagination?.mode, displayedData.length, filteredData.length, page, totalPages]);

    const loadMore = useCallback(() => {
        if (hasMore) setPage(p => p + 1);
    }, [hasMore]);

    const setPageSize = useCallback((size: number) => {
        if (!Number.isFinite(size) || size <= 0) return;
        setPageSizeState(Math.trunc(size));
        setPage(1);
    }, [setPageSizeState]);

    // =============================================================
    // Selection
    // =============================================================

    const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

    const toggleSelection = useCallback((id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        setSelectedIdsState(newSelection);
    }, [selectedIds, setSelectedIdsState]);

    const toggleSelectAll = useCallback(() => {
        const currentPageIds = displayedData.map(keyExtractor);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            // Deselect current page items
            setSelectedIdsState(selectedIds.filter(id => !currentPageIds.includes(id)));
        } else {
            // Select current page items (add to existing selection)
            const newSelection = [...new Set([...selectedIds, ...currentPageIds])];
            setSelectedIdsState(newSelection);
        }
    }, [displayedData, selectedIds, keyExtractor, setSelectedIdsState]);

    const clearSelection = useCallback(() => {
        setSelectedIdsState([]);
    }, [setSelectedIdsState]);

    const isAllSelected = useMemo(() => {
        if (displayedData.length === 0) return false;
        return displayedData.every(row => selectedIds.includes(keyExtractor(row)));
    }, [displayedData, selectedIds, keyExtractor]);

    const isSomeSelected = useMemo(() => {
        if (displayedData.length === 0) return false;
        const someSelected = displayedData.some(row => selectedIds.includes(keyExtractor(row)));
        return someSelected && !isAllSelected;
    }, [displayedData, selectedIds, keyExtractor, isAllSelected]);

    const selectedRows = useMemo(() => 
        data.filter(row => selectedIds.includes(keyExtractor(row))),
        [data, selectedIds, keyExtractor]
    );

    // =============================================================
    // Reorder
    // =============================================================

    const moveUp = useCallback(async (id: string) => {
        if (!reorder?.enabled || isReordering) return;

        const currentIndex = data.findIndex(item => keyExtractor(item) === id);
        if (currentIndex <= 0) return;

        setIsReordering(true);
        const newData = [...data];
        [newData[currentIndex - 1], newData[currentIndex]] = [newData[currentIndex], newData[currentIndex - 1]];
        
        setOptimisticData(newData);
        
        try {
            const ids = newData.map(keyExtractor);
            await reorder.onReorder(newData, ids);
            // Invalidate cache to refetch
            queryClient.invalidateQueries({ queryKey });
            startTransition(() => router.refresh());
        } catch {
            setOptimisticData(null);
        } finally {
            setIsReordering(false);
        }
    }, [data, keyExtractor, reorder, isReordering, router, queryClient, queryKey]);

    const moveDown = useCallback(async (id: string) => {
        if (!reorder?.enabled || isReordering) return;

        const currentIndex = data.findIndex(item => keyExtractor(item) === id);
        if (currentIndex < 0 || currentIndex >= data.length - 1) return;

        setIsReordering(true);
        const newData = [...data];
        [newData[currentIndex], newData[currentIndex + 1]] = [newData[currentIndex + 1], newData[currentIndex]];
        
        setOptimisticData(newData);
        
        try {
            const ids = newData.map(keyExtractor);
            await reorder.onReorder(newData, ids);
            queryClient.invalidateQueries({ queryKey });
            startTransition(() => router.refresh());
        } catch {
            setOptimisticData(null);
        } finally {
            setIsReordering(false);
        }
    }, [data, keyExtractor, reorder, isReordering, router, queryClient, queryKey]);

    const reorderItems = useCallback(async (fromIndex: number, toIndex: number) => {
        if (!reorder?.enabled || isReordering || fromIndex === toIndex) return;

        setIsReordering(true);
        const newData = [...data];
        const [removed] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, removed);
        
        setOptimisticData(newData);
        
        try {
            const ids = newData.map(keyExtractor);
            await reorder.onReorder(newData, ids);
            queryClient.invalidateQueries({ queryKey });
            startTransition(() => router.refresh());
        } catch {
            setOptimisticData(null);
        } finally {
            setIsReordering(false);
        }
    }, [data, keyExtractor, reorder, isReordering, router, queryClient, queryKey]);

    // =============================================================
    // Actions
    // =============================================================

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
        startTransition(() => router.refresh());
    }, [queryClient, queryKey, router]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]);

    // =============================================================
    // Build State Object
    // =============================================================

    const state: ITableState = {
        searchQuery,
        filters,
        sort,
        selectedIds,
        page,
        pageSize,
    };

    // =============================================================
    // Return Context
    // =============================================================

    return {
        config,
        data,
        filteredData: isServerMode ? data : filteredData,
        displayedData,
        isLoading: isLoading || isFetching,
        isError,
        state,
        setSearchQuery,
        setFilter,
        setFilters,
        clearFilters,
        activeFiltersCount,
        setSort,
        toggleSort,
        toggleSelection,
        toggleSelectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        isSomeSelected,
        selectedRows,
        setPage,
        setPageSize,
        hasMore,
        loadMore,
        moveUp,
        moveDown,
        reorder: reorderItems,
        isReordering,
        refresh,
        invalidate,
    };
}

export default useDataTable;
