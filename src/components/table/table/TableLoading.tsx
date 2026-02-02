import { Skeleton } from '@/common/components/ui/skeleton';
import { TableBody, TableCell, TableRow } from '@/common/components/ui/table';
import  { type IFormData } from '@/common/hooks/useFormOperations';

import  { type IColumnStructure } from './TableBodyWrapper';

interface ITableLoadingProps {
    columnsStructure: Array<IColumnStructure<IFormData>>;
    rowCount?: number;
    showIndexColumn: boolean;
}

const TableLoading = ({ columnsStructure = Array(5).fill({ id: '', align: 'left', minWidth: 100 }), rowCount = 10, showIndexColumn = true }: ITableLoadingProps) => {
    return (
        <TableBody>
            {Array(rowCount).fill(0).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {showIndexColumn ? <TableCell className="text-center"> <Skeleton className="h-2 w-full" /> </TableCell> : null}
                    {columnsStructure.map((column, colIndex) => (
                        <TableCell key={colIndex} className={'align' in column && column.align === 'right' ? 'text-right' : 'text-left'}>
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
};

export default TableLoading;
