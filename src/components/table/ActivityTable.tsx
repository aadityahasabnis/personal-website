'use client';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { cloneDeep, get, set } from 'lodash';
import { ChevronLeft, ChevronRight, FilterX } from 'lucide-react';

import ActivityCard, { type IActivityCardConfig } from '@/common/components/cards/ActivityCard';
import { type IInputFieldConfigUnion, renderField } from '@/common/components/form/FormWrapper';
import NoData from '@/common/components/other/NoData';
import TableOperations, { type ITableOperationsStructure } from '@/common/components/table/operations/TableOperations';
import { type TableMutateData } from '@/common/components/table/TableWrapper';
import { Button } from '@/common/components/ui/button';
import { REACT_QUERY_CONFIG } from '@/common/constants/reactQueryConstants';
import { getGroupedActivitiesByDate } from '@/common/helpers/dataHelpers';
import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import { type DotNestedDateKeys } from '@/common/interfaces/genericInterfaces';
import { activityTableQueryAtom } from '@/common/jotai/atoms';
import { getTableData, type ITableQuery } from '@/common/server/actions/common';
import { tableQueryKeys } from '@/common/utils/queryClient';

import { sectionsIconMap } from '@/exclusive/constants/media/icons';
import { type ApiUrl, type Sections } from '@/exclusive/interfaces/commonInterface';

import { IconWrapper } from '../other/IconWrapper';

export interface IActivityTableProps<TTableResponse extends IFormData = IFormData, TTableFilterBody extends IFormData = IFormData, TOperationBodyData extends IFormData = IFormData> {
    title: string;
    subText?: string;
    icon: Sections;
    dataEndpoint: ApiUrl;
    columnConfig: IActivityCardConfig<TTableResponse>;
    sortBy?: DotNestedDateKeys<TTableResponse>;
    sortFallback?: DotNestedDateKeys<TTableResponse>;
    defaultFilter?: TTableFilterBody;
    filtersStructure?: Array<IInputFieldConfigUnion<TTableFilterBody>> | ((filterData: TTableFilterBody) => Array<IInputFieldConfigUnion<TTableFilterBody>>);
    tableOperationsStructure?: Array<ITableOperationsStructure<TOperationBodyData>>;
    rowOperationsStructure?: (row: TTableResponse) => Array<ITableOperationsStructure<TTableResponse>> | undefined;
    limit?: number;
    emptyStateMessage?: string;
}

const ActivityTable = <TTableResponse extends IFormData = IFormData, TTableFilterBody extends IFormData = IFormData, TOperationBodyData extends IFormData = IFormData>({ title, subText, icon, dataEndpoint, sortBy, sortFallback, columnConfig, defaultFilter, filtersStructure, tableOperationsStructure, rowOperationsStructure, limit = 10, emptyStateMessage = "You're all caught up! no new activities." }: IActivityTableProps<TTableResponse, TTableFilterBody, TOperationBodyData>) => {
    const queryClient = useQueryClient();
    const tableRef = useRef<HTMLDivElement>(null);
    const [tableQuery, setTableQuery] = useAtom(activityTableQueryAtom);

    // Initialize default filter on mount
    useLayoutEffect(() => {
        if (defaultFilter) setTableQuery(prev => ({ ...prev, filter: defaultFilter, offset: 0 }));
    }, [defaultFilter, setTableQuery]);

    const filterData = (tableQuery.filter ?? {}) as TTableFilterBody;
    const cleanedFilter = useMemo(() => TypedObject.fromEntries(TypedObject.entries(filterData).filter(([, value]) => !isInvalidAndEmptyObject(value))), [filterData]);

    // Wrap filter in a key for getTableData (it expects { [key]: filterObject } and unwraps with TypedObject.values(filter)[0])
    const filterForQuery = useMemo<Record<string, IFormData> | undefined>(() => {
        if (isInvalidAndEmptyObject(cleanedFilter)) return undefined;
        return { activity: cleanedFilter };
    }, [cleanedFilter]);

    // Build query for React Query - include limit in query
    const queryForKey = useMemo<ITableQuery<IFormData>>(() => ({
        offset: tableQuery.offset ?? 0,
        limit,
        filter: filterForQuery,
        ...(tableQuery.sort && !isInvalidAndEmptyObject(tableQuery.sort) && { sort: tableQuery.sort })
    }), [tableQuery.offset, filterForQuery, tableQuery.sort, limit]);

    const queryKey = useMemo(() => tableQueryKeys.list(dataEndpoint, queryForKey), [dataEndpoint, queryForKey]);

    // Data fetching with React Query - use getTableData like TableWrapper
    const { data, isLoading, isFetching } = useQuery({
        queryKey,
        queryFn: async () => getTableData<TTableResponse>(dataEndpoint, queryForKey as ITableQuery<TTableResponse>),
        staleTime: REACT_QUERY_CONFIG.tableStaleTime,
        gcTime: REACT_QUERY_CONFIG.tableGcTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false
    });

    // Mutate function for manual refresh
    const mutate = useCallback(async () => { await queryClient.invalidateQueries({ queryKey }); }, [queryClient, queryKey]);

    const rows = data?.data;
    const count = data?.metadata?.count;
    const totalPages = Math.ceil((count ?? 0) / limit) || 0;
    const currentPage = Math.floor((tableQuery.offset || 0) / limit) + 1;

    // Sort rows based on sortBy key (optimized with early returns)
    const sortedRows = useMemo(() => {
        if (!rows || !Array.isArray(rows) || rows.length === 0) return rows;
        if (!sortBy) return rows;

        const isMail = columnConfig.type === 'mail';
        const isScheduleSort = isMail && 'scheduleAt' in columnConfig && sortBy === columnConfig.scheduleAt;
        const now = isScheduleSort ? new Date().getTime() : 0;

        return [...rows].sort((a, b) => {
            const aValue = get(a, sortBy) ?? (isScheduleSort && sortFallback ? get(a, sortFallback) : undefined);
            const bValue = get(b, sortBy) ?? (isScheduleSort && sortFallback ? get(b, sortFallback) : undefined);

            if (isScheduleSort) {
                const aTime = aValue ? new Date(aValue).getTime() : 0;
                const bTime = bValue ? new Date(bValue).getTime() : 0;
                const aIsScheduled = aTime > now;
                const bIsScheduled = bTime > now;

                if (aIsScheduled && bIsScheduled) return aTime - bTime;
                if (aIsScheduled) return -1;
                if (bIsScheduled) return 1;
            }

            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            return new Date(bValue).getTime() - new Date(aValue).getTime();
        });
    }, [rows, sortBy, sortFallback, columnConfig]);

    const groupedActivities = useMemo<Array<[string, Array<TTableResponse>]>>(() => {
        if (!Array.isArray(sortedRows)) return [];

        // For mail type with scheduleAt sorting, separate scheduled from others
        if (columnConfig.type === 'mail' && 'scheduleAt' in columnConfig && sortBy === columnConfig.scheduleAt) {
            const now = new Date();
            const scheduled: Array<TTableResponse> = [];
            const others: Array<TTableResponse> = [];

            // Single pass to separate scheduled vs others
            sortedRows.forEach(row => {
                const scheduledAtValue = columnConfig.scheduleAt ? get(row, columnConfig.scheduleAt) : undefined;
                (scheduledAtValue && new Date(scheduledAtValue) > now ? scheduled : others).push(row);
            });

            // Group by effective date (scheduleAt if exists, else createdAt - matching MailCard pattern)
            const getDateKey = (row: TTableResponse): string => (columnConfig.scheduleAt && get(row, columnConfig.scheduleAt) ? columnConfig.scheduleAt : columnConfig.createdAt);
            const groups = TypedObject.entries(getGroupedActivitiesByDate(others, columnConfig.createdAt, getDateKey));
            return scheduled.length ? [['Scheduled', scheduled], ...groups] : groups;
        }

        return TypedObject.entries(getGroupedActivitiesByDate(sortedRows, columnConfig.createdAt));
    }, [sortedRows, sortBy, columnConfig]);

    // Pre-sorted date groups (memoized to avoid re-sorting on every render)
    const sortedDateGroups = useMemo(() => [...groupedActivities].sort(([dateA], [dateB]) => {
        // Sort order: Scheduled > Today > Yesterday > Other dates (newest first)
        if (dateA === 'Scheduled') return -1;
        if (dateB === 'Scheduled') return 1;
        if (dateA === 'Today') return -1;
        if (dateB === 'Today') return 1;
        if (dateA === 'Yesterday') return -1;
        if (dateB === 'Yesterday') return 1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    }), [groupedActivities]);

    const hasActiveFilters = useMemo(() => TypedObject.keys(cleanedFilter).some(key => cleanedFilter[key] !== defaultFilter?.[key]), [cleanedFilter, defaultFilter]);
    const filterFields = typeof filtersStructure === 'function' ? filtersStructure(filterData) : filtersStructure;

    const handleFilterChange: IHandleChange = useCallback((e) => {
        const { name, value } = e.target;
        setTableQuery(prev => {
            const currentValue = get(prev.filter, name);
            if (currentValue === value) return prev;
            const updatedFilter = cloneDeep(prev.filter) ?? {};
            set(updatedFilter, name, value);
            return { ...prev, offset: 0, filter: updatedFilter };
        });
    }, [setTableQuery]);

    const handleClearFilters = useCallback(() => setTableQuery(prev => ({ ...prev, offset: 0, filter: {} })), [setTableQuery]);

    const handlePageChange = useCallback((direction: 'next' | 'prev') => {
        const newOffset = direction === 'next' ? (tableQuery.offset || 0) + limit : Math.max(0, (tableQuery.offset || 0) - limit);
        setTableQuery(prev => ({ ...prev, offset: newOffset }));
        if (tableRef.current) tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [tableQuery.offset, limit, setTableQuery]);

    return (
        <div ref={tableRef} className="flex flex-col gap-8 p-1 xs:px-3 py-5 md:px-8 md:py-10">
            <div className={`flex justify-between gap-5 ${filterFields ? 'flex-col xl:flex-row' : ''}`}>
                <div className="flex items-center gap-5">
                    <IconWrapper variant="secondary" icon={sectionsIconMap[icon]} />
                    <div className="flex flex-col gap-1">
                        <h2 className="text-h2 text-neutral-dark">{title}</h2>
                        {subText ? <p className="text-regular text-status-success">{subText}</p> : null}
                        <div className="h-1 w-3/4 rounded-full bg-blue-light" />
                    </div>
                </div>

                {(filterFields || tableOperationsStructure) ? <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                    {filterFields?.map(field => !field.hidden && renderField(filterData, handleFilterChange, field))}
                    {filterFields ? <Button buttonType='icon' variant="outline" size="lg" className='max-md:hidden' icon={<FilterX className="size-5 text-status-error" />} onClick={handleClearFilters} disabled={!hasActiveFilters} /> : null}
                    {filterFields ? <Button variant="outline" size="lg" className='md:hidden text-status-error' startIcon={<FilterX className="text-status-error" />} onClick={handleClearFilters} disabled={!hasActiveFilters}>Clear Filters</Button> : null}
                    {tableOperationsStructure ? <TableOperations variant='neutral' size='lg' tableOperationsStructure={tableOperationsStructure} mutateData={mutate as TableMutateData<IFormData>} /> : null}
                </div> : null}
            </div>

            {(isLoading || isFetching) ? <div className="flex flex-col gap-3">
                <h3 className="h-6 w-28 animate-pulse" />
                {Array.from({ length: limit }).map((_, index) => <ActivityCard key={`loading-${index}`} type={columnConfig.type} loading />)}
            </div> : sortedDateGroups.length > 0 ? <div className="flex flex-col gap-5 xs:gap-8">
                {sortedDateGroups.map(([date, dateActivities]) => <div key={date} className="flex flex-col gap-3">
                    <h5 className="text-h5 text-neutral-dark">{date}</h5>
                    {dateActivities.map((row: TTableResponse) => <ActivityCard key={`${columnConfig.type}-${row._id}`} row={row} config={columnConfig} rowOperationsStructure={rowOperationsStructure} mutateData={mutate as TableMutateData<IFormData>} />)}
                </div>)}
            </div> : <NoData description={emptyStateMessage} className='bg-white rounded-md border' />}

            {totalPages > 1 && <div className="flex flex-col xs:flex-row justify-between items-center gap-3">
                <span className="block xs:hidden text-regular text-neutral-light text-center whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <div className="flex justify-between items-center gap-3 w-full">
                    <Button variant="outline" startIcon={<ChevronLeft />} onClick={() => handlePageChange('prev')} disabled={(tableQuery.offset || 0) === 0}>Previous</Button>
                    <span className="hidden xs:block text-regular text-neutral-light text-center whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" endIcon={<ChevronRight />} onClick={() => handlePageChange('next')} disabled={currentPage >= totalPages}>Next</Button>
                </div>
            </div>}
        </div>
    );
};

export default ActivityTable;
