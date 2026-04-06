// =============================================================
// DataTableSkeleton - Reusable Loading Skeleton for DataTable
// Use as Suspense fallback for consistent loading UI
// =============================================================

import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import type { IColumnConfig, ITableConfig } from './types';

// =============================================================
// Types
// =============================================================

export interface IDataTableSkeletonProps<TData = unknown> {
    /**
     * Full table config - extracts what's needed for skeleton
     * This is the recommended way to use the skeleton
     */
    config?: ITableConfig<TData> | undefined;

    /**
     * Alternative: Pass individual options instead of full config
     * Useful when you don't have a full config available
     */
    columns?: IColumnConfig<TData>[] | undefined;
    
    /** Number of skeleton rows to show (default: from config or 10) */
    rowCount?: number | undefined;
    
    /** Show search bar skeleton */
    showSearch?: boolean | undefined;
    
    /** Show selection checkbox column */
    showSelection?: boolean | undefined;
    
    /** Show drag handle column */
    showDragHandle?: boolean | undefined;
    
    /** Show actions column */
    showActions?: boolean | undefined;
    
    /** Additional className for the container */
    className?: string | undefined;
}

// =============================================================
// DataTableSkeleton Component
// =============================================================

export function DataTableSkeleton<TData = unknown>({
    config,
    columns: propColumns,
    rowCount: propRowCount,
    showSearch: propShowSearch,
    showSelection: propShowSelection,
    showDragHandle: propShowDragHandle,
    showActions: propShowActions,
    className,
}: IDataTableSkeletonProps<TData>): React.ReactElement {
    // =============================================================
    // Extract values from config or use props
    // =============================================================
    
    const columns = propColumns ?? config?.columns ?? [];
    const visibleColumns = columns.filter(col => !col.hidden);
    
    // Determine row count: prop > config pageSize > default 10
    const rowCount = propRowCount ?? config?.pagination?.pageSize ?? 10;
    
    // Feature flags
    const showSearch = propShowSearch ?? config?.searchable ?? false;
    const showSelection = propShowSelection ?? config?.selectable ?? false;
    const showDragHandle = propShowDragHandle ?? (config?.reorder?.enabled && config?.reorder?.mode !== 'buttons') ?? false;
    const showActions = propShowActions ?? (config?.rowActions && config.rowActions.length > 0) ?? false;

    // =============================================================
    // Render
    // =============================================================

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {/* Search Bar Skeleton */}
            {showSearch && (
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 flex-1 max-w-md rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            )}

            {/* Table Container */}
            <div className="rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <Table className="min-w-max">
                        {/* Header */}
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {/* Drag Handle Column */}
                                {showDragHandle && (
                                    <TableHead className="w-10 text-center">
                                        <span className="sr-only">Drag</span>
                                    </TableHead>
                                )}

                                {/* Selection Column */}
                                {showSelection && (
                                    <TableHead className="w-10 text-center">
                                        <Skeleton className="mx-auto h-4 w-4" />
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
                                        </div>
                                    </TableHead>
                                ))}

                                {/* Actions Column */}
                                {showActions && (
                                    <TableHead className="sticky right-0 z-20 w-12 bg-muted/50 text-center">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>

                        {/* Body - Skeleton Rows */}
                        <TableBody>
                            {Array.from({ length: rowCount }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                                    {/* Drag Handle Skeleton */}
                                    {showDragHandle && (
                                        <TableCell className="text-center">
                                            <Skeleton className="mx-auto h-4 w-4" />
                                        </TableCell>
                                    )}

                                    {/* Selection Skeleton */}
                                    {showSelection && (
                                        <TableCell className="text-center">
                                            <Skeleton className="mx-auto h-4 w-4" />
                                        </TableCell>
                                    )}

                                    {/* Data Cells Skeleton */}
                                    {visibleColumns.map((column) => (
                                        <TableCell 
                                            key={column.id}
                                            className={cn(
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right',
                                            )}
                                        >
                                            <ColumnSkeleton column={column} />
                                        </TableCell>
                                    ))}

                                    {/* Actions Skeleton */}
                                    {showActions && (
                                        <TableCell className="sticky right-0 z-10 bg-card text-center">
                                            <Skeleton className="mx-auto h-8 w-8 rounded-md" />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Column Skeleton - Intelligent skeleton based on column type
// =============================================================

interface IColumnSkeletonProps<TData = unknown> {
    column: IColumnConfig<TData>;
}

function ColumnSkeleton<TData = unknown>({ column }: IColumnSkeletonProps<TData>): React.ReactElement {
    // Determine skeleton width based on column type or ID patterns
    const getSkeletonWidth = (): string => {
        // Check column type
        switch (column.type) {
            case 'number':
                return 'w-12';
            case 'date':
                return 'w-24';
            case 'boolean':
            case 'badge':
                return 'w-16';
            case 'image':
                return 'w-10 h-10 rounded-lg';
            default:
                break;
        }

        // Check column ID patterns for common column types
        const id = column.id.toLowerCase();
        
        // Primary columns (title, name, topic) - wider
        if (id === 'topic' || id === 'title' || id === 'name' || id === 'article') {
            return 'w-48';
        }
        
        // Status/badge columns
        if (id === 'status' || id === 'published' || id === 'featured' || id === 'active') {
            return 'w-16';
        }
        
        // Count columns
        if (id.includes('count') || id === 'views' || id === 'likes') {
            return 'w-12';
        }
        
        // Date columns
        if (id.includes('date') || id.includes('at') || id === 'created' || id === 'updated') {
            return 'w-24';
        }
        
        // Email, URL columns
        if (id === 'email' || id === 'url' || id === 'slug') {
            return 'w-36';
        }
        
        // Default width
        return 'w-20';
    };

    const widthClass = getSkeletonWidth();
    
    // Special handling for image type
    if (column.type === 'image') {
        return <Skeleton className={cn('mx-auto', widthClass)} />;
    }

    // Special handling for primary columns (show icon + text skeleton)
    const id = column.id.toLowerCase();
    if (id === 'topic' || id === 'title' || id === 'name' || id === 'article') {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        );
    }

    // Default skeleton
    return <Skeleton className={cn('h-4', widthClass)} />;
}

export default DataTableSkeleton;
