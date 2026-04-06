'use client';

// =============================================================
// BulkActionsBar - Sticky Bar for Bulk Operations
// =============================================================

import { useState, useTransition } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { IBulkAction, IBulkActionsBarProps } from './types';
import { useTableContext } from './DataTable';

// =============================================================
// Button Variant Styles
// =============================================================

const BULK_ACTION_BUTTON_STYLES: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-success text-white hover:bg-success/90',
    warning: 'bg-warning text-white hover:bg-warning/90',
};

// =============================================================
// BulkActionsBar Component
// =============================================================

export function BulkActionsBar<TData>({
    selectedCount,
    totalCount,
    selectedRows,
    selectedIds,
    actions,
    onClear,
    className,
}: IBulkActionsBarProps<TData>): React.ReactElement | null {
    const [isPending, startTransition] = useTransition();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<IBulkAction<TData> | null>(null);
    
    // Get table context to invalidate after bulk actions
    const tableContext = useTableContext<TData>();

    if (selectedCount === 0) return null;

    // Filter visible actions
    const visibleActions = actions.filter(action => {
        if (action.isVisible && !action.isVisible(selectedRows)) return false;
        return true;
    });

    // =============================================================
    // Action Handlers
    // =============================================================

    const handleAction = (action: IBulkAction<TData>) => {
        if (action.confirm) {
            setPendingAction(action);
            setShowConfirmDialog(true);
            return;
        }
        executeAction(action);
    };

    const executeAction = (action: IBulkAction<TData>) => {
        startTransition(async () => {
            await action.onClick(selectedRows, selectedIds);
            // Invalidate cache to refresh data after bulk mutation
            await tableContext.invalidate();
            onClear();
        });
    };

    const confirmAction = () => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    // =============================================================
    // Confirmation Dialog Content
    // =============================================================

    const getConfirmationMessage = () => {
        if (!pendingAction?.confirm) return '';
        const message = pendingAction.confirm.message;
        return typeof message === 'function' ? message(selectedCount) : message;
    };

    // =============================================================
    // Render
    // =============================================================

    return (
        <>
            {/* Bulk Actions Bar */}
            <div
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 animate-fade-in-up',
                    'border-t border-border bg-card/95 backdrop-blur-sm',
                    'shadow-lg shadow-black/10',
                    className
                )}
            >
                <div className="container-wide flex items-center justify-between gap-4 py-3">
                    {/* Selection Info */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onClear}
                            className="h-8 w-8"
                            aria-label="Clear selection"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                            {selectedCount} of {totalCount} selected
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {visibleActions.map((action) => {
                            const isDisabled = action.isDisabled?.(selectedRows) || isPending;
                            const Icon = action.icon;
                            const variant = action.variant ?? 'secondary';
                            
                            // Use custom styles for success/warning variants
                            const useCustomStyle = variant === 'success' || variant === 'warning';
                            const buttonVariant = useCustomStyle ? 'secondary' : 
                                variant === 'destructive' ? 'destructive' :
                                variant === 'outline' ? 'outline' : 
                                variant === 'default' ? 'default' : 'secondary';

                            return (
                                <Button
                                    key={action.id}
                                    variant={buttonVariant}
                                    size="sm"
                                    onClick={() => handleAction(action)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'gap-1.5',
                                        useCustomStyle && BULK_ACTION_BUTTON_STYLES[variant],
                                        isPending && 'opacity-70'
                                    )}
                                >
                                    {isPending && action === pendingAction ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : Icon ? (
                                        <Icon className="h-4 w-4" />
                                    ) : null}
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                pendingAction?.variant === 'destructive' ? 'bg-destructive/10' : 
                                pendingAction?.variant === 'warning' ? 'bg-warning/10' : 'bg-muted'
                            )}>
                                <AlertTriangle className={cn(
                                    'h-5 w-5',
                                    pendingAction?.variant === 'destructive' ? 'text-destructive' : 
                                    pendingAction?.variant === 'warning' ? 'text-warning' : 'text-foreground'
                                )} />
                            </div>
                            <div>
                                <DialogTitle>
                                    {pendingAction?.confirm?.title ?? 'Confirm Action'}
                                </DialogTitle>
                                <DialogDescription>
                                    {getConfirmationMessage()}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isPending}
                        >
                            {pendingAction?.confirm?.cancelLabel ?? 'Cancel'}
                        </Button>
                        <Button
                            variant={pendingAction?.variant === 'destructive' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            disabled={isPending}
                            className={cn(
                                pendingAction?.variant === 'success' && BULK_ACTION_BUTTON_STYLES.success,
                                pendingAction?.variant === 'warning' && BULK_ACTION_BUTTON_STYLES.warning
                            )}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                pendingAction?.confirm?.confirmLabel ?? 'Confirm'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default BulkActionsBar;
