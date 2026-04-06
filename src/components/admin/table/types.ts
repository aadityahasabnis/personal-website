// =============================================================
// Admin Table Types - Professional Config-Driven Table System
// =============================================================

import type { ReactNode } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import type { LucideIcon } from 'lucide-react';

// =============================================================
// Column Types
// =============================================================

export type ColumnAlignment = 'left' | 'center' | 'right';
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'image' | 'actions' | 'custom';
export type SortDirection = 'asc' | 'desc';

export interface IColumnSort {
    id: string;
    direction: SortDirection;
}

export interface IColumnConfig<TData> {
    id: string;
    header: string;
    type?: ColumnType;
    accessor?: keyof TData | ((row: TData) => unknown);
    cell?: (row: TData, rowIndex: number) => ReactNode;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    align?: ColumnAlignment;
    sortable?: boolean;
    sortKey?: string;
    hidden?: boolean;
    sticky?: 'left' | 'right';
    className?: string;
    headerClassName?: string;
}

// =============================================================
// Row Action Types
// =============================================================

export type RowActionType = 
    | 'edit' 
    | 'delete' 
    | 'view' 
    | 'duplicate' 
    | 'publish' 
    | 'unpublish' 
    | 'feature' 
    | 'unfeature'
    | 'archive'
    | 'restore'
    | 'move-up'
    | 'move-down'
    | 'custom';

export interface IRowAction<TData> {
    id: string;
    label: string | ((row: TData) => string);
    icon?: LucideIcon | string | ((row: TData) => LucideIcon);
    type: RowActionType | ((row: TData) => RowActionType);
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    href?: string | ((row: TData) => string);
    onClick?: (row: TData) => Promise<void> | void;
    isVisible?: (row: TData) => boolean;
    isDisabled?: (row: TData) => boolean;
    confirm?: {
        title: string | ((row: TData) => string);
        message: string | ((row: TData) => string);
        confirmLabel?: string;
        cancelLabel?: string;
    };
    dividerBefore?: boolean;
    dividerAfter?: boolean;
}

// =============================================================
// Bulk Action Types
// =============================================================

export interface IBulkAction<TData> {
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'outline';
    onClick: (selectedRows: TData[], selectedIds: string[]) => Promise<void>;
    isVisible?: (selectedRows: TData[]) => boolean;
    isDisabled?: (selectedRows: TData[]) => boolean;
    confirm?: {
        title: string;
        message: string | ((count: number) => string);
        confirmLabel?: string;
        cancelLabel?: string;
    };
}

// =============================================================
// Filter Types
// =============================================================

export type FilterType = 'select' | 'multiselect' | 'text' | 'date' | 'daterange' | 'boolean';

export interface IFilterOption {
    label: string;
    value: string;
    count?: number;
    icon?: LucideIcon;
}

export interface IFilterConfig {
    id: string;
    label: string;
    type: FilterType;
    placeholder?: string;
    options?: IFilterOption[];
    defaultValue?: string | string[] | undefined;
    serverKey?: string;
}

export type FilterValues = Record<string, string | string[] | undefined>;

// =============================================================
// Reorder Types
// =============================================================

export interface IReorderConfig<TData> {
    enabled: boolean;
    mode: 'drag' | 'buttons' | 'both';
    onReorder: (items: TData[], ids: string[]) => Promise<IApiResponse<boolean>>;
    scope?: string;
}

// =============================================================
// Pagination Types
// =============================================================

export type PaginationMode = 'none' | 'client' | 'server' | 'infinite';

export interface IPaginationConfig {
    mode: PaginationMode;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    showPageInfo?: boolean;
}

export interface IPaginationState {
    page: number;
    pageSize: number;
    total: number;
}

// =============================================================
// Table Configuration
// =============================================================

export interface ITableConfig<TData> {
    // Identity
    tableKey: string;
    queryKey: QueryKey;

    // Data
    keyExtractor: (row: TData) => string;
    
    // Columns
    columns: IColumnConfig<TData>[];
    
    // Actions
    rowActions?: IRowAction<TData>[];
    bulkActions?: IBulkAction<TData>[];
    
    // Features
    selectable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof TData)[];
    searchFn?: (row: TData, query: string) => boolean;
    
    // Filters
    filters?: IFilterConfig[];
    
    // Reorder
    reorder?: IReorderConfig<TData>;
    
    // Pagination
    pagination?: IPaginationConfig;
    
    // Appearance
    emptyState?: {
        icon?: LucideIcon;
        title: string;
        description?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
    };
    rowClassName?: (row: TData, index: number) => string;
    stickyHeader?: boolean;
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
    
    // Callbacks
    onRowClick?: (row: TData) => void;
    onSelectionChange?: (selectedIds: string[], selectedRows: TData[]) => void;
}

// =============================================================
// Table State
// =============================================================

export interface ITableState {
    searchQuery: string;
    filters: FilterValues;
    sort: IColumnSort | null;
    selectedIds: string[];
    page: number;
    pageSize: number;
}

// =============================================================
// Table Context
// =============================================================

export interface ITableContext<TData> {
    // Config
    config: ITableConfig<TData>;
    
    // Data
    data: TData[];
    filteredData: TData[];
    displayedData: TData[];
    totalItems: number;
    isLoading: boolean;   // True only on first load (no cached data yet)
    isFetching: boolean;  // True when fetching (even with cached data - for subtle loading indicator)
    isError: boolean;
    
    // State
    state: ITableState;
    
    // Search
    setSearchQuery: (query: string) => void;
    
    // Filters
    setFilter: (key: string, value: string | string[] | undefined) => void;
    setFilters: (filters: FilterValues) => void;
    clearFilters: () => void;
    activeFiltersCount: number;
    
    // Sort
    setSort: (sort: IColumnSort | null) => void;
    toggleSort: (columnId: string) => void;
    
    // Selection
    toggleSelection: (id: string) => void;
    toggleSelectAll: () => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    selectedRows: TData[];
    
    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    hasMore: boolean;
    loadMore: () => void;
    
    // Reorder
    moveUp: (id: string) => Promise<void>;
    moveDown: (id: string) => Promise<void>;
    reorder: (fromIndex: number, toIndex: number) => Promise<void>;
    isReordering: boolean;
    
    // Actions
    refresh: () => void;
    invalidate: () => void;
}

// =============================================================
// Props Types
// =============================================================

/** Server query params for fetching paginated data */
export interface IServerQueryParams {
    query?: string;
    pagination?: {
        offset: number;
        limit: number;
    };
    sort?: {
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    [key: string]: unknown;
}

export interface IDataTableProps<TData> {
    config: ITableConfig<TData>;
    /** Static data for client-side mode */
    data?: TData[] | undefined;
    /** Server action for fetching paginated data */
    serverAction?: ((params: IServerQueryParams) => Promise<IPaginatedResponse<TData>>) | undefined;
    /** Initial data for SSR hydration */
    initialData?: TData[] | undefined;
    /** Initial total count for SSR hydration (required when initialData is provided for accurate pagination) */
    initialTotal?: number | undefined;
    className?: string | undefined;
}

export interface IDataTableHeaderProps<TData> {
    columns: IColumnConfig<TData>[];
    selectable?: boolean;
    draggable?: boolean;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    onSelectAll: () => void;
    sort: IColumnSort | null;
    onSort: (columnId: string) => void;
}

export interface IDataTableRowProps<TData> {
    row: TData;
    rowIndex: number;
    columns: IColumnConfig<TData>[];
    rowId: string;
    selectable?: boolean;
    isSelected: boolean;
    onToggleSelection: () => void;
    draggable?: boolean;
    isDragging?: boolean;
    isDragOver?: boolean;
    onDragStart?: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
    actions?: IRowAction<TData>[];
    rowClassName?: string;
    onRowClick?: () => void;
}

export interface IDataTableActionsProps<TData> {
    row: TData;
    actions: IRowAction<TData>[];
    itemName?: string | undefined;
    canMoveUp?: boolean | undefined;
    canMoveDown?: boolean | undefined;
    onMoveUp?: (() => Promise<void>) | undefined;
    onMoveDown?: (() => Promise<void>) | undefined;
    isReordering?: boolean | undefined;
    reorderMode?: ('drag' | 'buttons' | 'both') | undefined;
    className?: string | undefined;
}

export interface IDataTablePaginationProps {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: number[] | undefined;
    showPageSizeSelector?: boolean | undefined;
    showPageInfo?: boolean | undefined;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    hasMore?: boolean | undefined;
    onLoadMore?: (() => void) | undefined;
    mode: PaginationMode;
}

export interface ITableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string | undefined;
    filters?: IFilterConfig[] | undefined;
    filterValues?: FilterValues | undefined;
    onFilterChange?: ((key: string, value: string | string[] | undefined) => void) | undefined;
    activeFiltersCount?: number | undefined;
    onClearFilters?: (() => void) | undefined;
    className?: string | undefined;
}

export interface IBulkActionsBarProps<TData> {
    selectedCount: number;
    totalCount: number;
    selectedRows: TData[];
    selectedIds: string[];
    actions: IBulkAction<TData>[];
    onClear: () => void;
    className?: string;
}

export interface IEmptyStateProps {
    icon?: LucideIcon | undefined;
    title: string;
    description?: string | undefined;
    action?: {
        label: string;
        onClick: () => void;
    } | undefined;
    className?: string | undefined;
}

export interface IReorderButtonsProps {
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    isReordering: boolean;
}
