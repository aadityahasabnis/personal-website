import type { IDataTableAction } from './DataTableActions';
import type { IBulkAction as IBulkActionLegacy } from './BulkActions';
import type { IBulkAction } from './BulkActionsBar';
import { Eye, EyeOff, Trash2, Star, StarOff } from 'lucide-react';

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

// ===== Bulk Action Helpers (New - for BulkActionsBar) =====

export const createBulkPublishAction = (
    onPublish: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'publish',
    label: 'Publish',
    icon: <Eye className="h-4 w-4" />,
    variant: 'default',
    action: onPublish,
});

export const createBulkUnpublishAction = (
    onUnpublish: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'unpublish',
    label: 'Unpublish',
    icon: <EyeOff className="h-4 w-4" />,
    variant: 'outline',
    action: onUnpublish,
});

export const createBulkDeleteAction = (
    onDelete: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    action: onDelete,
    confirmRequired: true,
    confirmTitle: 'Delete Multiple Items',
    confirmMessage: 'This will permanently delete all selected items. This action cannot be undone.',
});

export const createBulkFeatureAction = (
    onFeature: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'feature',
    label: 'Feature',
    icon: <Star className="h-4 w-4" />,
    variant: 'outline',
    action: onFeature,
});

export const createBulkUnfeatureAction = (
    onUnfeature: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'unfeature',
    label: 'Unfeature',
    icon: <StarOff className="h-4 w-4" />,
    variant: 'outline',
    action: onUnfeature,
});

// ===== Legacy Bulk Action Helpers (for old BulkActions component) =====

export const createBulkPublishActionLegacy = (
    onPublish: (ids: string[]) => Promise<void>
): IBulkActionLegacy => ({
    label: 'Publish',
    icon: 'Eye',
    variant: 'outline',
    action: 'publish',
    onClick: onPublish,
});

export const createBulkUnpublishActionLegacy = (
    onUnpublish: (ids: string[]) => Promise<void>
): IBulkActionLegacy => ({
    label: 'Unpublish',
    icon: 'EyeOff',
    variant: 'outline',
    action: 'unpublish',
    onClick: onUnpublish,
});

export const createBulkDeleteActionLegacy = (
    onDelete: (ids: string[]) => Promise<void>
): IBulkActionLegacy => ({
    label: 'Delete',
    icon: 'Trash2',
    variant: 'destructive',
    action: 'delete',
    onClick: onDelete,
    confirmRequired: true,
    confirmTitle: 'Delete Multiple Items',
    confirmMessage: 'This will permanently delete all selected items. This action cannot be undone.',
});


