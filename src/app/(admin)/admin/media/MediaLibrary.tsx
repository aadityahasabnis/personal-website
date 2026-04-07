'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FileText, Film, HardDrive, ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';

import { DataTable } from '@/components/admin/table';
import { type IFieldConfig } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_ALLOWED_MIME_TYPES, MEDIA_FOLDER_OPTIONS, MEDIA_UPLOAD_LIMITS, type MediaFileType, type MediaFolder } from '@/constants/mediaConstants';
import { useDialog } from '@/hooks';
import { useSnackbar } from '@/hooks/form';
import { useAction } from '@/hooks/server/useAction';
import type { IApiResponse, IFormData } from '@/interfaces/actionHelper';
import { formatDate } from '@/lib/utils';
import { deleteMedia, getMedia, updateMedia, uploadMedia, type IAdminMediaRow, type IMediaStats, type IUpdateMediaInput, type IUploadMediaInput } from '@/server/new/admin/media';

import { MEDIA_QUERY_KEY, MEDIA_TYPE_ICON_MAP, createMediaTableConfig, type IMediaActionHandlers, type IMediaBulkActionHandlers } from './config';

interface IMediaLibraryProps {
    initialData?: IAdminMediaRow[] | undefined;
    initialTotal?: number | undefined;
    stats?: IMediaStats | null | undefined;
}

interface IBulkDeleteResult {
    deletedCount: number;
}

interface IMediaMetadataFormData extends IFormData {
    altText?: string;
    description?: string;
    tags: string[];
}

const ACCEPTED_MEDIA_TYPES = ALL_ALLOWED_MIME_TYPES.join(',');

const TYPE_BADGE_CLASS: Record<MediaFileType, string> = {
    image: 'bg-primary/10 text-primary',
    video: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    file: 'bg-muted text-muted-foreground',
};

const normalizeOptionalString = (value: string): string | null => {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

const normalizeTags = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((tag) => (typeof tag === 'string' ? tag.trim() : String(tag).trim()))
        .filter((tag) => tag.length > 0)
        .slice(0, MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT);
};

const toFolderLabel = (folder: string): string => {
    if (!folder) return 'Unknown';
    return `${folder.charAt(0).toUpperCase()}${folder.slice(1)}`;
};

function MediaStatsCards({ stats }: { stats?: IMediaStats | null | undefined }): React.ReactElement | null {
    if (!stats) return null;

    const cards = [
        {
            title: 'Images',
            value: stats.byType.image.count.toLocaleString(),
            icon: ImageIcon,
            tone: 'bg-primary/10 text-primary',
        },
        {
            title: 'Videos',
            value: stats.byType.video.count.toLocaleString(),
            icon: Film,
            tone: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        },
        {
            title: 'Files',
            value: stats.byType.file.count.toLocaleString(),
            icon: FileText,
            tone: 'bg-warning/15 text-warning',
        },
        {
            title: 'Storage Used',
            value: stats.totalSizeFormatted,
            icon: HardDrive,
            tone: 'bg-success/15 text-success',
        },
    ] as const;

    return (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div key={card.title} className='rounded-xl border border-border bg-card p-4'>
                        <div className='flex items-center justify-between'>
                            <p className='text-small text-muted-foreground'>{card.title}</p>
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.tone}`}>
                                <Icon className='h-4 w-4' />
                            </span>
                        </div>
                        <p className='mt-2 text-h3 font-semibold text-foreground'>{card.value}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function MediaLibrary({ initialData, initialTotal, stats }: IMediaLibraryProps): React.ReactElement {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showError, showLoading, showSuccess, dismiss } = useSnackbar();
    const { openForm } = useDialog();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadFolder, setUploadFolder] = useState<MediaFolder>('root');
    const [isUploading, setIsUploading] = useState(false);

    const deleteAction = useAction({
        action: async (media: IAdminMediaRow) => deleteMedia(media.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Media deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete media');
        },
    });

    const updateAction = useAction({
        action: async (input: IUpdateMediaInput) => updateMedia(input),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Media metadata updated successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to update media metadata');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IAdminMediaRow[], ids: string[]): Promise<IApiResponse<IBulkDeleteResult>> => {
            let deletedCount = 0;
            let failedCount = 0;

            for (const id of ids) {
                const response = await deleteMedia(id);
                if (response.success || response.status === 404) {
                    deletedCount += 1;
                } else {
                    failedCount += 1;
                }
            }

            if (failedCount > 0) {
                return {
                    success: false,
                    status: 500,
                    error: `Failed to delete ${failedCount} media file${failedCount === 1 ? '' : 's'}.`,
                };
            }

            return {
                success: true,
                status: 200,
                data: { deletedCount },
                message: `${deletedCount} media file${deletedCount === 1 ? '' : 's'} deleted successfully.`,
            };
        },
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Selected media deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete selected media');
        },
    });

    const uploadAction = useAction({
        action: async (input: IUploadMediaInput) => uploadMedia(input),
    });

    const metadataFormFields = useMemo<Array<IFieldConfig<IMediaMetadataFormData>>>(
        () => [
            {
                fieldtype: 'input',
                name: 'altText',
                label: 'Alt Text',
                placeholder: 'Describe this media for accessibility',
                hint: 'Optional, but recommended for images and accessibility.',
                colsize: 'full',
            },
            {
                fieldtype: 'textArea',
                name: 'description',
                label: 'Description',
                placeholder: 'Optional internal description',
                rows: 4,
                colsize: 'full',
            },
            {
                fieldtype: 'tagInput',
                name: 'tags',
                label: 'Tags',
                placeholder: 'Type and press Enter…',
                maxTags: MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT,
                hint: `Maximum ${MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT} tags.`,
                colsize: 'full',
            },
        ],
        [],
    );

    const openEditDialog = useCallback(
        async (media: IAdminMediaRow): Promise<void> => {
            openForm<IMediaMetadataFormData>({
                title: 'Edit Media Metadata',
                description: `Update alt text, description, and tags for ${media.fileName}.`,
                width: 'lg',
                submitLabel: 'Save Metadata',
                cancelLabel: 'Cancel',
                defaultValues: {
                    altText: media.altText ?? '',
                    description: media.description ?? '',
                    tags: media.tags,
                },
                fields: metadataFormFields,
                onSubmit: async (formData) => {
                    const response = await updateAction.mutateAsync({
                        id: media.id,
                        description: normalizeOptionalString(typeof formData.description === 'string' ? formData.description : ''),
                        altText: normalizeOptionalString(typeof formData.altText === 'string' ? formData.altText : ''),
                        tags: normalizeTags(formData.tags),
                    });

                    if (!response.success) {
                        throw new Error(response.error);
                    }

                    await queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
                },
            });
        },
        [metadataFormFields, openForm, queryClient, updateAction.mutateAsync],
    );

    const rowActionHandlers: IMediaActionHandlers = useMemo(
        () => ({
            onEdit: openEditDialog,
            onDelete: async (media: IAdminMediaRow) => {
                await deleteAction.mutateAsync(media);
            },
        }),
        [deleteAction.mutateAsync, openEditDialog],
    );

    const bulkActionHandlers: IMediaBulkActionHandlers = useMemo(
        () => ({
            onBulkDelete: async (rows: IAdminMediaRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkDeleteAction.mutateAsync],
    );

    const config = useMemo(() => {
        const baseConfig = createMediaTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        const columnsWithRenderers = baseConfig.columns.map((column) => {
            if (column.id === 'preview') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => {
                        const TypeIcon = MEDIA_TYPE_ICON_MAP[media.fileType];

                        return (
                            <div className='relative h-10 w-10 overflow-hidden rounded-md border border-border bg-muted'>
                                {media.fileType === 'image' ? (
                                    <Image src={media.publicUrl} alt={media.altText ?? media.fileName} fill unoptimized className='object-cover' sizes='40px' />
                                ) : (
                                    <div className='flex h-full w-full items-center justify-center text-muted-foreground'>
                                        <TypeIcon className='h-4 w-4' />
                                    </div>
                                )}
                            </div>
                        );
                    },
                };
            }

            if (column.id === 'fileName') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => {
                        const metaText = media.altText ?? media.description ?? media.mimeType;

                        return (
                            <div className='min-w-0'>
                                <a href={media.publicUrl} target='_blank' rel='noopener noreferrer' className='block truncate font-medium hover:text-foreground hover:underline'>
                                    {media.fileName}
                                </a>
                                <p className='line-clamp-1 text-small text-muted-foreground'>{metaText}</p>
                            </div>
                        );
                    },
                };
            }

            if (column.id === 'fileType') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-small font-medium capitalize ${TYPE_BADGE_CLASS[media.fileType]}`}>{media.fileType}</span>
                    ),
                };
            }

            if (column.id === 'folder') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => <span className='text-small text-muted-foreground'>{toFolderLabel(media.folder)}</span>,
                };
            }

            if (column.id === 'size') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => <span className='text-small font-medium text-foreground'>{media.sizeFormatted}</span>,
                };
            }

            if (column.id === 'updatedAt') {
                return {
                    ...column,
                    cell: (media: IAdminMediaRow) => <span className='text-small text-muted-foreground'>{formatDate(media.updatedAt)}</span>,
                };
            }

            return column;
        });

        return {
            ...baseConfig,
            columns: columnsWithRenderers,
        };
    }, [bulkActionHandlers, rowActionHandlers]);

    const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setIsUploading(true);
        const loadingToast = showLoading(files.length === 1 ? 'Uploading media file...' : `Uploading ${files.length} media files...`);

        let uploadedCount = 0;
        let failedCount = 0;

        for (const file of files) {
            const response = await uploadAction.mutateAsync({
                file,
                folder: uploadFolder,
            });

            if (response.success) {
                uploadedCount += 1;
            } else {
                failedCount += 1;
            }
        }

        dismiss(loadingToast);
        setIsUploading(false);
        event.target.value = '';

        if (uploadedCount > 0) {
            showSuccess(`${uploadedCount} media file${uploadedCount === 1 ? '' : 's'} uploaded successfully.`);
            await queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
            router.refresh();
        }

        if (failedCount > 0) {
            showError(`Failed to upload ${failedCount} media file${failedCount === 1 ? '' : 's'}.`);
        }
    };

    return (
        <div className='space-y-5'>
            <MediaStatsCards stats={stats} />

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
                <Select value={uploadFolder} onValueChange={(value) => setUploadFolder(value as MediaFolder)} disabled={isUploading}>
                    <SelectTrigger className='h-9 w-44'>
                        <SelectValue placeholder='Select folder' />
                    </SelectTrigger>
                    <SelectContent>
                        {MEDIA_FOLDER_OPTIONS.map((folder) => (
                            <SelectItem key={folder} value={folder}>
                                {toFolderLabel(folder)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <input ref={fileInputRef} type='file' multiple accept={ACCEPTED_MEDIA_TYPES} className='hidden' onChange={handleFileSelection} />

                <Button type='button' onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className='h-4 w-4' />
                    {isUploading ? 'Uploading...' : 'Upload Media'}
                </Button>
            </div>

            <DataTable config={config} serverAction={getMedia} initialData={initialData} initialTotal={initialTotal} />
        </div>
    );
}

export default MediaLibrary;
