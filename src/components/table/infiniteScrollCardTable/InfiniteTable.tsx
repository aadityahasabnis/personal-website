'use client';
import React from 'react';

import InfiniteTableCardLoading from '@/common/components/table/infiniteScrollCardTable/InfiniteTableCardLoading';
import { cardsPerRowMap } from '@/common/constants/maps/maps';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type StrongOmit } from '@/common/interfaces/genericInterfaces';
import { type ITableQuery } from '@/common/server/actions/common';

import { type InfiniteTableMutateData } from '../InfiniteTableWrapper';
import TableOperations, { type ITableOperationsStructure } from '../operations/TableOperations';
import TableSearchComponent from '../operations/TableSearchComponent';
import { type IFiltersStructure } from '../table/TableFilters';

import { type IInfiniteTableCard, InfiniteTableCard } from './InfiniteTableCard';
import InfiniteTableFilters, { type IInfiniteTableFiltersProps } from './InfiniteTableFilters';

// CHECK: Interface not available
export interface IInfiniteTableProps<TInfiniteTableResponse extends IFormData, TInfiniteTableFilterBody extends IFormData | undefined> extends StrongOmit<IInfiniteTableCard<TInfiniteTableResponse>, 'cardData' | 'mutateData'> {
    tableData: Array<TInfiniteTableResponse>;
    limit: ITableQuery<TInfiniteTableResponse>['limit'];
    isValidating: boolean;

    mutateData: InfiniteTableMutateData<TInfiniteTableResponse>;
    resetPagination: () => void;
    filtersStructure?: IFiltersStructure<TInfiniteTableFilterBody>;
    tableOperationsStructure?: Array<ITableOperationsStructure<IFormData, IFormData>>;

    searchLabel?: string;
    cardsPerRow?: 1 | 2 | 3;
    defaultFilter?: IInfiniteTableFiltersProps<TInfiniteTableFilterBody>['defaultFilter'];
    operationsClassName?: string;
}

const InfiniteTable = <TInfiniteTableResponse extends IFormData, TInfiniteTableFilterBody extends IFormData | undefined>({ limit, tableData, searchLabel, filtersStructure, defaultFilter, tableOperationsStructure, cardsPerRow = 1, resetPagination, isValidating, operationsClassName, ...props }: IInfiniteTableProps<TInfiniteTableResponse, TInfiniteTableFilterBody>) => {
    return (
        <div className='flex flex-col gap-3'>
            {(searchLabel || filtersStructure || tableOperationsStructure) ? <div className={`sticky top-0 flex flex-col gap-3 z-10 bg-muted-background pb-2 max-xs:border-b ${operationsClassName}`}>
                <div className='flex gap-3 w-full'>
                    {searchLabel ? <TableSearchComponent resetPagination={resetPagination} className="bg-white border" searchLabel={searchLabel} /> : null}
                    {tableOperationsStructure ? <TableOperations variant='outline' size='md' tableOperationsStructure={tableOperationsStructure} mutateData={props?.mutateData as InfiniteTableMutateData<IFormData>} className='max-tab:hidden ml-auto' /> : null}

                    {filtersStructure && !tableOperationsStructure ? <InfiniteTableFilters filtersStructure={filtersStructure} resetPagination={resetPagination} defaultFilter={defaultFilter} className='tab:hidden' /> : null}
                </div>

                {(tableOperationsStructure || filtersStructure) ? <div className={`flex justify-between gap-3 w-full overflow-x-scroll no-scrollbar overflow-visible! ${!filtersStructure ? 'tab:hidden' : tableOperationsStructure ? 'tab:w-full' : 'max-tab:hidden w-full'}`}>
                    {tableOperationsStructure ? <TableOperations variant='outline' size='md' tableOperationsStructure={tableOperationsStructure} mutateData={props?.mutateData as InfiniteTableMutateData<IFormData>} className='tab:hidden' /> : null}
                    {filtersStructure ? <InfiniteTableFilters filtersStructure={filtersStructure} resetPagination={resetPagination} defaultFilter={defaultFilter} className={tableOperationsStructure ? 'tab:w-full' : 'max-tab:hidden w-full'} /> : null}
                </div> : null}
            </div> : null}

            <div className={`grid gap-3 ${cardsPerRowMap[cardsPerRow]}`}>
                {tableData?.map((data, index) => <InfiniteTableCard key={data.id ?? index} cardData={data} {...props} />)}
                {isValidating ? Array.from({ length: limit }, (_, i) => <InfiniteTableCardLoading key={`loading-${i}`} isCompacted={cardsPerRow > 1} />) : undefined}
            </div>
        </div>
    );
};

export default React.memo(InfiniteTable) as typeof InfiniteTable;
