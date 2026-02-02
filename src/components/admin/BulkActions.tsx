'use client';

import { useState, useTransition } from 'react';
import { Trash2, Eye, EyeOff, X, CheckSquare, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Icon mapping for serializable icon names from server components
const ICON_MAP: Record<string, LucideIcon> = {
    Trash2,
    Eye,
    EyeOff,
    CheckSquare,
};

export interface IBulkAction {
    label: string;
    icon: string; // Icon name as string
    variant?: 'default' | 'outline' | 'destructive';
    action: 'publish' | 'unpublish' | 'delete' | 'custom';
    onClick: (selectedIds: string[]) => Promise<void>;
    confirmRequired?: boolean;
    confirmTitle?: string;
    confirmMessage?: string;
}

interface IBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    actions: IBulkAction[];
    onClearSelection: () => void;
    selectedIds: string[];
    className?: string;
}

/**
 * BulkActions Component
 * 
 * Toolbar for performing bulk operations on selected items
 * Appears when items are selected in a table
 * 
 * @example
 * <BulkActions
 *   selectedCount={3}
 *   totalCount={10}
 *   selectedIds={['id1', 'id2', 'id3']}
 *   onClearSelection={() => setSelected([])}
 *   actions={[
 *     {
 *       label: 'Delete',
 *       icon: Trash2,
 *       variant: 'destructive',
 *       action: 'delete',
 *       onClick: handleBulkDelete,
 *       confirmRequired: true,
 *     },
 *   ]}
 * />
 */
export const BulkActions = ({
    selectedCount,
    totalCount,
    actions,
    onClearSelection,
    selectedIds,
    className,
}: IBulkActionsProps): React.ReactElement | null => {
    const [isPending, startTransition] = useTransition();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<IBulkAction | null>(null);

    // Don't render if nothing is selected
    if (selectedCount === 0) {
        return null;
    }

    const handleAction = (action: IBulkAction): void => {
        if (action.confirmRequired) {
            setPendingAction(action);
            setShowConfirmDialog(true);
        } else {
            executeAction(action);
        }
    };

    const executeAction = (action: IBulkAction): void => {
        startTransition(async () => {
            await action.onClick(selectedIds);
            onClearSelection();
        });
    };

    const confirmAction = (): void => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    return (
        <>
            {/* Bulk Actions Toolbar */}
            <div
                className={cn(
                    'sticky top-16 z-10 flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-md',
                    'animate-in fade-in slide-in-from-top-2',
                    className
                )}
            >
                {/* Selection Info */}
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <CheckSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                        </p>
                        <p className="text-xs text-muted-foreground">out of {totalCount} total</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions.map((action, index) => {
                        const IconComponent = ICON_MAP[action.icon] || CheckSquare;
                        return (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={() => handleAction(action)}
                                disabled={isPending}
                            >
                                <IconComponent className="h-4 w-4" />
                                {action.label}
                            </Button>
                        );
                    })}

                    {/* Clear Selection */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSelection}
                        disabled={isPending}
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction?.confirmTitle || 'Confirm Action'}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingAction?.confirmMessage ||
                                `Are you sure you want to perform this action on ${selectedCount} ${
                                    selectedCount === 1 ? 'item' : 'items'
                                }? This cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmAction}
                            disabled={isPending}
                        >
                            {isPending ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

