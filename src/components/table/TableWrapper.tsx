'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { type DehydratedState, HydrationBoundary, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import CustomTable, { type ICustomTableProps } from '@/common/components/table/table/CustomTable';
import { REACT_QUERY_CONFIG } from '@/common/constants/reactQueryConstants';
import { type IFormData } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { type StrongOmit } from '@/common/interfaces/genericInterfaces';
import { tableQueryAtom } from '@/common/jotai/atoms';
import { getTableData, type ITableQuery } from '@/common/server/actions/common';
import { tableQueryKeys } from '@/common/utils/queryClient';

import { type ApiUrl } from '@/exclusive/interfaces/commonInterface';

export type TableMutateData<_TTableResponse extends IFormData> = () => Promise<void>;
interface ITableWrapperProps<TTableResponse extends IFormData, TTableFilterBody extends IFormData | undefined> extends StrongOmit<ICustomTableProps<TTableResponse, TTableFilterBody>, 'rows' | 'count' | 'mutateData' | 'error'> {
    dataEndpoint: ApiUrl;
    dehydratedState?: DehydratedState;
    enableFiltersWithSearch?: boolean;
}

export const buildQueryParams = <TTableFilterBody extends IFormData>(query: ITableQuery<TTableFilterBody, false>, pathname: string, includeFilters = true): string | undefined => {
    try {
        if (!query) return undefined;
        const params = new URLSearchParams();

        if (query.search) params.append('search', query.search);
        if (query.offset !== undefined) params.append('offset', query.offset.toString());
        if (query.limit) params.append('limit', query.limit.toString());
        TypedObject.entries(query.sort).slice(0, 1).forEach(([k, v]) => params.append(k, String(v)));
        if (includeFilters && query?.filter) {
            const filterData = query.filter[pathname] ?? query.filter;
            TypedObject.entries(filterData).forEach(([key, value]) => {
                const keyStr = String(key);
                if (keyStr.endsWith('Date') && typeof value === 'object' && value !== null && ('startingDate' in value || 'endingDate' in value)) {
                    const dateValue = value as { startingDate?: unknown; endingDate?: unknown };
                    if ('startingDate' in dateValue && dateValue.startingDate) params.append(`${keyStr}.start`, String(dateValue.startingDate));
                    if ('endingDate' in dateValue && dateValue.endingDate) params.append(`${keyStr}.end`, String(dateValue.endingDate));
                } else if (value !== undefined && value !== null) params.append(String(key), String(value));
            });
        }
        return params.toString();
    } catch (error) {
        return void console.error('Error building query parameters:', error);
    }
};

const TableWrapper = <TTableResponse extends object, TTableFilterBody extends IFormData | undefined>({ title, subText, columnsStructure, dataEndpoint, defaultFilter, searchLabel, filtersStructure, tableOperationsStructure, tableTabStructure, dehydratedState, enableFiltersWithSearch = false }: ITableWrapperProps<TTableResponse, TTableFilterBody>) => {
    const queryClient = useQueryClient();
    const [tableQuery, setTableQuery] = useAtom<ITableQuery<IFormData>>(tableQueryAtom);
    const { currentPathname, updateFilterFormDataForPage } = usePageFilterFormData();

    const prevSearchRef = useRef<string>('');
    const prevFiltersRef = useRef<IFormData>({});
    const prevPathnameRef = useRef<string>(currentPathname);

    // Get current page's search value
    const currentSearchValue = useMemo(() => tableQuery.search?.[currentPathname] ?? '', [tableQuery.search, currentPathname]);
    const hasSearchQuery = useMemo(() => Boolean(currentSearchValue.length), [currentSearchValue]);
    const currentPageFilter = useMemo(() => tableQuery.filter?.[currentPathname], [tableQuery.filter, currentPathname]);
    const isCurrentPageFilterEmpty = useMemo(() => isInvalidAndEmptyObject(currentPageFilter), [currentPageFilter]);

    // Determine effective filter: search clears filters (unless enableFiltersWithSearch is true), otherwise use page filter or default
    const effectiveFilter = useMemo(() => {
        if (hasSearchQuery && !enableFiltersWithSearch) return undefined;
        if (currentPageFilter && !isCurrentPageFilterEmpty) return currentPageFilter;
        return defaultFilter;
    }, [hasSearchQuery, enableFiltersWithSearch, currentPageFilter, isCurrentPageFilterEmpty, defaultFilter]);

    // Wrap filter in pathname key for cache isolation
    const filterForQuery = useMemo<Record<string, IFormData> | undefined>(() => effectiveFilter ? { [currentPathname]: effectiveFilter } : undefined, [effectiveFilter, currentPathname]);

    // Build query key data (excludes 'count' to prevent re-renders on count updates)
    const queryKeyData = useMemo<ITableQuery<IFormData, false>>(() => ({
        offset: tableQuery.offset,
        limit: tableQuery.limit,
        search: currentSearchValue || undefined,
        filter: filterForQuery,
        ...(tableQuery.sort && !isInvalidAndEmptyObject(tableQuery.sort) && { sort: tableQuery.sort })
    }), [tableQuery.offset, tableQuery.limit, currentSearchValue, tableQuery.sort, filterForQuery]);

    const queryKey = useMemo(() => tableQueryKeys.list(dataEndpoint, queryKeyData), [dataEndpoint, queryKeyData]);

    // Data fetching with React Query
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey,
        queryFn: async () => getTableData<TTableResponse, IFormData>(dataEndpoint, {
            ...queryKeyData,
            search: currentSearchValue ? { [currentPathname]: currentSearchValue } : {}
        }),
        staleTime: REACT_QUERY_CONFIG.tableStaleTime,
        gcTime: REACT_QUERY_CONFIG.tableGcTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false
    });

    // Mutate function for manual refresh
    const mutate = useCallback(async () => { await queryClient.invalidateQueries({ queryKey }); }, [queryClient, queryKey]);

    // Handle pathname changes - reset pagination only (search is now page-specific)
    useEffect(() => {
        if (prevPathnameRef.current === currentPathname) return;

        prevPathnameRef.current = currentPathname;
        prevFiltersRef.current = {};

        // Reset pagination on page change
        setTableQuery(prev => ({ ...prev, offset: 0 }));
    }, [currentPathname, setTableQuery]);

    // Initialize default filter for page
    useEffect(() => {
        if ((hasSearchQuery && !enableFiltersWithSearch) || !defaultFilter) return;

        const pageFilter = tableQuery.filter?.[currentPathname];
        if (!pageFilter || isInvalidAndEmptyObject(pageFilter)) {
            setTableQuery(prev => ({ ...prev, filter: { ...prev.filter, [currentPathname]: defaultFilter } }));
            updateFilterFormDataForPage(defaultFilter);
        }
    }, [currentPathname, hasSearchQuery, enableFiltersWithSearch, defaultFilter, tableQuery.filter, setTableQuery, updateFilterFormDataForPage]);

    // Sync count from API and handle search state transitions
    useEffect(() => {
        const count = data?.metadata?.count ?? 0;
        if (count !== tableQuery.count) setTableQuery(prev => ({ ...prev, count }));
    }, [data?.metadata?.count, tableQuery.count, setTableQuery]);

    // Handle search transitions (save/restore filters) - use current page's search value
    // Skip filter clearing/restoring when enableFiltersWithSearch is true
    useEffect(() => {
        const prevSearch = prevSearchRef.current;
        if (prevSearch === currentSearchValue) return;

        const wasSearching = Boolean(prevSearch.length);
        const isSearching = Boolean(currentSearchValue.length);

        if (!enableFiltersWithSearch) {
            if (!wasSearching && isSearching) {
                prevFiltersRef.current = currentPageFilter ?? {};
                setTableQuery(prev => ({ ...prev, filter: { ...prev.filter, [currentPathname]: {} } }));
                updateFilterFormDataForPage({});
            }

            if (wasSearching && !isSearching) {
                const restoreFilter = prevFiltersRef.current;
                setTableQuery(prev => ({ ...prev, filter: { ...prev.filter, [currentPathname]: restoreFilter } }));
                updateFilterFormDataForPage(restoreFilter);
            }
        }

        prevSearchRef.current = currentSearchValue;
    }, [currentSearchValue, currentPageFilter, currentPathname, setTableQuery, updateFilterFormDataForPage, enableFiltersWithSearch]);

    const tableContent = (
        <CustomTable
            key={currentPathname}
            title={title}
            subText={subText}
            columnsStructure={columnsStructure}
            rows={data?.data}
            count={data?.metadata?.count}
            mutateData={mutate}
            loading={isLoading}
            revalidating={isFetching}
            searchLabel={searchLabel}
            defaultFilter={defaultFilter}
            filtersStructure={filtersStructure}
            tableOperationsStructure={tableOperationsStructure}
            tableTabStructure={tableTabStructure}
            error={!!error}
            enableFiltersWithSearch={enableFiltersWithSearch}
        />
    );

    if (dehydratedState) return <HydrationBoundary state={dehydratedState}>{tableContent}</HydrationBoundary>;
    return tableContent;
};

export default TableWrapper;
