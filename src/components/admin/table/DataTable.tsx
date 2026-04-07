'use client';

// =============================================================
// DataTable - Professional Config-Driven Table Component
// =============================================================

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

import type {
    IColumnConfig,
    IColumnSort,
    IDataTableProps,
    ITableContext,
} from './types';
import { useDataTable } from './useDataTable';
import { DataTableActions } from './DataTableActions';
import { TableSearch } from './TableSearch';
import { DataTablePagination } from './DataTablePagination';
import { BulkActionsBar } from './BulkActionsBar';
import { DataTableEmptyState } from './DataTableEmptyState';
import { DataTableSkeleton } from './DataTableSkeleton';

// =============================================================
// Table Context
// =============================================================

const TableContext = createContext<ITableContext<unknown> | null>(null);

export function useTableContext<TData>(): ITableContext<TData> {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('useTableContext must be used within a DataTable');
    }
    return context as ITableContext<TData>;
}

// =============================================================
// Drag State
// =============================================================

interface IDragState {
    draggedIndex: number | null;
    dragOverIndex: number | null;
}

// =============================================================
// DataTable Component
// =============================================================

export function DataTable<TData>({
    config,
    data,
    serverAction,
    initialData,
    initialTotal,
    className,
}: IDataTableProps<TData>): React.ReactElement {
    const tableContext = useDataTable<TData>({
        config,
        data,
        serverAction,
        initialData,
        initialTotal,
    });

    const {
        displayedData,
        totalItems,
        isLoading,
        isFetching,
        state,
        setSearchQuery,
        setFilter,
        activeFiltersCount,
        clearFilters,
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
        reorder,
        isReordering,
    } = tableContext;

    // Drag state for reordering
    const [dragState, setDragState] = useState<IDragState>({
        draggedIndex: null,
        dragOverIndex: null,
    });

    // Infinite scroll ref
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingMore = useRef(false);

    // Scroll shadow state for responsive tables
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

    // Update scroll shadows on scroll and resize
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const updateScrollState = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setScrollState({
                canScrollLeft: scrollLeft > 0,
                canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
            });
        };

        updateScrollState();
        container.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            container.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [displayedData]);

    // =============================================================
    // Drag & Drop Handlers
    // =============================================================

    const handleDragStart = useCallback((index: number) => {
        setDragState({ draggedIndex: index, dragOverIndex: null });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        if (dragState.draggedIndex === null || dragState.dragOverIndex === null) {
            setDragState({ draggedIndex: null, dragOverIndex: null });
            return;
        }
        if (dragState.draggedIndex === dragState.dragOverIndex) {
            setDragState({ draggedIndex: null, dragOverIndex: null });
            return;
        }
        await reorder(dragState.draggedIndex, dragState.dragOverIndex);
        setDragState({ draggedIndex: null, dragOverIndex: null });
    }, [dragState, reorder]);

    const handleDragEnd = useCallback(() => {
        setDragState({ draggedIndex: null, dragOverIndex: null });
    }, []);

    // =============================================================
    // Computed Values
    // =============================================================

    const visibleColumns = config.columns.filter(col => !col.hidden);
    const hasSelection = config.selectable;
    const hasDrag = config.reorder?.enabled && config.reorder.mode !== 'buttons';
    const hasRowActions = config.rowActions && config.rowActions.length > 0;
    const hasBulkActions = config.bulkActions && config.bulkActions.length > 0 && selectedRows.length > 0;

    // =============================================================
    // Render Helpers
    // =============================================================

    const renderCellContent = useCallback((column: IColumnConfig<TData>, row: TData, rowIndex: number) => {
        // Custom cell renderer
        if (column.cell) {
            return column.cell(row, rowIndex);
        }

        // Accessor function
        if (typeof column.accessor === 'function') {
            return column.accessor(row) as React.ReactNode;
        }

        // Key accessor
        if (column.accessor) {
            const value = row[column.accessor];
            if (value === null || value === undefined) return null;
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (value instanceof Date) return value.toLocaleDateString();
            return String(value);
        }

        return null;
    }, []);

    const renderSortIndicator = (column: IColumnConfig<TData>, sort: IColumnSort | null) => {
        if (!column.sortable) return null;

        const isSorted = sort?.id === column.id;
        const direction = sort?.direction;

        return (
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleSort(column.id)}
                className="ml-1 h-6 w-6 p-0 opacity-50 hover:opacity-100"
            >
                {isSorted ? (
                    direction === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5" />
                )}
            </Button>
        );
    };

    // =============================================================
    // Loading State - Use DataTableSkeleton for consistent UI
    // =============================================================

    if (isLoading && displayedData.length === 0) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                {/* Show interactive search bar during loading */}
                {config.searchable && (
                    <TableSearch
                        value={state.searchQuery}
                        onChange={setSearchQuery}
                        placeholder={config.searchPlaceholder}
                        filters={config.filters}
                        filterValues={state.filters}
                        onFilterChange={setFilter}
                        activeFiltersCount={activeFiltersCount}
                        onClearFilters={clearFilters}
                    />
                )}
                {/* Use DataTableSkeleton for table body */}
                <DataTableSkeleton
                    config={config}
                    showSearch={false} // Already showing interactive search above
                />
            </div>
        );
    }

    // =============================================================
    // Empty State
    // =============================================================

    if (displayedData.length === 0) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                {config.searchable && (
                    <TableSearch
                        value={state.searchQuery}
                        onChange={setSearchQuery}
                        placeholder={config.searchPlaceholder}
                        filters={config.filters}
                        filterValues={state.filters}
                        onFilterChange={setFilter}
                        activeFiltersCount={activeFiltersCount}
                        onClearFilters={clearFilters}
                    />
                )}
                <div className="rounded-xl border border-border bg-card">
                    <DataTableEmptyState
                        icon={config.emptyState?.icon}
                        title={config.emptyState?.title ?? 'No items found'}
                        description={config.emptyState?.description}
                        action={config.emptyState?.action}
                    />
                </div>
            </div>
        );
    }

    // =============================================================
    // Main Render
    // =============================================================

    return (
        <TableContext.Provider value={tableContext as ITableContext<unknown>}>
            <div className={cn('flex flex-col gap-4', className)}>
                {/* Search & Filters */}
                {config.searchable && (
                    <TableSearch
                        value={state.searchQuery}
                        onChange={setSearchQuery}
                        placeholder={config.searchPlaceholder}
                        filters={config.filters}
                        filterValues={state.filters}
                        onFilterChange={setFilter}
                        activeFiltersCount={activeFiltersCount}
                        onClearFilters={clearFilters}
                    />
                )}

                {/* Table Container */}
                <div className="relative rounded-xl border border-border bg-card">
                    {/* Subtle loading indicator when fetching new data */}
                    {isFetching && !isLoading && (
                        <div className="absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden rounded-t-xl">
                            <div className="h-full w-full animate-pulse bg-primary/50" />
                        </div>
                    )}
                    
                    {/* Scroll shadow indicators for mobile */}
                    <div
                        className={cn(
                            'pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-4 bg-gradient-to-r from-card to-transparent transition-opacity duration-200',
                            scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0'
                        )}
                        aria-hidden="true"
                    />
                    <div
                        className={cn(
                            'pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-4 bg-gradient-to-l from-card to-transparent transition-opacity duration-200',
                            scrollState.canScrollRight ? 'opacity-100' : 'opacity-0'
                        )}
                        aria-hidden="true"
                    />
                    
                    <div
                        ref={scrollContainerRef}
                        className={cn(
                            'overflow-x-auto transition-opacity duration-150',
                            isFetching && !isLoading && 'opacity-70'
                        )}
                    >
                        <Table className="min-w-max">
                            {/* Header */}
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    {/* Drag Handle Column */}
                                    {hasDrag && (
                                        <TableHead className="w-10 text-center">
                                            <span className="sr-only">Drag</span>
                                        </TableHead>
                                    )}

                                    {/* Selection Column */}
                                    {hasSelection && (
                                        <TableHead className="w-10 text-center">
                                            <Checkbox
                                                checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                    )}

                                    {/* Data Columns */}
                                    {visibleColumns.map(column => (
                                        <TableHead
                                            key={column.id}
                                            className={cn(
                                                'whitespace-nowrap',
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right',
                                                column.sticky === 'left' && 'sticky left-0 z-20 bg-muted/50',
                                                column.sticky === 'right' && 'sticky right-0 z-20 bg-muted/50',
                                                column.headerClassName
                                            )}
                                            style={{
                                                width: column.width,
                                                minWidth: column.minWidth,
                                                maxWidth: column.maxWidth,
                                            }}
                                        >
                                            <div className={cn(
                                                'flex items-center gap-1',
                                                column.align === 'center' && 'justify-center',
                                                column.align === 'right' && 'justify-end'
                                            )}>
                                                {column.header}
                                                {renderSortIndicator(column, state.sort)}
                                            </div>
                                        </TableHead>
                                    ))}

                                    {/* Actions Column */}
                                    {hasRowActions && (
                                        <TableHead className="sticky right-0 z-20 w-12 bg-muted/50 text-center">
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            {/* Body */}
                            <TableBody>
                                {displayedData.map((row, rowIndex) => {
                                    const rowId = config.keyExtractor(row);
                                    const selected = isSelected(rowId);
                                    const isDragging = dragState.draggedIndex === rowIndex;
                                    const isDragOver = dragState.dragOverIndex === rowIndex;
                                    const canMoveUp = rowIndex > 0;
                                    const canMoveDown = rowIndex < displayedData.length - 1;

                                    return (
                                        <TableRow
                                            key={rowId}
                                            draggable={hasDrag}
                                            onDragStart={() => handleDragStart(rowIndex)}
                                            onDragOver={(e) => handleDragOver(e, rowIndex)}
                                            onDrop={handleDrop}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => config.onRowClick?.(row)}
                                            data-state={selected ? 'selected' : undefined}
                                            className={cn(
                                                'transition-colors duration-150',
                                                isDragging && 'opacity-50',
                                                isDragOver && 'border-t-2 border-t-primary',
                                                config.onRowClick && 'cursor-pointer',
                                                config.striped && rowIndex % 2 === 1 && 'bg-muted/30',
                                                config.rowClassName?.(row, rowIndex)
                                            )}
                                        >
                                            {/* Drag Handle Cell */}
                                            {hasDrag && (
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
                                                    </div>
                                                </TableCell>
                                            )}

                                            {/* Selection Cell */}
                                            {hasSelection && (
                                                <TableCell
                                                    className="text-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelection(rowId);
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={selected}
                                                        aria-label={`Select row ${rowIndex + 1}`}
                                                    />
                                                </TableCell>
                                            )}

                                            {/* Data Cells */}
                                            {visibleColumns.map(column => (
                                                <TableCell
                                                    key={column.id}
                                                    className={cn(
                                                        column.align === 'center' && 'text-center',
                                                        column.align === 'right' && 'text-right',
                                                        column.sticky === 'left' && 'sticky left-0 z-10 bg-card',
                                                        column.sticky === 'right' && 'sticky right-0 z-10 bg-card',
                                                        column.className
                                                    )}
                                                >
                                                    {renderCellContent(column, row, rowIndex)}
                                                </TableCell>
                                            ))}

                                            {/* Actions Cell */}
                                            {hasRowActions && (
                                                <TableCell className="sticky right-0 z-10 bg-card text-center">
                                                    <DataTableActions
                                                        row={row}
                                                        actions={config.rowActions!}
                                                        canMoveUp={canMoveUp}
                                                        canMoveDown={canMoveDown}
                                                        onMoveUp={() => moveUp(rowId)}
                                                        onMoveDown={() => moveDown(rowId)}
                                                        isReordering={isReordering}
                                                        reorderMode={config.reorder?.mode}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Infinite Scroll Trigger */}
                    {config.pagination?.mode === 'infinite' && hasMore && (
                        <div ref={loadMoreRef} className="flex items-center justify-center p-4">
                            {isLoading || isLoadingMore.current ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Loading more...</span>
                                </div>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={loadMore}>
                                    Load More
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {(config.pagination?.mode === 'client' || config.pagination?.mode === 'server') && (
                    <DataTablePagination
                        page={state.page}
                        pageSize={state.pageSize}
                        total={totalItems}
                        pageSizeOptions={config.pagination.pageSizeOptions}
                        showPageSizeSelector={config.pagination.showPageSizeSelector}
                        showPageInfo={config.pagination.showPageInfo}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        mode={config.pagination.mode}
                    />
                )}

                {/* Bulk Actions Bar */}
                {hasBulkActions && (
                    <BulkActionsBar
                        selectedCount={selectedRows.length}
                        totalCount={totalItems}
                        selectedRows={selectedRows}
                        selectedIds={state.selectedIds}
                        actions={config.bulkActions!}
                        onClear={clearSelection}
                    />
                )}
            </div>
        </TableContext.Provider>
    );
}

export default DataTable;
