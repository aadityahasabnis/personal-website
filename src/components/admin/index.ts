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
    // Components
    DataTable,
    useTableContext,
    DataTableActions,
    TableSearch,
    DataTablePagination,
    BulkActionsBar as NewBulkActionsBar,
    DataTableEmptyState,
    // Hooks
    useDataTable,
    // Types
    type IColumnConfig,
    type IDataTableColumn,
    type IRowAction,
    type IBulkAction as INewBulkAction,
    type IFilterConfig,
    type FilterValues,
    type IReorderConfig,
    type IPaginationConfig,
    type ITableConfig,
    type ITableContext,
    type IDataTableProps,
    type ITableSearchProps,
    type IBulkActionsBarProps as INewBulkActionsBarProps,
    type IEmptyStateProps,
    // Config Builders
    createColumn,
    createTextColumn,
    createNumberColumn,
    createDateColumn,
    createBadgeColumn,
    createActionsColumn,
    createRowAction,
    createEditAction as createEditRowAction,
    createViewAction as createViewRowAction,
    createDeleteAction as createDeleteRowAction,
    createDuplicateAction as createDuplicateRowAction,
    createPublishAction as createPublishRowAction,
    createFeatureAction as createFeatureRowAction,
    createArchiveAction as createArchiveRowAction,
    createRestoreAction as createRestoreRowAction,
    createMoveUpAction,
    createMoveDownAction,
    createBulkAction,
    createBulkDeleteAction as createBulkDeleteRowAction,
    createBulkPublishAction as createBulkPublishRowAction,
    createBulkUnpublishAction as createBulkUnpublishRowAction,
    createBulkFeatureAction as createBulkFeatureRowAction,
    createBulkUnfeatureAction as createBulkUnfeatureRowAction,
    createBulkArchiveAction as createBulkArchiveRowAction,
    createFilter,
    createSelectFilter,
    createBooleanFilter,
    createStatusFilter,
    createPaginationConfig,
    createInfiniteScrollConfig,
    createReorderConfig,
    createTableConfig,
    resolveIcon,
    resolveLabel,
    resolveHref,
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
    type IBulkActionsBarProps,
} from './BulkActionsBar';

// Legacy Action Helpers (use string icons for server component compatibility)
export {
    createDeleteAction,
    createDuplicateAction,
    createEditAction,
    createToggleFeaturedAction,
    createTogglePublishedAction,
    createViewAction,
    createBulkDeleteAction,
    createBulkDeleteActionLegacy,
    createBulkFeatureAction,
    createBulkPublishAction,
    createBulkPublishActionLegacy,
    createBulkUnfeatureAction,
    createBulkUnpublishAction,
    createBulkUnpublishActionLegacy,
    type IDataTableAction,
} from './action-helpers';

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
export { ImageGallery, type GalleryImage } from './ImageGallery';
export { ImageUpload, type UploadedImage } from './ImageUpload';

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
    TagInput,
} from './form';

