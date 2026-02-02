import { Table } from '@/common/components/ui/table';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type ITabsStructure } from '@/common/hooks/useTabs';

import FilterButton from '../operations/FilterButton';
import TableOperations, { type ITableOperationsStructure } from '../operations/TableOperations';
import TableSearchComponent from '../operations/TableSearchComponent';
import { type TableMutateData } from '../TableWrapper';

import TableBodyWrapper, { type IColumnStructure, type IDataColumnStructure } from './TableBodyWrapper';
import TableFilters, { type IFiltersStructure } from './TableFilters';
import TableHeaderWrapper from './TableHeaderWrapper';
import TableLoading from './TableLoading';
import TablePaginationWrapper from './TablePaginationWrapper';
import TableTabs from './TableTabs';

export interface ICustomTableProps<TTableResponse extends IFormData, TTableFilterBody extends IFormData | undefined> {
    title: string;
    subText: string;
    count: number | undefined;
    columnsStructure: Array<IColumnStructure<TTableResponse>>;
    rows: Array<TTableResponse> | undefined;
    searchLabel?: string;
    mutateData: TableMutateData<TTableResponse>;
    loading?: boolean;
    revalidating?: boolean;
    tableTabStructure?: ITabsStructure;
    filtersStructure?: IFiltersStructure<TTableFilterBody>;
    tableOperationsStructure?: Array<ITableOperationsStructure<IFormData, IFormData>>;
    showIndexColumn?: boolean;
    defaultFilter?: IFormData;
    error: boolean;
    enableFiltersWithSearch?: boolean;
}

export const getAlignmentClass = <TTableResponse extends IFormData>(align?: IColumnStructure<TTableResponse>['align']): string => {
    const alignmentClasses: Record<NonNullable<IColumnStructure<TTableResponse>['align']>, string> = {
        right: 'justify-end',
        center: 'justify-center',
        left: 'justify-start'
    };

    return align && align in alignmentClasses ? alignmentClasses[align] : 'justify-start';
};

const CustomTable = <TTableResponse extends IFormData, TTableFilterBody extends IFormData | undefined>({ title, subText, columnsStructure, tableTabStructure, searchLabel, rows, count, filtersStructure, tableOperationsStructure, mutateData, loading = false, revalidating = false, showIndexColumn = true, defaultFilter, error, enableFiltersWithSearch = false }: ICustomTableProps<TTableResponse, TTableFilterBody>) => (
    <div className='flex flex-col'>
        <div className='sticky flex flex-col top-0 z-20 gap-3 p-3 xs:p-5 border-t border-x rounded-t-lg transition-all duration-500 bg-white'>
            <div className="flex flex-wrap justify-between gap-5">
                <div className="flex flex-col gap-1">
                    <h2 className="text-h2 text-neutral-dark">{title}</h2>
                    <p className="text-regular text-status-success">{subText}</p>
                </div>
                <TableOperations variant='neutral' size='md' tableOperationsStructure={tableOperationsStructure} mutateData={mutateData as TableMutateData<IFormData>} />
            </div>

            {(!searchLabel && !filtersStructure && !tableTabStructure) ? undefined : <div className='flex flex-col md:flex-row justify-end gap-5 transition-all duration-300'>
                {(filtersStructure || searchLabel) ? <div className='flex justify-between gap-3 transition-all duration-300 w-full'>
                    {searchLabel ? <TableSearchComponent searchLabel={searchLabel} /> : null}
                    {filtersStructure && filtersStructure.length > 0 ? <FilterButton<TTableFilterBody> filtersStructure={filtersStructure} defaultFilter={defaultFilter} enableFiltersWithSearch={enableFiltersWithSearch} /> : null}
                </div> : null}
                {tableTabStructure ? <TableTabs tabsStructure={tableTabStructure} /> : null}
            </div>}

            {!filtersStructure ? undefined : <TableFilters<TTableFilterBody> filtersStructure={filtersStructure} defaultFilter={defaultFilter} enableFiltersWithSearch={enableFiltersWithSearch} />}
        </div>

        <Table tableClassName='transition-all duration-300'>
            <TableHeaderWrapper columnsStructure={columnsStructure as Array<IDataColumnStructure<TTableResponse>>} revalidating={revalidating} showIndexColumn={showIndexColumn} />
            {loading ? <TableLoading columnsStructure={columnsStructure as Array<IColumnStructure<IFormData>>} rowCount={count} showIndexColumn={showIndexColumn} /> : <TableBodyWrapper rows={rows} columnsStructure={columnsStructure} count={count} showIndexColumn={showIndexColumn} mutateData={mutateData} error={error} />}
        </Table>

        <TablePaginationWrapper loading={loading} count={count} />
    </div>
);

export default CustomTable;
