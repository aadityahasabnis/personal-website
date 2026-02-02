// ===== Admin Components =====
// Reusable, professional components for the admin panel

// Core Components
export { StatusBadge } from './StatusBadge';
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';

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

// Bulk Operations
export { BulkActions, type IBulkAction } from './BulkActions';

// Layout Components
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminHeader } from './AdminHeader';
