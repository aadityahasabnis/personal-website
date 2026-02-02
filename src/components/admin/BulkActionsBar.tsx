'use client';

import { useTransition } from 'react';
import { X, Trash2, Eye, EyeOff, Star, StarOff, CheckCircle2, Clock, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ===== TYPES =====

export interface IBulkAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    action: (selectedIds: string[]) => Promise<void>;
    confirmRequired?: boolean;
    confirmTitle?: string;
    confirmMessage?: string;
}

export interface IBulkActionsBarProps {
    selectedCount: number;
    totalCount: number;
    actions: IBulkAction[];
    onClear: () => void;
    onAction: (action: IBulkAction) => Promise<void>;
    className?: string;
}

// ===== COMMON BULK ACTIONS =====

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

export const createBulkSetActiveAction = (
    onSetActive: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'set-active',
    label: 'Set Active',
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: 'outline',
    action: onSetActive,
});

export const createBulkSetWipAction = (
    onSetWip: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'set-wip',
    label: 'Set WIP',
    icon: <Clock className="h-4 w-4" />,
    variant: 'outline',
    action: onSetWip,
});

export const createBulkArchiveAction = (
    onArchive: (ids: string[]) => Promise<void>
): IBulkAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <Pause className="h-4 w-4" />,
    variant: 'outline',
    action: onArchive,
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

// ===== BULK ACTIONS BAR COMPONENT =====

export function BulkActionsBar({
    selectedCount,
    totalCount,
    actions,
    onClear,
    onAction,
    className,
}: IBulkActionsBarProps): React.ReactElement | null {
    const [isPending, startTransition] = useTransition();

    const handleAction = async (action: IBulkAction) => {
        if (action.confirmRequired) {
            const confirmed = window.confirm(
                action.confirmMessage || 'Are you sure you want to perform this action?'
            );
            if (!confirmed) return;
        }

        startTransition(async () => {
            await onAction(action);
        });
    };

    if (selectedCount === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
                'flex items-center gap-4 px-6 py-4 rounded-xl border bg-card shadow-2xl',
                'animate-in slide-in-from-bottom-4',
                className
            )}
        >
            {/* Selection Info */}
            <div className="flex items-center gap-2 pr-4 border-r border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {selectedCount}
                </div>
                <div className="text-sm">
                    <p className="font-medium">
                        {selectedCount} of {totalCount} selected
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => handleAction(action)}
                        disabled={isPending}
                        className="gap-2"
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}
            </div>

            {/* Clear Selection */}
            <button
                onClick={onClear}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear selection"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}
