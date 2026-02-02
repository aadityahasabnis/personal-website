// ===== Admin Components =====
// Reusable, professional components for the admin panel

// Core Components
export { StatusBadge } from './StatusBadge';
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';

// Table Components (New Professional System)
export { DataTable, type IDataTableColumn, type IDataTableProps } from './DataTable';
export { TableSearch, type ITableSearchProps, type ITableFilter } from './TableSearch';
export {
    BulkActionsBar,
    type IBulkActionsBarProps,
    type IBulkAction as IBulkActionNew,
    createBulkPublishAction as createBulkPublishActionNew,
    createBulkUnpublishAction as createBulkUnpublishActionNew,
    createBulkFeatureAction,
    createBulkUnfeatureAction,
    createBulkSetActiveAction,
    createBulkSetWipAction,
    createBulkArchiveAction,
    createBulkDeleteAction as createBulkDeleteActionNew,
} from './BulkActionsBar';

// Action Components
export { DataTableActions, type IDataTableAction } from './DataTableActions';

// Action Helpers (can be called from server components)
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
} from './action-helpers';

// Filter & Search Components
export { SearchFilter, type IFilterOption, type IFilterGroup } from './SearchFilter';

// Bulk Operations (Legacy)
export { BulkActions, type IBulkAction } from './BulkActions';

// Layout Components
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminHeader } from './AdminHeader';

// ===== Editor Components =====
// Premium content editing system with multiple modes and Cloudinary integration
export { HybridEditor, type EditorMode } from './HybridEditor';
export { MarkdownEditor } from './MarkdownEditor';
export { RichTextEditor } from './RichTextEditor';
export { ContentPreview } from './ContentPreview';
export { ImageUpload, type UploadedImage } from './ImageUpload';
