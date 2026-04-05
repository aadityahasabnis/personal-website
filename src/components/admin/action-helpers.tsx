import { Eye, EyeOff, Star, StarOff, Trash2 } from 'lucide-react';
import type { IBulkAction as IBulkActionLegacy } from './BulkActions';
import type { IBulkAction } from './BulkActionsBar';
import type { IDataTableAction } from './table/DataTableActions';

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

export const createDeleteAction = (onClick: () => Promise<unknown>, itemName?: string): IDataTableAction => ({
    label: 'Delete',
    icon: 'Trash2',
    action: 'delete',
    variant: 'destructive',
    onClick: () => onClick() as unknown as Promise<void>,
    confirmMessage: `This will permanently delete ${itemName || 'this item'}. This action cannot be undone.`,
    confirmTitle: 'Delete Confirmation',
});

export const createTogglePublishedAction = (isPublished: boolean, onClick: () => Promise<unknown>): IDataTableAction => ({
    label: isPublished ? 'Unpublish' : 'Publish',
    icon: isPublished ? 'EyeOff' : 'Eye',
    action: 'toggle-published',
    onClick: () => onClick() as unknown as Promise<void>,
});

export const createToggleFeaturedAction = (isFeatured: boolean, onClick: () => Promise<unknown>): IDataTableAction => ({
    label: isFeatured ? 'Unfeature' : 'Feature',
    icon: isFeatured ? 'StarOff' : 'Star',
    action: 'toggle-featured',
    onClick: () => onClick() as unknown as Promise<void>,
});

export const createViewAction = (href: string): IDataTableAction => ({
    label: 'View',
    icon: 'ExternalLink',
    action: 'view',
    href,
});

export const createDuplicateAction = (onClick: () => Promise<unknown>): IDataTableAction => ({
    label: 'Duplicate',
    icon: 'Copy',
    action: 'duplicate',
    onClick: () => onClick() as unknown as Promise<void>,
});

// ===== Bulk Action Helpers (New - for BulkActionsBar) =====

export const createBulkPublishAction = (onPublish: (ids: string[]) => Promise<unknown>): IBulkAction => ({
    id: 'publish',
    label: 'Publish',
    icon: <Eye className='h-4 w-4' />,
    variant: 'default',
    action: (ids) => onPublish(ids) as unknown as Promise<void>,
});

export const createBulkUnpublishAction = (onUnpublish: (ids: string[]) => Promise<unknown>): IBulkAction => ({
    id: 'unpublish',
    label: 'Unpublish',
    icon: <EyeOff className='h-4 w-4' />,
    variant: 'outline',
    action: (ids) => onUnpublish(ids) as unknown as Promise<void>,
});

export const createBulkDeleteAction = (onDelete: (ids: string[]) => Promise<unknown>): IBulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className='h-4 w-4' />,
    variant: 'destructive',
    action: (ids) => onDelete(ids) as unknown as Promise<void>,
    confirmRequired: true,
    confirmTitle: 'Delete Multiple Items',
    confirmMessage: 'This will permanently delete all selected items. This action cannot be undone.',
});

export const createBulkFeatureAction = (onFeature: (ids: string[]) => Promise<unknown>): IBulkAction => ({
    id: 'feature',
    label: 'Feature',
    icon: <Star className='h-4 w-4' />,
    variant: 'outline',
    action: (ids) => onFeature(ids) as unknown as Promise<void>,
});

export const createBulkUnfeatureAction = (onUnfeature: (ids: string[]) => Promise<unknown>): IBulkAction => ({
    id: 'unfeature',
    label: 'Unfeature',
    icon: <StarOff className='h-4 w-4' />,
    variant: 'outline',
    action: (ids) => onUnfeature(ids) as unknown as Promise<void>,
});

// ===== Legacy Bulk Action Helpers (for old BulkActions component) =====

export const createBulkPublishActionLegacy = (onPublish: (ids: string[]) => Promise<unknown>): IBulkActionLegacy => ({
    label: 'Publish',
    icon: 'Eye',
    variant: 'outline',
    action: 'publish',
    onClick: (ids) => onPublish(ids) as unknown as Promise<void>,
});

export const createBulkUnpublishActionLegacy = (onUnpublish: (ids: string[]) => Promise<unknown>): IBulkActionLegacy => ({
    label: 'Unpublish',
    icon: 'EyeOff',
    variant: 'outline',
    action: 'unpublish',
    onClick: (ids) => onUnpublish(ids) as unknown as Promise<void>,
});

export const createBulkDeleteActionLegacy = (onDelete: (ids: string[]) => Promise<unknown>): IBulkActionLegacy => ({
    label: 'Delete',
    icon: 'Trash2',
    variant: 'destructive',
    action: 'delete',
    onClick: (ids) => onDelete(ids) as unknown as Promise<void>,
    confirmRequired: true,
    confirmTitle: 'Delete Multiple Items',
    confirmMessage: 'This will permanently delete all selected items. This action cannot be undone.',
});
