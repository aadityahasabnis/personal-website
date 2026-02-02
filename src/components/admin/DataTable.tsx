'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

// ===== TYPES =====

export interface IDataTableColumn<TData> {
    id: string;
    header: string;
    accessor?: keyof TData | ((row: TData) => React.ReactNode);
    cell?: (row: TData) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    hidden?: boolean;
}

export interface IDataTableProps<TData> {
    data: TData[];
    columns: IDataTableColumn<TData>[];
    keyExtractor: (row: TData) => string;
    
    // Selection
    selectable?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    
    // Drag & Drop
    draggable?: boolean;
    onReorder?: (newOrder: TData[]) => Promise<void>;
    
    // Infinite Scroll
    infiniteScroll?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => Promise<void>;
    isLoading?: boolean;
    
    // Row Actions
    onRowClick?: (row: TData) => void;
    rowClassName?: (row: TData) => string;
    
    // Empty State
    emptyState?: React.ReactNode;
    
    className?: string;
}

// ===== DRAG & DROP UTILITIES =====

interface IDragState {
    draggedIndex: number | null;
    draggedOverIndex: number | null;
}

// ===== DATA TABLE COMPONENT =====

export function DataTable<TData>({
    data,
    columns,
    keyExtractor,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    draggable = false,
    onReorder,
    infiniteScroll = false,
    hasMore = false,
    onLoadMore,
    isLoading = false,
    onRowClick,
    rowClassName,
    emptyState,
    className,
}: IDataTableProps<TData>): React.ReactElement {
    // State
    const [dragState, setDragState] = useState<IDragState>({
        draggedIndex: null,
        draggedOverIndex: null,
    });
    const [localData, setLocalData] = useState<TData[]>(data);
    
    // Refs
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingMore = useRef(false);

    // Sync local data with props
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    // ===== SELECTION HANDLERS =====
    
    const isSelected = useCallback(
        (id: string) => selectedIds.includes(id),
        [selectedIds]
    );

    const toggleSelection = useCallback(
        (id: string) => {
            if (!onSelectionChange) return;
            
            const newSelection = isSelected(id)
                ? selectedIds.filter((selectedId) => selectedId !== id)
                : [...selectedIds, id];
            
            onSelectionChange(newSelection);
        },
        [isSelected, selectedIds, onSelectionChange]
    );

    const toggleSelectAll = useCallback(() => {
        if (!onSelectionChange) return;
        
        const allIds = localData.map(keyExtractor);
        const newSelection = selectedIds.length === localData.length ? [] : allIds;
        onSelectionChange(newSelection);
    }, [localData, selectedIds, onSelectionChange, keyExtractor]);

    // ===== DRAG & DROP HANDLERS =====

    const handleDragStart = useCallback((index: number) => {
        setDragState({ draggedIndex: index, draggedOverIndex: null });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragState((prev) => ({
            ...prev,
            draggedOverIndex: index,
        }));
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            
            if (dragState.draggedIndex === null || dragState.draggedOverIndex === null) {
                setDragState({ draggedIndex: null, draggedOverIndex: null });
                return;
            }

            if (dragState.draggedIndex === dragState.draggedOverIndex) {
                setDragState({ draggedIndex: null, draggedOverIndex: null });
                return;
            }

            const newData = [...localData];
            const [removed] = newData.splice(dragState.draggedIndex, 1);
            newData.splice(dragState.draggedOverIndex, 0, removed);

            setLocalData(newData);
            setDragState({ draggedIndex: null, draggedOverIndex: null });

            if (onReorder) {
                await onReorder(newData);
            }
        },
        [dragState, localData, onReorder]
    );

    const handleDragEnd = useCallback(() => {
        setDragState({ draggedIndex: null, draggedOverIndex: null });
    }, []);

    // ===== INFINITE SCROLL =====

    useEffect(() => {
        if (!infiniteScroll || !hasMore || isLoadingMore.current) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0]?.isIntersecting && !isLoadingMore.current) {
                    isLoadingMore.current = true;
                    
                    if (onLoadMore) {
                        await onLoadMore();
                    }
                    
                    isLoadingMore.current = false;
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [infiniteScroll, hasMore, onLoadMore]);

    // ===== RENDER HELPERS =====

    const renderCellContent = useCallback(
        (column: IDataTableColumn<TData>, row: TData) => {
            if (column.cell) {
                return column.cell(row);
            }

            if (typeof column.accessor === 'function') {
                return column.accessor(row);
            }

            if (column.accessor) {
                return row[column.accessor] as React.ReactNode;
            }

            return null;
        },
        []
    );

    const visibleColumns = columns.filter((col) => !col.hidden);
    const allSelected = selectable && localData.length > 0 && selectedIds.length === localData.length;
    const someSelected = selectable && selectedIds.length > 0 && selectedIds.length < localData.length;

    // ===== RENDER =====

    if (localData.length === 0 && !isLoading) {
        return (
            <div className="rounded-xl border bg-card">
                {emptyState || (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {/* Drag Handle Column */}
                            {draggable && (
                                <TableHead className="w-12 text-center">
                                    <span className="sr-only">Drag</span>
                                </TableHead>
                            )}

                            {/* Selection Column */}
                            {selectable && (
                                <TableHead className="w-12 text-center">
                                    <Checkbox
                                        checked={allSelected || (someSelected ? 'indeterminate' : false)}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                            )}

                            {/* Data Columns */}
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={cn(
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right'
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {localData.map((row, index) => {
                            const rowId = keyExtractor(row);
                            const selected = isSelected(rowId);
                            const isDragging = dragState.draggedIndex === index;
                            const isDraggedOver = dragState.draggedOverIndex === index;

                            return (
                                <TableRow
                                    key={rowId}
                                    draggable={draggable}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onRowClick?.(row)}
                                    data-state={selected ? 'selected' : undefined}
                                    className={cn(
                                        'transition-colors hover:bg-muted/50',
                                        isDragging && 'opacity-50',
                                        isDraggedOver && 'border-t-2 border-t-primary',
                                        onRowClick && 'cursor-pointer',
                                        rowClassName?.(row)
                                    )}
                                >
                                    {/* Drag Handle Cell */}
                                    {draggable && (
                                        <TableCell className="text-center">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                        </TableCell>
                                    )}

                                    {/* Selection Cell */}
                                    {selectable && (
                                        <TableCell
                                            className="text-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(rowId);
                                            }}
                                        >
                                            <Checkbox
                                                checked={selected}
                                                aria-label={`Select row ${index + 1}`}
                                            />
                                        </TableCell>
                                    )}

                                    {/* Data Cells */}
                                    {visibleColumns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            className={cn(
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right'
                                            )}
                                        >
                                            {renderCellContent(column, row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Infinite Scroll Loading Trigger */}
            {infiniteScroll && hasMore && (
                <div ref={loadMoreRef} className="p-4 text-center">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-sm text-muted-foreground">Loading more...</span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
