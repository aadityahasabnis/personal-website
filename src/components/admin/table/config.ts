// =============================================================
// Admin Table Configuration Utilities
// =============================================================

import {
    Archive,
    ArrowDown,
    ArrowUp,
    Copy,
    Eye,
    EyeOff,
    Pencil,
    Star,
    StarOff,
    Trash2,
    Undo,
    type LucideIcon,
} from 'lucide-react';
import type {
    IBulkAction,
    IColumnConfig,
    IFilterConfig,
    IPaginationConfig,
    IReorderConfig,
    IRowAction,
    ITableConfig,
} from './types';

// =============================================================
// Column Builders
// =============================================================

export function createColumn<TData>(config: IColumnConfig<TData>): IColumnConfig<TData> {
    return {
        type: 'text',
        align: 'left',
        sortable: false,
        hidden: false,
        ...config,
    };
}

export function createTextColumn<TData>(
    id: string,
    header: string,
    accessor: keyof TData | ((row: TData) => string),
    options?: Partial<Omit<IColumnConfig<TData>, 'id' | 'header' | 'accessor' | 'type'>>
): IColumnConfig<TData> {
    return createColumn({
        id,
        header,
        accessor,
        type: 'text',
        ...options,
    });
}

export function createNumberColumn<TData>(
    id: string,
    header: string,
    accessor: keyof TData | ((row: TData) => number),
    options?: Partial<Omit<IColumnConfig<TData>, 'id' | 'header' | 'accessor' | 'type'>>
): IColumnConfig<TData> {
    return createColumn({
        id,
        header,
        accessor,
        type: 'number',
        align: 'right',
        ...options,
    });
}

export function createDateColumn<TData>(
    id: string,
    header: string,
    accessor: keyof TData | ((row: TData) => Date | string),
    options?: Partial<Omit<IColumnConfig<TData>, 'id' | 'header' | 'accessor' | 'type'>>
): IColumnConfig<TData> {
    return createColumn({
        id,
        header,
        accessor,
        type: 'date',
        ...options,
    });
}

export function createBadgeColumn<TData>(
    id: string,
    header: string,
    cell: (row: TData) => React.ReactNode,
    options?: Partial<Omit<IColumnConfig<TData>, 'id' | 'header' | 'cell' | 'type'>>
): IColumnConfig<TData> {
    return createColumn({
        id,
        header,
        cell,
        type: 'badge',
        ...options,
    });
}

export function createActionsColumn<TData>(
    options?: Partial<Omit<IColumnConfig<TData>, 'id' | 'header' | 'type'>>
): IColumnConfig<TData> {
    return createColumn({
        id: 'actions',
        header: '',
        type: 'actions',
        width: '60px',
        align: 'center',
        sticky: 'right',
        ...options,
    });
}

// =============================================================
// Row Action Builders
// =============================================================

export function createRowAction<TData>(action: IRowAction<TData>): IRowAction<TData> {
    return action;
}

export function createEditAction<TData>(
    href: string | ((row: TData) => string)
): IRowAction<TData> {
    return {
        id: 'edit',
        label: 'Edit',
        icon: Pencil,
        type: 'edit',
        href,
    };
}

export function createViewAction<TData>(
    href: string | ((row: TData) => string)
): IRowAction<TData> {
    return {
        id: 'view',
        label: 'View',
        icon: Eye,
        type: 'view',
        href,
    };
}

export function createDeleteAction<TData>(
    onClick: (row: TData) => Promise<void>,
    options?: {
        itemName?: string | ((row: TData) => string);
        confirmTitle?: string;
        confirmMessage?: string | ((row: TData) => string);
    }
): IRowAction<TData> {
    const getItemName = (row: TData) => 
        typeof options?.itemName === 'function' ? options.itemName(row) : options?.itemName ?? 'this item';

    return {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        type: 'delete',
        variant: 'destructive',
        onClick,
        confirm: {
            title: options?.confirmTitle ?? 'Delete Item',
            message: options?.confirmMessage ?? ((row: TData) => `Are you sure you want to delete ${getItemName(row)}? This action cannot be undone.`),
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
        },
        dividerBefore: true,
    };
}

export function createDuplicateAction<TData>(
    onClick: (row: TData) => Promise<void>
): IRowAction<TData> {
    return {
        id: 'duplicate',
        label: 'Duplicate',
        icon: Copy,
        type: 'duplicate',
        onClick,
    };
}

export function createPublishAction<TData>(
    onClick: (row: TData) => Promise<void>,
    isPublished: (row: TData) => boolean
): IRowAction<TData> {
    return {
        id: 'toggle-publish',
        label: (row: TData) => isPublished(row) ? 'Unpublish' : 'Publish',
        icon: (row: TData) => isPublished(row) ? EyeOff : Eye,
        type: (row: TData) => isPublished(row) ? 'unpublish' : 'publish',
        onClick,
    };
}

export function createFeatureAction<TData>(
    onClick: (row: TData) => Promise<void>,
    isFeatured: (row: TData) => boolean
): IRowAction<TData> {
    return {
        id: 'toggle-feature',
        label: (row: TData) => isFeatured(row) ? 'Unfeature' : 'Feature',
        icon: (row: TData) => isFeatured(row) ? StarOff : Star,
        type: (row: TData) => isFeatured(row) ? 'unfeature' : 'feature',
        onClick,
    };
}

export function createArchiveAction<TData>(
    onClick: (row: TData) => Promise<void>
): IRowAction<TData> {
    return {
        id: 'archive',
        label: 'Archive',
        icon: Archive,
        type: 'archive',
        onClick,
        dividerBefore: true,
    };
}

export function createRestoreAction<TData>(
    onClick: (row: TData) => Promise<void>
): IRowAction<TData> {
    return {
        id: 'restore',
        label: 'Restore',
        icon: Undo,
        type: 'restore',
        onClick,
    };
}

export function createMoveUpAction<TData>(
    onMoveUp: (row: TData) => Promise<void>,
    canMoveUp: (row: TData) => boolean
): IRowAction<TData> {
    return {
        id: 'move-up',
        label: 'Move Up',
        icon: ArrowUp,
        type: 'move-up',
        onClick: onMoveUp,
        isDisabled: (row) => !canMoveUp(row),
    };
}

export function createMoveDownAction<TData>(
    onMoveDown: (row: TData) => Promise<void>,
    canMoveDown: (row: TData) => boolean
): IRowAction<TData> {
    return {
        id: 'move-down',
        label: 'Move Down',
        icon: ArrowDown,
        type: 'move-down',
        onClick: onMoveDown,
        isDisabled: (row) => !canMoveDown(row),
    };
}

// =============================================================
// Bulk Action Builders
// =============================================================

export function createBulkAction<TData>(action: IBulkAction<TData>): IBulkAction<TData> {
    return action;
}

export function createBulkDeleteAction<TData>(
    onDelete: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-delete',
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: onDelete,
        confirm: {
            title: 'Delete Items',
            message: (count) => `Are you sure you want to delete ${count} items? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    };
}

export function createBulkPublishAction<TData>(
    onPublish: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-publish',
        label: 'Publish',
        icon: Eye,
        variant: 'default',
        onClick: onPublish,
    };
}

export function createBulkUnpublishAction<TData>(
    onUnpublish: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-unpublish',
        label: 'Unpublish',
        icon: EyeOff,
        variant: 'outline',
        onClick: onUnpublish,
    };
}

export function createBulkFeatureAction<TData>(
    onFeature: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-feature',
        label: 'Feature',
        icon: Star,
        variant: 'default',
        onClick: onFeature,
    };
}

export function createBulkUnfeatureAction<TData>(
    onUnfeature: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-unfeature',
        label: 'Unfeature',
        icon: StarOff,
        variant: 'outline',
        onClick: onUnfeature,
    };
}

export function createBulkArchiveAction<TData>(
    onArchive: (rows: TData[], ids: string[]) => Promise<void>
): IBulkAction<TData> {
    return {
        id: 'bulk-archive',
        label: 'Archive',
        icon: Archive,
        variant: 'outline',
        onClick: onArchive,
    };
}

// =============================================================
// Filter Builders
// =============================================================

export function createFilter(config: IFilterConfig): IFilterConfig {
    return config;
}

export function createSelectFilter(
    id: string,
    label: string,
    options: Array<{ label: string; value: string }>,
    defaultValue?: string
): IFilterConfig {
    return {
        id,
        label,
        type: 'select',
        options: [{ label: 'All', value: '' }, ...options],
        defaultValue,
    };
}

export function createBooleanFilter(
    id: string,
    label: string,
    options?: { trueLabel?: string; falseLabel?: string }
): IFilterConfig {
    return {
        id,
        label,
        type: 'select',
        options: [
            { label: 'All', value: '' },
            { label: options?.trueLabel ?? 'Yes', value: 'true' },
            { label: options?.falseLabel ?? 'No', value: 'false' },
        ],
    };
}

export function createStatusFilter(
    statuses: Array<{ label: string; value: string }>,
    options?: { id?: string; label?: string }
): IFilterConfig {
    return createSelectFilter(
        options?.id ?? 'status',
        options?.label ?? 'Status',
        statuses
    );
}

// =============================================================
// Pagination Builders
// =============================================================

export function createPaginationConfig(
    options?: Partial<IPaginationConfig>
): IPaginationConfig {
    return {
        mode: 'client',
        pageSize: 15,
        pageSizeOptions: [10, 15, 25, 50],
        showPageSizeSelector: true,
        showPageInfo: true,
        ...options,
    };
}

export function createInfiniteScrollConfig(
    options?: Partial<Omit<IPaginationConfig, 'mode'>>
): IPaginationConfig {
    return {
        mode: 'infinite',
        pageSize: 20,
        showPageSizeSelector: false,
        showPageInfo: false,
        ...options,
    };
}

// =============================================================
// Reorder Builders
// =============================================================

export function createReorderConfig<TData>(
    onReorder: IReorderConfig<TData>['onReorder'],
    options?: Partial<Omit<IReorderConfig<TData>, 'onReorder' | 'enabled'>>
): IReorderConfig<TData> {
    return {
        enabled: true,
        mode: 'both',
        onReorder,
        ...options,
    };
}

// =============================================================
// Table Config Builder
// =============================================================

export function createTableConfig<TData>(
    config: ITableConfig<TData>
): ITableConfig<TData> {
    return {
        selectable: false,
        searchable: true,
        searchPlaceholder: 'Search...',
        stickyHeader: true,
        striped: false,
        bordered: false,
        compact: false,
        pagination: createPaginationConfig(),
        ...config,
    };
}

// =============================================================
// Icon Resolution Utility
// =============================================================

const ICON_MAP: Record<string, LucideIcon> = {
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Copy,
    Archive,
    Undo,
    ArrowUp,
    ArrowDown,
};

export function resolveIcon(icon: LucideIcon | string | undefined): LucideIcon | undefined {
    if (!icon) return undefined;
    if (typeof icon === 'string') return ICON_MAP[icon];
    return icon;
}

// =============================================================
// Label Resolution Utility
// =============================================================

export function resolveLabel<TData>(
    label: string | ((row: TData) => string),
    row: TData
): string {
    return typeof label === 'function' ? label(row) : label;
}

export function resolveHref<TData>(
    href: string | ((row: TData) => string) | undefined,
    row: TData
): string | undefined {
    if (!href) return undefined;
    return typeof href === 'function' ? href(row) : href;
}
