'use client';
import { useAtom } from 'jotai';
import { ArrowDown } from 'lucide-react';

import LoadingProgress from '@/common/components/skeleton/LoadingProgress';
import { TableCell, TableHead, TableHeader, TableRow } from '@/common/components/ui/table';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { tableQueryAtom } from '@/common/jotai/atoms';

import { getAlignmentClass } from './CustomTable';
import { type IDataColumnStructure } from './TableBodyWrapper';

const TableHeaderWrapper = <TTableResponse extends IFormData>({ columnsStructure, revalidating, showIndexColumn }: { columnsStructure: Array<IDataColumnStructure<TTableResponse>>; revalidating: boolean; showIndexColumn: boolean }) => {

    const [tableQuery, setTableQuery] = useAtom(tableQueryAtom);
    const currentSort = tableQuery.sort ?? {};

    const handleSort = (columnId: string | keyof TTableResponse, sortOrder: 1 | -1) => setTableQuery(prevQuery => ({
        ...prevQuery, offset: 0, sort: { [String(columnId)]: (currentSort[String(columnId)] ?? sortOrder) * -1 as 1 | -1 }
    }));

    return (
        <TableHeader className="relative">
            <TableRow>
                {showIndexColumn ? <TableHead className="z-10 text-neutral-light">#</TableHead> : null}
                {columnsStructure.map((column, index) => {
                    const isSortable = 'sort' in column && !!column.sort;
                    const sortOrder = currentSort[String(column.id)] ?? 0;
                    const isCurrentSort = !!sortOrder;
                    return column?.hidden ? undefined : (
                        <TableHead key={index} className={`group py-4 z-10 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                            style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}>
                            <div className={`flex ${getAlignmentClass(column.align)} gap-2 items-center`}
                                onClick={() => isSortable && 'sort' in column && handleSort(column.id, column.sort ?? 1)}
                                style={{ cursor: isSortable ? 'pointer' : 'default' }}>
                                <span className="text-neutral-light group-hover:text-neutral-medium">{column.label}</span>
                                {isSortable ? <ArrowDown className={`size-4 shrink-0 transition-all duration-200 transform ${isCurrentSort ? 'opacity-100 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-80'} ${sortOrder === 1 ? 'rotate-180' : ''}`} /> : null}
                            </div>
                        </TableHead>
                    );
                })}
            </TableRow>

            <TableRow>
                <TableCell className="size-0 p-0 m-0" colSpan={columnsStructure?.length + Number(showIndexColumn)}>
                    {revalidating ? <LoadingProgress loading={revalidating} /> : null}
                </TableCell>
            </TableRow>
        </TableHeader>
    );
};

export default TableHeaderWrapper;
