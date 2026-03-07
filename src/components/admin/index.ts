// ===== Admin Components =====

// Core Components
export { StatusBadge } from './StatusBadge';
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';

// Content Preview
export { ContentPreview } from './ContentPreview';

// Table Components
export { DataTable, type IDataTableColumn, type IDataTableProps } from './DataTable';
export { TableSearch, type ITableSearchProps, type ITableFilter } from './TableSearch';
export {
    BulkActionsBar,
    type IBulkActionsBarProps,
    type IBulkAction as IBulkActionNew,
    createBulkSetActiveAction,
    createBulkSetWipAction,
    createBulkArchiveAction,
} from './BulkActionsBar';

// Action Components
export { DataTableActions, type IDataTableAction } from './DataTableActions';

// Action Helpers
export {
    createEditAction,
    createDeleteAction,
    createTogglePublishedAction,
    createToggleFeaturedAction,
    createViewAction,
    createDuplicateAction,
    createBulkPublishAction,
    createBulkUnpublishAction,
    createBulkDeleteAction,
    createBulkFeatureAction,
    createBulkUnfeatureAction,
    createBulkDeleteAction as createBulkDeleteActionNew,
    createBulkPublishActionLegacy,
    createBulkUnpublishActionLegacy,
    createBulkDeleteActionLegacy,
} from './action-helpers';

// Filter & Search
export { SearchFilter, type IFilterOption, type IFilterGroup } from './SearchFilter';

// Bulk Operations (Legacy)
export { BulkActions, type IBulkAction } from './BulkActions';

// Layout Components
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminHeader } from './AdminHeader';
export { CommandPalette } from './CommandPalette';
export { NotificationsPanel } from './NotificationsPanel';

// Image Components
export { ImageUpload, type UploadedImage } from './ImageUpload';
export { ImageGallery, type GalleryImage } from './ImageGallery';

// Form Components
export {
    FormInput,
    FormTextarea,
    FormSelect,
    FormCheckbox,
    TagInput,
    FormSection,
    FormActions,
    FormError,
} from './form';
