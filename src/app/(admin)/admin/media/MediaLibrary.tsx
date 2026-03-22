'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, Copy, Check, X, Grid, List, ImageIcon, Film, FileText, MoreVertical, Download, Pencil } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAdminTable } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSearch, BulkActionsBar, type IBulkActionNew } from '@/components/admin';
import { deleteMedia, bulkDeleteMedia, uploadMedia, updateMedia } from '@/server/actions/media';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ===== TYPES =====

type SerializedMedia = {
    _id?: string;
    filename: string;
    url: string;
    publicId: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    uploadedBy?: string;
    createdAt: string;
};

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video' | 'document';

interface IMediaLibraryProps {
    media: SerializedMedia[];
}

// ===== HELPERS =====

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getMediaType = (mimeType: string): FilterType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
};

const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    return FileText;
};

// ===== FILTERS =====

const FILTER_OPTIONS = [
    { value: 'all', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'document', label: 'Documents' },
] as const;

// ===== COMPONENT =====

export function MediaLibrary({ media }: IMediaLibraryProps): React.ReactElement {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [isUploading, setIsUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<SerializedMedia | null>(null);
    const [editDialog, setEditDialog] = useState<SerializedMedia | null>(null);
    const [editAlt, setEditAlt] = useState('');

    const table = useAdminTable({
        data: media,
        keyExtractor: (m) => m._id || m.publicId,
        searchFn: (item, query) =>
            item.filename.toLowerCase().includes(query) ||
            item.alt?.toLowerCase().includes(query) || false,
    });

    // Filter by type
    const filteredMedia = table.filteredItems.filter(m => 
        filterType === 'all' || getMediaType(m.mimeType) === filterType
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // ===== HANDLERS =====

    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                await uploadMedia(formData);
            }
            router.refresh();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [router]);

    const handleDelete = useCallback(async (id: string) => {
        await table.optimisticDelete(id, () => deleteMedia(id));
        if (selectedMedia?._id === id) setSelectedMedia(null);
    }, [table, selectedMedia]);

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        await bulkDeleteMedia(ids);
        table.clearSelection();
        router.refresh();
    }, [table, router]);

    const copyToClipboard = useCallback(async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const handleEditSave = useCallback(async () => {
        if (!editDialog?._id) return;
        await updateMedia({ id: editDialog._id, alt: editAlt });
        setEditDialog(null);
        router.refresh();
    }, [editDialog, editAlt, router]);

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        {
            id: 'delete',
            label: 'Delete Selected',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            action: handleBulkDelete,
        },
    ];

    // ===== RENDER =====

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <TableSearch
                        placeholder="Search media by filename..."
                        onSearch={table.setSearchQuery}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {/* Type Filter */}
                    <Select
                        value={filterType}
                        onValueChange={(value) => setFilterType(value as FilterType)}
                    >
                        <SelectTrigger className="h-10 w-[140px]">
                            <SelectValue placeholder="All Files" />
                        </SelectTrigger>
                        <SelectContent>
                            {FILTER_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="rounded-r-none"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="rounded-l-none"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>

            {/* Media Grid/List */}
            <div className="flex gap-6">
                <div className="flex-1">
                    {filteredMedia.length === 0 ? (
                        <EmptyState hasSearch={!!table.searchQuery || filterType !== 'all'} />
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredMedia.slice(0, table.displayCount).map((item) => (
                                <MediaCard
                                    key={item._id || item.publicId}
                                    media={item}
                                    isSelected={table.selectedIds.includes(item._id || item.publicId)}
                                    isCopied={copiedId === item._id}
                                    onSelect={() => table.toggleSelection(item._id || item.publicId)}
                                    onClick={() => setSelectedMedia(item)}
                                    onCopy={() => copyToClipboard(item.url, item._id || item.publicId)}
                                    onEdit={() => { setEditDialog(item); setEditAlt(item.alt || ''); }}
                                    onDelete={() => handleDelete(item._id!)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border bg-card divide-y">
                            {filteredMedia.slice(0, table.displayCount).map((item) => (
                                <MediaListItem
                                    key={item._id || item.publicId}
                                    media={item}
                                    isSelected={table.selectedIds.includes(item._id || item.publicId)}
                                    isCopied={copiedId === item._id}
                                    onSelect={() => table.toggleSelection(item._id || item.publicId)}
                                    onClick={() => setSelectedMedia(item)}
                                    onCopy={() => copyToClipboard(item.url, item._id || item.publicId)}
                                    onEdit={() => { setEditDialog(item); setEditAlt(item.alt || ''); }}
                                    onDelete={() => handleDelete(item._id!)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {filteredMedia.length > table.displayCount && (
                        <div className="flex justify-center mt-6">
                            <Button variant="outline" onClick={() => table.loadMore()}>
                                Load More ({filteredMedia.length - table.displayCount} remaining)
                            </Button>
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                {selectedMedia && (
                    <MediaPreview
                        media={selectedMedia}
                        onClose={() => setSelectedMedia(null)}
                        onCopy={() => copyToClipboard(selectedMedia.url, selectedMedia._id || selectedMedia.publicId)}
                        onDelete={() => handleDelete(selectedMedia._id!)}
                        isCopied={copiedId === selectedMedia._id}
                    />
                )}
            </div>

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={table.selectedIds.length}
                totalCount={filteredMedia.length}
                actions={bulkActions}
                onClear={table.clearSelection}
                onAction={async (action) => action.action(table.selectedIds)}
            />

            {/* Edit Dialog */}
            <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Media</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="alt" className="text-sm font-medium">Alt Text</label>
                            <Input
                                id="alt"
                                value={editAlt}
                                onChange={(e) => setEditAlt(e.target.value)}
                                placeholder="Describe the image for accessibility..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
                        <Button onClick={handleEditSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ===== SUB-COMPONENTS =====

interface MediaCardProps {
    media: SerializedMedia;
    isSelected: boolean;
    isCopied: boolean;
    onSelect: () => void;
    onClick: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function MediaCard({ media, isSelected, isCopied, onSelect, onClick, onCopy, onEdit, onDelete }: MediaCardProps) {
    const isImage = media.mimeType.startsWith('image/');
    const Icon = getMediaIcon(media.mimeType);

    return (
        <div
            className={cn(
                'group relative rounded-lg border bg-card overflow-hidden cursor-pointer transition-all',
                isSelected && 'ring-2 ring-primary'
            )}
        >
            {/* Checkbox */}
            <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
                <div className={cn(
                    'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/80 border-muted-foreground/50 hover:border-primary'
                )}>
                    {isSelected && <Check className="h-3 w-3" />}
                </div>
            </div>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onCopy}>
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {isCopied ? 'Copied!' : 'Copy URL'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Alt Text
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={media.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" /> Download
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Thumbnail */}
            <div className="aspect-square relative" onClick={onClick}>
                {isImage ? (
                    <Image
                        src={media.url}
                        alt={media.alt || media.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2 bg-card">
                <p className="text-xs font-medium truncate">{media.filename}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(media.size)}</p>
            </div>
        </div>
    );
}

interface MediaListItemProps {
    media: SerializedMedia;
    isSelected: boolean;
    isCopied: boolean;
    onSelect: () => void;
    onClick: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function MediaListItem({ media, isSelected, isCopied, onSelect, onClick, onCopy, onEdit, onDelete }: MediaListItemProps) {
    const isImage = media.mimeType.startsWith('image/');
    const Icon = getMediaIcon(media.mimeType);

    return (
        <div className={cn('flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors', isSelected && 'bg-primary/5')}>
            {/* Checkbox */}
            <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className="cursor-pointer">
                <div className={cn(
                    'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50 hover:border-primary'
                )}>
                    {isSelected && <Check className="h-3 w-3" />}
                </div>
            </div>

            {/* Thumbnail */}
            <div className="h-12 w-12 rounded overflow-hidden shrink-0 cursor-pointer" onClick={onClick}>
                {isImage ? (
                    <Image src={media.url} alt={media.alt || media.filename} width={48} height={48} className="object-cover h-full w-full" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
                <p className="font-medium truncate">{media.filename}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(media.size)} • {formatDate(new Date(media.createdAt))}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onCopy}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Alt Text
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={media.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" /> Download
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

interface MediaPreviewProps {
    media: SerializedMedia;
    onClose: () => void;
    onCopy: () => void;
    onDelete: () => void;
    isCopied: boolean;
}

function MediaPreview({ media, onClose, onCopy, onDelete, isCopied }: MediaPreviewProps) {
    const isImage = media.mimeType.startsWith('image/');
    const isVideo = media.mimeType.startsWith('video/');
    const Icon = getMediaIcon(media.mimeType);

    return (
        <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6 rounded-lg border bg-card overflow-hidden">
                {/* Preview */}
                <div className="relative aspect-video bg-muted">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    {isImage ? (
                        <Image src={media.url} alt={media.alt || media.filename} fill className="object-contain" />
                    ) : isVideo ? (
                        <video src={media.url} controls className="h-full w-full" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Icon className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-4">
                    <div>
                        <p className="font-medium truncate">{media.filename}</p>
                        <p className="text-sm text-muted-foreground">{media.mimeType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Size</p>
                            <p className="font-medium">{formatBytes(media.size)}</p>
                        </div>
                        {media.width && media.height && (
                            <div>
                                <p className="text-muted-foreground">Dimensions</p>
                                <p className="font-medium">{media.width} × {media.height}</p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Uploaded</p>
                            <p className="font-medium">{formatDate(new Date(media.createdAt))}</p>
                        </div>
                        {media.alt && (
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Alt Text</p>
                                <p className="font-medium">{media.alt}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={onCopy}>
                            {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                            {isCopied ? 'Copied!' : 'Copy URL'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={onDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <div className="rounded-lg border bg-card p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No media found</h3>
            <p className="mt-2 text-muted-foreground">
                {hasSearch ? 'Try adjusting your search or filters' : 'Upload images, videos, or documents to get started'}
            </p>
        </div>
    );
}
