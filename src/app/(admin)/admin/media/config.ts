// =============================================================
// Media Table Configuration
// =============================================================

import { FileText, Film, ImageIcon } from 'lucide-react';

import {
    createBulkAction,
    createColumn,
    createDeleteAction,
    createPaginationConfig,
    createSelectFilter,
    createTableConfig,
    createViewAction,
    type IBulkAction,
    type IColumnConfig,
    type IDataTableSkeletonProps,
    type IFilterConfig,
    type IRowAction,
    type ITableConfig,
} from '@/components/admin/table';
import { MEDIA_FOLDERS } from '@/constants/mediaConstants';
import type { IAdminMediaRow, MediaFilter } from '@/server/new/admin/media';

// =============================================================
// Table Keys
// =============================================================

export const MEDIA_TABLE_KEY = 'admin-media';
export const MEDIA_QUERY_KEY = ['admin', 'media'] as const;

// =============================================================
// Search Fields
// =============================================================

export const MEDIA_SEARCH_FIELDS: (keyof IAdminMediaRow)[] = [
    'fileName',
    'mimeType',
    'folder',
    'description',
    'altText',
    'tags',
];

// =============================================================
// Filters
// =============================================================

export const MEDIA_FILTER_OPTIONS: Array<{ label: string; value: MediaFilter }> = [
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' },
    { label: 'Files', value: 'file' },
    { label: 'Root Folder', value: MEDIA_FOLDERS.ROOT },
    { label: 'Blog Folder', value: MEDIA_FOLDERS.BLOG },
    { label: 'Articles Folder', value: MEDIA_FOLDERS.ARTICLES },
    { label: 'Projects Folder', value: MEDIA_FOLDERS.PROJECTS },
    { label: 'Gallery Folder', value: MEDIA_FOLDERS.GALLERY },
    { label: 'Documents Folder', value: MEDIA_FOLDERS.DOCUMENTS },
];

export const MEDIA_FILTERS: IFilterConfig[] = [
    createSelectFilter('filter', 'Type / Folder', MEDIA_FILTER_OPTIONS),
];

// =============================================================
// Columns
// =============================================================

export const createMediaColumns = (): IColumnConfig<IAdminMediaRow>[] => [
    createColumn<IAdminMediaRow>({
        id: 'preview',
        header: 'Preview',
        width: '88px',
        minWidth: '88px',
    }),
    createColumn<IAdminMediaRow>({
        id: 'fileName',
        header: 'File',
        width: '320px',
        minWidth: '260px',
        sortable: true,
    }),
    createColumn<IAdminMediaRow>({
        id: 'fileType',
        header: 'Type',
        width: '120px',
        align: 'center',
        sortable: true,
    }),
    createColumn<IAdminMediaRow>({
        id: 'folder',
        header: 'Folder',
        width: '150px',
        sortable: true,
    }),
    createColumn<IAdminMediaRow>({
        id: 'size',
        header: 'Size',
        width: '110px',
        align: 'right',
        sortable: true,
    }),
    createColumn<IAdminMediaRow>({
        id: 'updatedAt',
        header: 'Updated',
        width: '170px',
        sortable: true,
    }),
];

// =============================================================
// Row Actions
// =============================================================

export interface IMediaActionHandlers {
    onEdit: (media: IAdminMediaRow) => Promise<void>;
    onDelete: (media: IAdminMediaRow) => Promise<void>;
}

export const createMediaRowActions = (
    handlers: IMediaActionHandlers,
): IRowAction<IAdminMediaRow>[] => [
    {
        id: 'edit-metadata',
        label: 'Edit Metadata',
        icon: 'Pencil',
        type: 'custom',
        onClick: handlers.onEdit,
    },
    createViewAction<IAdminMediaRow>((media) => media.publicUrl),
    createDeleteAction<IAdminMediaRow>(handlers.onDelete, {
        itemName: (media) => media.fileName,
        confirmTitle: 'Delete Media',
        confirmMessage: (media) =>
            `Are you sure you want to delete "${media.fileName}"? This action cannot be undone.`,
    }),
];

// =============================================================
// Bulk Actions
// =============================================================

export interface IMediaBulkActionHandlers {
    onBulkDelete: (rows: IAdminMediaRow[], ids: string[]) => Promise<void>;
}

export const createMediaBulkActions = (
    handlers: IMediaBulkActionHandlers,
): IBulkAction<IAdminMediaRow>[] => [
    createBulkAction<IAdminMediaRow>({
        id: 'bulk-delete',
        label: 'Delete',
        icon: FileText,
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Media Files',
            message: (count) =>
                `Are you sure you want to delete ${count} selected media file${count === 1 ? '' : 's'}? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Table Factory
// =============================================================

export interface IMediaTableConfigOptions {
    rowActions: IMediaActionHandlers;
    bulkActions: IMediaBulkActionHandlers;
}

export const createMediaTableConfig = (
    options: IMediaTableConfigOptions,
): ITableConfig<IAdminMediaRow> =>
    createTableConfig<IAdminMediaRow>({
        tableKey: MEDIA_TABLE_KEY,
        queryKey: MEDIA_QUERY_KEY,
        keyExtractor: (media) => media.id,
        columns: createMediaColumns(),
        rowActions: createMediaRowActions(options.rowActions),
        bulkActions: createMediaBulkActions(options.bulkActions),
        selectable: true,
        searchable: true,
        searchPlaceholder: 'Search media by file name, tags, or metadata...',
        searchFields: MEDIA_SEARCH_FIELDS,
        filters: MEDIA_FILTERS,
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 20,
            pageSizeOptions: [10, 20, 40, 80],
        }),
        emptyState: {
            icon: ImageIcon,
            title: 'No media files found',
            description: 'Upload your first file to start building the media library.',
        },
        stickyHeader: true,
        striped: false,
    });

// =============================================================
// Skeleton
// =============================================================

export const MEDIA_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IAdminMediaRow> = {
    columns: createMediaColumns(),
    rowCount: 20,
    showSearch: true,
    showSelection: true,
    showActions: true,
};

export const MEDIA_TYPE_ICON_MAP = {
    image: ImageIcon,
    video: Film,
    file: FileText,
} as const;
