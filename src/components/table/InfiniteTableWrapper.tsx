'use client';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { type DehydratedState, HydrationBoundary, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { REACT_QUERY_CONFIG } from '@/common/constants/reactQueryConstants';
import { type IFormData } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { type StrongOmit } from '@/common/interfaces/genericInterfaces';
import { tableQueryAtom } from '@/common/jotai/atoms';
import { getTableData, type ITableQuery } from '@/common/server/actions/common';
import { tableQueryKeys } from '@/common/utils/queryClient';

import { type ApiUrl } from '@/exclusive/interfaces/commonInterface';

import NoData from '../other/NoData';

import InfiniteTable, { type IInfiniteTableProps } from './infiniteScrollCardTable/InfiniteTable';

const INFINITE_TABLE_LIMIT = REACT_QUERY_CONFIG.infinitePageSize;
const OBSERVER_OPTIONS = REACT_QUERY_CONFIG.observerOptions;

export type InfiniteTableMutateData<_TInfiniteTableResponse extends IFormData> = () => Promise<void>;

interface IInfiniteTableWrapperProps<TInfiniteTableResponse extends IFormData, TInfiniteTableFilterBody extends IFormData | undefined> extends StrongOmit<IInfiniteTableProps<TInfiniteTableResponse, TInfiniteTableFilterBody>, 'tableData' | 'limit' | 'mutateData' | 'isValidating' | 'resetPagination'> {
    dataEndpoint: ApiUrl;
    className?: string;
    noDataMessage?: string;
    dehydratedState?: DehydratedState;
}

const InfiniteTableWrapper = <TInfiniteTableResponse extends IFormData, TInfiniteTableFilterBody extends IFormData | undefined>({ dataEndpoint, defaultFilter, searchLabel, filtersStructure, tableOperationsStructure, className, cardsPerRow, noDataMessage = 'There are no records to display at this time', dehydratedState, ...props }: IInfiniteTableWrapperProps<TInfiniteTableResponse, TInfiniteTableFilterBody>) => {
    const queryClient = useQueryClient();
    const [tableQuery, setTableQuery] = useAtom<ITableQuery<IFormData>>(tableQueryAtom);
    const { currentPathname, updateFilterFormDataForPage } = usePageFilterFormData();
    const observerRef = useRef<HTMLDivElement | null>(null);
    const prevPathnameRef = useRef<string>(currentPathname);

    // Consolidated memoized computed values
    const { hasSearchQuery, currentSearchValue, filterForFetcher, currentPageFilter, isCurrentPageFilterEmpty } = useMemo(() => {
        const searchValue = tableQuery.search?.[currentPathname] ?? '';
        const hasSearch = Boolean(searchValue.length);
        const pageFilter = tableQuery?.filter?.[currentPathname];
        const isFilterEmpty = isInvalidAndEmptyObject(pageFilter);
        // Wrap filter in pathname key for getTableData (it expects { [key]: filterObject } and unwraps with TypedObject.values(filter)[0])
        const wrappedFilter: Record<string, IFormData> | undefined = hasSearch || isFilterEmpty ? undefined : { [currentPathname]: pageFilter! };

        return {
            hasSearchQuery: hasSearch,
            currentSearchValue: searchValue,
            filterForFetcher: wrappedFilter,
            currentPageFilter: pageFilter,
            isCurrentPageFilterEmpty: isFilterEmpty
        };
    }, [tableQuery.search, tableQuery.filter, currentPathname]);

    // Build clean query for React Query key - exclude empty sort object
    const queryForKey = useMemo<ITableQuery<IFormData, false>>(() => ({
        offset: tableQuery.offset,
        limit: INFINITE_TABLE_LIMIT,
        filter: filterForFetcher,
        search: currentSearchValue || undefined,
        ...(tableQuery.sort && !isInvalidAndEmptyObject(tableQuery.sort) && { sort: tableQuery.sort })
    }), [tableQuery.offset, tableQuery.sort, filterForFetcher, currentSearchValue]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
        queryKey: tableQueryKeys.infiniteList(dataEndpoint, queryForKey),
        queryFn: async ({ pageParam = 0 }) => getTableData<TInfiniteTableResponse, IFormData>(dataEndpoint, {
            ...queryForKey,
            offset: pageParam * INFINITE_TABLE_LIMIT,
            search: currentSearchValue ? { [currentPathname]: currentSearchValue } : {}
        }),
        getNextPageParam: (lastPage, allPages) => {
            const totalLoaded = allPages.flatMap(page => page.data ?? []).length;
            const totalCount = lastPage.metadata?.count ?? totalLoaded;
            return totalLoaded < totalCount ? allPages.length : undefined;
        },
        initialPageParam: 0,
        refetchOnWindowFocus: false,
        staleTime: REACT_QUERY_CONFIG.infiniteQueryStaleTime,
        enabled: !(defaultFilter && isCurrentPageFilterEmpty && !hasSearchQuery)
    });

    // Consolidated effect for page management - handles pagination reset and default filter initialization
    useLayoutEffect(() => {
        const prevPathname = prevPathnameRef.current;
        const isPageChange = prevPathname && prevPathname !== currentPathname;
        const isMount = !prevPathname;

        const initializePageState = async () => {
            // Reset pagination on page change or mount (search is already page-specific, no need to clear)
            if (isPageChange || isMount) {
                setTableQuery(prev => ({ ...prev, offset: 0 }));
                await queryClient.resetQueries({ queryKey: tableQueryKeys.infiniteList(dataEndpoint, queryForKey) });
            }

            // Initialize default filters when page loads (only if no search and default filter exists)
            if (defaultFilter && !hasSearchQuery && (!currentPageFilter || isCurrentPageFilterEmpty)) {
                setTableQuery(prev => ({ ...prev, filter: { ...prev.filter, [currentPathname]: defaultFilter } }));
                updateFilterFormDataForPage(defaultFilter);
            }

            // Always update the ref with current pathname
            prevPathnameRef.current = currentPathname;
        };

        void initializePageState();
    }, [currentPathname, defaultFilter, hasSearchQuery, currentPageFilter, isCurrentPageFilterEmpty, setTableQuery, updateFilterFormDataForPage, queryClient, dataEndpoint, queryForKey]);

    // Memoized callbacks to prevent unnecessary re-renders
    const resetPagination = useCallback(async () => {
        await queryClient.resetQueries({ queryKey: tableQueryKeys.infiniteList(dataEndpoint, queryForKey) });
    }, [queryClient, dataEndpoint, queryForKey]);

    const mutate = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: tableQueryKeys.infiniteList(dataEndpoint, queryForKey) });
    }, [queryClient, dataEndpoint, queryForKey]);

    // Memoized data processing for better performance
    const { flattenedData, totalCount, currentLoaded, hasMore, isError } = useMemo(() => {
        const flattened = (data?.pages.flatMap(page => page?.data ?? []) ?? []).filter((item): item is TInfiniteTableResponse => Boolean(item));
        const count = data?.pages[0]?.metadata?.count ?? 0;
        const loaded = flattened.length;
        const more = loaded < count;
        const error = data?.pages.some(page => page?.error) ?? false;

        return { flattenedData: flattened, totalCount: count, currentLoaded: loaded, hasMore: more, isError: error };
    }, [data]);

    // Consolidated observer effect with inline callback
    useEffect(() => {
        const currentRef = observerRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(async (entries) => {
            const [entry] = entries;
            if (entry?.isIntersecting && !isFetchingNextPage && hasNextPage) await fetchNextPage();
        }, OBSERVER_OPTIONS);

        observer.observe(currentRef);
        return () => { observer.unobserve(currentRef); observer.disconnect(); };
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const tableContent = (
        <div className={`flex flex-col justify-between h-full gap-3 ${className}`}>
            <InfiniteTable
                limit={INFINITE_TABLE_LIMIT}
                tableData={flattenedData}
                mutateData={mutate}
                searchLabel={searchLabel}
                filtersStructure={filtersStructure}
                tableOperationsStructure={tableOperationsStructure}
                defaultFilter={defaultFilter}
                cardsPerRow={cardsPerRow}
                isValidating={isFetching}
                resetPagination={resetPagination}
                {...props}
            />

            <div ref={observerRef} className="flex justify-center size-full">
                {Boolean(!isFetching && !hasMore && !flattenedData?.length && !isError) && <NoData title="You're All Caught Up" description={noDataMessage} className='bg-white border rounded-md w-full' />}
                {Boolean(isError && !isFetching) && <NoData mode='error' title='Oops, an error occurred!' description="We're experiencing a temporary hiccup. Please try again after some time." className='bg-white border rounded-md w-full' />}
            </div>

            <div className="text-xs text-neutral-light p-2 bg-muted-foreground rounded">
                Loaded: {currentLoaded} of {totalCount} ({Math.round((currentLoaded / totalCount) * 100 || 0)}%)
                {hasMore ? ' - Scroll to load more' : ' - All items loaded'}
            </div>
        </div>
    );

    if (dehydratedState) return <HydrationBoundary state={dehydratedState}>{tableContent}</HydrationBoundary>;
    return tableContent;
};

export default React.memo(InfiniteTableWrapper) as typeof InfiniteTableWrapper;
