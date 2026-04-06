// ===== Admin Components =====

// Core Components
export { EmptyState } from './EmptyState';
export { PageHeader } from './PageHeader';
export { StatusBadge } from './StatusBadge';

// Content Preview
export { ContentPreview } from './ContentPreview';

// =============================================================
// New Config-Driven Table System (table/*)
// =============================================================
export {
    createActionsColumn, createArchiveAction as createArchiveRowAction, createBadgeColumn, createBooleanFilter, createBulkAction, createBulkArchiveAction as createBulkArchiveRowAction, createBulkDeleteAction as createBulkDeleteRowAction, createBulkFeatureAction as createBulkFeatureRowAction, createBulkPublishAction as createBulkPublishRowAction, createBulkUnfeatureAction as createBulkUnfeatureRowAction, createBulkUnpublishAction as createBulkUnpublishRowAction,
    // Config Builders
    createColumn, createDateColumn, createDeleteAction as createDeleteRowAction,
    createDuplicateAction as createDuplicateRowAction, createEditAction as createEditRowAction, createFeatureAction as createFeatureRowAction, createFilter, createInfiniteScrollConfig, createMoveDownAction, createMoveUpAction, createNumberColumn, createPaginationConfig, createPublishAction as createPublishRowAction, createReorderConfig, createRestoreAction as createRestoreRowAction, createRowAction, createSelectFilter, createStatusFilter, createTableConfig, createTextColumn, createViewAction as createViewRowAction,
    // Components
    DataTable, DataTableActions, DataTableEmptyState, DataTablePagination,
    BulkActionsBar as NewBulkActionsBar, resolveHref, resolveIcon,
    resolveLabel, TableSearch,
    // Hooks
    useDataTable, useTableContext, type FilterValues,
    // Types
    type IColumnConfig,
    type IDataTableColumn, type IDataTableProps, type IEmptyStateProps, type IFilterConfig, type IBulkAction as INewBulkAction, type IBulkActionsBarProps as INewBulkActionsBarProps, type IPaginationConfig, type IReorderConfig, type IRowAction, type ITableConfig,
    type ITableContext, type ITableSearchProps
} from './table';

// =============================================================
// Legacy Table System (for backward compatibility)
// =============================================================

// Legacy BulkActionsBar with its types
export {
    BulkActionsBar,
    createBulkArchiveAction,
    createBulkSetActiveAction,
    createBulkSetWipAction,
    type IBulkAction as IBulkActionLegacy,
    type IBulkActionsBarProps
} from './BulkActionsBar';


// Legacy Filter & Search
export { SearchFilter, type IFilterGroup, type IFilterOption } from './SearchFilter';

// Legacy Bulk Operations
export { BulkActions, type IBulkAction } from './BulkActions';

// =============================================================
// Layout Components
// =============================================================
export { CommandPalette } from './CommandPalette';
export { default as AdminHeader } from './layout/AdminHeader';
export { default as AdminSidebar } from './layout/AdminSidebar';
export { NotificationsPanel } from './NotificationsPanel';

// =============================================================
// Image Components
// =============================================================
export { ImageGallery, type GalleryImage } from './gallery/ImageGallery';
export { ImageUpload, type UploadedImage } from './gallery/ImageUpload';

// =============================================================
// Form Components
// =============================================================
export {
    FormActions,
    FormCheckbox,
    FormError,
    FormInput,
    FormSection,
    FormSelect,
    FormTextarea,
    TagInput
} from './form';

