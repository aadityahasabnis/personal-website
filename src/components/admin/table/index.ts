// =============================================================
// Admin Table System - Exports
// =============================================================

// Types
export type {
    // Column Types
    ColumnAlignment,
    ColumnType,
    SortDirection,
    IColumnSort,
    IColumnConfig,
    // Row Action Types
    RowActionType,
    IRowAction,
    // Bulk Action Types
    IBulkAction,
    // Filter Types
    FilterType,
    IFilterOption,
    IFilterConfig,
    FilterValues,
    // Reorder Types
    IReorderConfig,
    // Pagination Types
    PaginationMode,
    IPaginationConfig,
    IPaginationState,
    // Table Configuration
    ITableConfig,
    ITableState,
    ITableContext,
    // Props Types
    IDataTableProps,
    IDataTableHeaderProps,
    IDataTableRowProps,
    IDataTableActionsProps,
    IDataTablePaginationProps,
    ITableSearchProps,
    IBulkActionsBarProps,
    IEmptyStateProps,
    IReorderButtonsProps,
    // Server Query Types
    IServerQueryParams,
} from './types';

// Components
export { DataTable, useTableContext } from './DataTable';
export { DataTableActions } from './DataTableActions';
export { TableSearch } from './TableSearch';
export { DataTablePagination } from './DataTablePagination';
export { BulkActionsBar } from './BulkActionsBar';
export { DataTableEmptyState } from './DataTableEmptyState';

// Hooks
export { useDataTable, type IUseDataTableOptions } from './useDataTable';

// Config Builders
export {
    // Column Builders
    createColumn,
    createTextColumn,
    createNumberColumn,
    createDateColumn,
    createBadgeColumn,
    createActionsColumn,
    // Row Action Builders
    createRowAction,
    createEditAction,
    createViewAction,
    createDeleteAction,
    createDuplicateAction,
    createPublishAction,
    createFeatureAction,
    createArchiveAction,
    createRestoreAction,
    createMoveUpAction,
    createMoveDownAction,
    // Bulk Action Builders
    createBulkAction,
    createBulkDeleteAction,
    createBulkPublishAction,
    createBulkUnpublishAction,
    createBulkFeatureAction,
    createBulkUnfeatureAction,
    createBulkArchiveAction,
    // Filter Builders
    createFilter,
    createSelectFilter,
    createBooleanFilter,
    createStatusFilter,
    // Pagination Builders
    createPaginationConfig,
    createInfiniteScrollConfig,
    // Reorder Builders
    createReorderConfig,
    // Table Config Builder
    createTableConfig,
    // Utilities
    resolveIcon,
    resolveLabel,
    resolveHref,
} from './config';

// =============================================================
// Legacy Type Aliases (for backward compatibility)
// =============================================================

// These aliases help existing code continue to work
// IDataTableColumn is now IColumnConfig
export type { IColumnConfig as IDataTableColumn } from './types';
