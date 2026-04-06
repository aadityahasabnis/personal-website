'use client';

// =============================================================
// DataTableActions - Row Actions Dropdown with Reorder Support
// =============================================================

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    Eye,
    EyeOff,
    ExternalLink,
    MoreHorizontal,
    Pencil,
    Star,
    StarOff,
    Trash2,
    Archive,
    Undo,
    Loader2,
    type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { IDataTableActionsProps, IRowAction } from './types';
import { useTableContext } from './DataTable';

// =============================================================
// Icon Registry
// =============================================================

const ICON_MAP: Record<string, LucideIcon> = {
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Copy,
    ExternalLink,
    Archive,
    Undo,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
};

// =============================================================
// Button Variant Styles for Confirmation Dialog
// =============================================================

const DIALOG_BUTTON_STYLES: Record<string, string> = {
    success: 'bg-success text-white hover:bg-success/90',
    warning: 'bg-warning text-white hover:bg-warning/90',
};

// =============================================================
// Helper Functions
// =============================================================

function resolveIcon<TData>(
    icon: LucideIcon | string | ((row: TData) => LucideIcon) | undefined,
    row: TData
): LucideIcon | undefined {
    if (!icon) return undefined;
    if (typeof icon === 'string') return ICON_MAP[icon];
    if (typeof icon === 'function') {
        const result = (icon as (row: TData) => LucideIcon)(row);
        return result;
    }
    return icon as LucideIcon;
}

function resolveLabel<TData>(
    label: string | ((row: TData) => string),
    row: TData
): string {
    return typeof label === 'function' ? label(row) : label;
}

function resolveHref<TData>(
    href: string | ((row: TData) => string) | undefined,
    row: TData
): string | undefined {
    if (!href) return undefined;
    return typeof href === 'function' ? href(row) : href;
}

// =============================================================
// Confirmation Dialog Variants
// =============================================================

const CONFIRMATION_VARIANTS: Record<string, { icon: LucideIcon; iconClass: string; bgClass: string }> = {
    destructive: { icon: AlertTriangle, iconClass: 'text-destructive', bgClass: 'bg-destructive/10' },
    success: { icon: CheckCircle2, iconClass: 'text-success', bgClass: 'bg-success/10' },
    warning: { icon: AlertTriangle, iconClass: 'text-warning', bgClass: 'bg-warning/10' },
    default: { icon: AlertTriangle, iconClass: 'text-foreground', bgClass: 'bg-muted' },
};

// =============================================================
// Dropdown Item Variant Styles
// =============================================================

const DROPDOWN_ITEM_STYLES: Record<string, string> = {
    destructive: 'text-destructive focus:bg-destructive/10 focus:text-destructive',
    success: 'text-success focus:bg-success/10 focus:text-success',
    warning: 'text-warning focus:bg-warning/10 focus:text-warning',
    default: '',
};

// =============================================================
// DataTableActions Component
// =============================================================

export function DataTableActions<TData>({
    row,
    actions,
    canMoveUp = false,
    canMoveDown = false,
    onMoveUp,
    onMoveDown,
    isReordering = false,
    reorderMode,
    className,
}: IDataTableActionsProps<TData>): React.ReactElement {
    const [isPending, startTransition] = useTransition();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<IRowAction<TData> | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    
    // Get table context to invalidate after actions
    const tableContext = useTableContext<TData>();

    // Filter visible actions
    const visibleActions = actions.filter(action => {
        if (action.isVisible && !action.isVisible(row)) return false;
        return true;
    });

    // Check if we should show reorder buttons in the menu
    const showReorderInMenu = reorderMode === 'buttons' || reorderMode === 'both';

    // =============================================================
    // Action Handlers
    // =============================================================

    const handleAction = (action: IRowAction<TData>) => {
        if (action.confirm) {
            setPendingAction(action);
            setShowConfirmDialog(true);
            setIsOpen(false);
            return;
        }
        executeAction(action);
    };

    const executeAction = (action: IRowAction<TData>) => {
        if (action.onClick) {
            startTransition(async () => {
                await action.onClick?.(row);
                // Invalidate cache to refresh data after mutation
                await tableContext.invalidate();
                setIsOpen(false);
            });
        }
    };

    const confirmAction = () => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    const handleMoveUp = () => {
        if (onMoveUp) {
            startTransition(async () => {
                await onMoveUp();
                setIsOpen(false);
            });
        }
    };

    const handleMoveDown = () => {
        if (onMoveDown) {
            startTransition(async () => {
                await onMoveDown();
                setIsOpen(false);
            });
        }
    };

    // =============================================================
    // Render Action Item
    // =============================================================

    const renderActionItem = (action: IRowAction<TData>, index: number) => {
        const Icon = resolveIcon(action.icon, row);
        const label = resolveLabel(action.label, row);
        const href = resolveHref(action.href, row);
        const isDisabled = action.isDisabled?.(row) || isPending;
        const variant = action.variant ?? 'default';

        const itemContent = (
            <>
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {label}
            </>
        );

        // Navigation action
        if (href) {
            return (
                <DropdownMenuItem key={action.id || index} asChild disabled={isDisabled}>
                    <Link 
                        href={href} 
                        className="flex items-center"
                        onClick={() => setIsOpen(false)}
                    >
                        {itemContent}
                    </Link>
                </DropdownMenuItem>
            );
        }

        // Button action
        return (
            <DropdownMenuItem
                key={action.id || index}
                onClick={() => handleAction(action)}
                disabled={isDisabled}
                className={DROPDOWN_ITEM_STYLES[variant]}
            >
                {itemContent}
            </DropdownMenuItem>
        );
    };

    // =============================================================
    // Confirmation Dialog Content
    // =============================================================

    const getConfirmationContent = () => {
        if (!pendingAction?.confirm) return null;

        const variant = CONFIRMATION_VARIANTS[pendingAction.variant ?? 'default'];
        const ConfirmIcon = variant.icon;

        const title = typeof pendingAction.confirm.title === 'function'
            ? pendingAction.confirm.title(row)
            : pendingAction.confirm.title;

        const message = typeof pendingAction.confirm.message === 'function'
            ? pendingAction.confirm.message(row)
            : pendingAction.confirm.message;

        return (
            <>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            variant.bgClass
                        )}>
                            <ConfirmIcon className={cn('h-5 w-5', variant.iconClass)} />
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>{message}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowConfirmDialog(false)}
                        disabled={isPending}
                    >
                        {pendingAction.confirm.cancelLabel ?? 'Cancel'}
                    </Button>
                    <Button
                        variant={pendingAction.variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={confirmAction}
                        disabled={isPending}
                        className={cn(
                            pendingAction.variant === 'success' && DIALOG_BUTTON_STYLES.success,
                            pendingAction.variant === 'warning' && DIALOG_BUTTON_STYLES.warning
                        )}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            pendingAction.confirm.confirmLabel ?? 'Confirm'
                        )}
                    </Button>
                </DialogFooter>
            </>
        );
    };

    // =============================================================
    // Render
    // =============================================================

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending || isReordering}
                        className={cn(
                            'h-8 w-8 transition-colors',
                            isOpen && 'bg-muted',
                            className
                        )}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Reorder Actions */}
                    {showReorderInMenu && (onMoveUp || onMoveDown) && (
                        <>
                            <DropdownMenuItem
                                onClick={handleMoveUp}
                                disabled={!canMoveUp || isPending || isReordering}
                            >
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleMoveDown}
                                disabled={!canMoveDown || isPending || isReordering}
                            >
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Move Down
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* Regular Actions */}
                    {visibleActions.map((action, index) => (
                        <div key={action.id || index}>
                            {action.dividerBefore && index > 0 && <DropdownMenuSeparator />}
                            {renderActionItem(action, index)}
                            {action.dividerAfter && <DropdownMenuSeparator />}
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    {getConfirmationContent()}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default DataTableActions;
