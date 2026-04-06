'use client';

// =============================================================
// DataTablePagination - Professional Pagination Component
// =============================================================

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import type { IDataTablePaginationProps } from './types';

// =============================================================
// DataTablePagination Component
// =============================================================

export function DataTablePagination({
    page,
    pageSize,
    total,
    pageSizeOptions = [5, 10, 15, 25, 50],
    showPageSizeSelector = true,
    showPageInfo = true,
    onPageChange,
    onPageSizeChange,
    hasMore,
    onLoadMore,
    mode,
}: IDataTablePaginationProps): React.ReactElement {
    // Calculate pagination values
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    const canGoPrevious = page > 1;
    const canGoNext = page < totalPages;

    // =============================================================
    // Handlers
    // =============================================================

    const goToFirstPage = () => {
        if (canGoPrevious) onPageChange(1);
    };

    const goToPreviousPage = () => {
        if (canGoPrevious) onPageChange(page - 1);
    };

    const goToNextPage = () => {
        if (canGoNext) onPageChange(page + 1);
    };

    const goToLastPage = () => {
        if (canGoNext) onPageChange(totalPages);
    };

    // =============================================================
    // Infinite Scroll Mode
    // =============================================================

    if (mode === 'infinite') {
        if (!hasMore) return <></>;

        return (
            <div className="flex items-center justify-center py-4">
                <Button variant="outline" size="sm" onClick={onLoadMore}>
                    Load More
                </Button>
            </div>
        );
    }

    // =============================================================
    // Client/Server Pagination Mode
    // =============================================================

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
            {/* Page Size Selector */}
            {showPageSizeSelector && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-16 border-border bg-card">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Page Info */}
            {showPageInfo && (
                <div className="text-sm text-muted-foreground">
                    {total > 0 ? (
                        <>
                            Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
                            <span className="font-medium text-foreground">{endItem}</span> of{' '}
                            <span className="font-medium text-foreground">{total}</span> results
                        </>
                    ) : (
                        'No results'
                    )}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goToFirstPage}
                    disabled={!canGoPrevious}
                    className="h-8 w-8"
                    aria-label="Go to first page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goToPreviousPage}
                    disabled={!canGoPrevious}
                    className="h-8 w-8"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Number Display */}
                <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium">{page}</span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">{totalPages || 1}</span>
                </div>

                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goToNextPage}
                    disabled={!canGoNext}
                    className="h-8 w-8"
                    aria-label="Go to next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goToLastPage}
                    disabled={!canGoNext}
                    className="h-8 w-8"
                    aria-label="Go to last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default DataTablePagination;
