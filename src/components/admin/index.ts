// ===== Admin Components =====

// Core Components
export { EmptyState } from './EmptyState';
export { PageHeader } from './PageHeader';
export { StatusBadge } from './StatusBadge';

// Content Preview
export { ContentPreview } from './ContentPreview';

// Table Components
export {
    BulkActionsBar, createBulkArchiveAction, createBulkSetActiveAction,
    createBulkSetWipAction, type IBulkAction as IBulkActionNew, type IBulkActionsBarProps
} from './BulkActionsBar';
export { DataTable, type IDataTableColumn, type IDataTableProps } from './table/DataTable';
export { TableSearch, type ITableFilter, type ITableSearchProps } from './table/TableSearch';

// Action Components
export { DataTableActions, type IDataTableAction } from './table/DataTableActions';

// Action Helpers
export {
    createBulkDeleteAction, createBulkDeleteActionLegacy, createBulkDeleteAction as createBulkDeleteActionNew, createBulkFeatureAction, createBulkPublishAction, createBulkPublishActionLegacy, createBulkUnfeatureAction, createBulkUnpublishAction, createBulkUnpublishActionLegacy, createDeleteAction, createDuplicateAction, createEditAction, createToggleFeaturedAction, createTogglePublishedAction, createViewAction
} from './action-helpers';

// Filter & Search
export { SearchFilter, type IFilterGroup, type IFilterOption } from './SearchFilter';

// Bulk Operations (Legacy)
export { BulkActions, type IBulkAction } from './BulkActions';

// Layout Components
export { CommandPalette } from './CommandPalette';
export { default as AdminHeader } from './layout/AdminHeader';
export { default as AdminSidebar } from './layout/AdminSidebar';
export { NotificationsPanel } from './NotificationsPanel';

// Image Components
export { ImageGallery, type GalleryImage } from './ImageGallery';
export { ImageUpload, type UploadedImage } from './ImageUpload';

// Form Components
export {
    FormActions, FormCheckbox, FormError, FormInput, FormSection, FormSelect, FormTextarea, TagInput
} from './form';

