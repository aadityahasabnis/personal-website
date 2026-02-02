'use client';

import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/common/components/ui/pagination';
import { tableQueryAtom } from '@/common/jotai/atoms';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const TablePaginationWrapper = ({ count = 0, loading }: { count: number | undefined; loading: boolean }) => {

    const [tableQuery, setTableQuery] = useAtom(tableQueryAtom);

    const currentLimit = Number(tableQuery.limit) || 10;
    const totalOffsets = Math.ceil(count / currentLimit);
    const currentOffset = Number(tableQuery.offset / tableQuery.limit) || 0;

    const handleOffsetChange = (offset: number) => {
        if (count > currentLimit) setTableQuery((prev) => ({ ...prev, offset: Number(offset * tableQuery.limit) }));
    };
    const handleLimitChange = (value: string) => setTableQuery((prev) => ({ ...prev, limit: Number(value), offset: 0 }));

    const renderPaginationItems = () => {
        const items = [
            <PaginationItem key="prev" className={`${currentOffset === 0 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}`}>
                <PaginationPrevious onClick={() => handleOffsetChange(Math.max(currentOffset - 1, 0))} />
            </PaginationItem>
        ];

        const startOffset = Math.max(currentOffset - 1, 1);
        const endOffset = Math.min(currentOffset + 1, totalOffsets - 2);

        items.push(<PaginationItem key={0} className="cursor-pointer">
            <PaginationLink className="hover:bg-white" isActive={currentOffset === 0} onClick={() => handleOffsetChange(0)}>
                1
            </PaginationLink>
        </PaginationItem>);

        if (startOffset > 1) items.push(
            <PaginationItem key="start-ellipsis">
                <MoreHorizontal className="text-neutral-light size-4" />
            </PaginationItem>
        );

        items.push(...Array.from({ length: endOffset - startOffset + 1 }, (_, index) => {
            const i = startOffset + index;
            return (
                <PaginationItem key={i} className="cursor-pointer">
                    <PaginationLink className="hover:bg-white" isActive={currentOffset === i} onClick={() => handleOffsetChange(i)}>
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            );
        }));

        if (endOffset < totalOffsets - 2) items.push(<PaginationItem key="end-ellipsis"><MoreHorizontal className="text-neutral-light size-4" /></PaginationItem>);

        if (totalOffsets > 1)
            items.push(
                <PaginationItem key={totalOffsets - 1} className="cursor-pointer">
                    <PaginationLink className="hover:bg-white" isActive={currentOffset === totalOffsets - 1} onClick={() => handleOffsetChange(totalOffsets - 1)}>
                        {totalOffsets}
                    </PaginationLink>
                </PaginationItem>
            );

        items.push(
            <PaginationItem key="next" className={`${currentOffset === totalOffsets - 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}`}>
                <PaginationNext onClick={() => handleOffsetChange(Math.min(currentOffset + 1, totalOffsets - 1))} />
            </PaginationItem>
        );
        return items;
    };

    return (
        <Pagination className="flex flex-col xs:flex-row justify-between w-full bg-muted-background gap-3 xs:gap-20 overflow-x-scroll no-scrollbar py-3 xs:p-3 px-5 rounded-b-lg border-x border-b">
            <PaginationContent className="max-xs:mx-auto w-fit xs:w-full">{renderPaginationItems()}</PaginationContent>

            <div className="flex gap-5 items-center text-regular mx-auto">
                <div className="flex items-center gap-2">
                    <label htmlFor="pagination-limit" className="text-nowrap">Items per offset:</label>
                    {loading
                        ? <div className="w-20 h-6 animate-pulse rounded-xl" />
                        : <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
                            <SelectTrigger className="w-20 h-9">
                                <SelectValue placeholder="Select">{currentLimit}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map(value => <SelectItem key={value} value={value.toString()}>{value}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    }
                </div>

                {loading ? <div className="w-20 h-6 animate-pulse rounded-xl" /> : <p className="text-nowrap">Total items: {count}</p>}
            </div>
        </Pagination>
    );
};

export default TablePaginationWrapper;
