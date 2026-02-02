import type { IDataTableAction } from './DataTableActions';
import type { IBulkAction } from './BulkActions';

/**
 * Action Helper Functions
 * 
 * Pure functions for creating common admin table actions
 * These are NOT client components and can be called from server components
 * Icons are passed as strings to avoid serialization issues
 */

// ===== DataTable Action Helpers =====

export const createEditAction = (href: string): IDataTableAction => ({
    label: 'Edit',
    icon: 'Pencil',
    action: 'edit',
    href,
});

export const createDeleteAction = (
    onClick: () => Promise<void>,
    itemName?: string
): IDataTableAction => ({
    label: 'Delete',
    icon: 'Trash2',
    action: 'delete',
    variant: 'destructive',
    onClick,
    confirmMessage: `This will permanently delete ${itemName || 'this item'}. This action cannot be undone.`,
    confirmTitle: 'Delete Confirmation',
});

export const createTogglePublishedAction = (
    isPublished: boolean,
    onClick: () => Promise<void>
): IDataTableAction => ({
    label: isPublished ? 'Unpublish' : 'Publish',
    icon: isPublished ? 'EyeOff' : 'Eye',
    action: 'toggle-published',
    onClick,
});

export const createToggleFeaturedAction = (
    isFeatured: boolean,
    onClick: () => Promise<void>
): IDataTableAction => ({
    label: isFeatured ? 'Unfeature' : 'Feature',
    icon: isFeatured ? 'StarOff' : 'Star',
    action: 'toggle-featured',
    onClick,
});

export const createViewAction = (href: string): IDataTableAction => ({
    label: 'View',
    icon: 'ExternalLink',
    action: 'view',
    href,
});

export const createDuplicateAction = (onClick: () => Promise<void>): IDataTableAction => ({
    label: 'Duplicate',
    icon: 'Copy',
    action: 'duplicate',
    onClick,
});

// ===== Bulk Action Helpers =====

export const createBulkPublishAction = (
    onPublish: (ids: string[]) => Promise<void>
): IBulkAction => ({
    label: 'Publish',
    icon: 'Eye',
    variant: 'outline',
    action: 'publish',
    onClick: onPublish,
});

export const createBulkUnpublishAction = (
    onUnpublish: (ids: string[]) => Promise<void>
): IBulkAction => ({
    label: 'Unpublish',
    icon: 'EyeOff',
    variant: 'outline',
    action: 'unpublish',
    onClick: onUnpublish,
});

export const createBulkDeleteAction = (
    onDelete: (ids: string[]) => Promise<void>
): IBulkAction => ({
    label: 'Delete',
    icon: 'Trash2',
    variant: 'destructive',
    action: 'delete',
    onClick: onDelete,
    confirmRequired: true,
    confirmTitle: 'Delete Multiple Items',
    confirmMessage: 'This will permanently delete all selected items. This action cannot be undone.',
});


