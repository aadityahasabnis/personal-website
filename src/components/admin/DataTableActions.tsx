'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Copy,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Pause,
    type LucideIcon,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon mapping for serializable icon names from server components
const ICON_MAP: Record<string, LucideIcon> = {
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Copy,
    ExternalLink,
    CheckCircle2,
    Clock,
    Pause,
};

export interface IDataTableAction {
    label: string;
    icon: string; // Icon name as string (e.g., 'Pencil', 'Trash2')
    variant?: 'default' | 'destructive';
    action: 'edit' | 'delete' | 'toggle-published' | 'toggle-featured' | 'duplicate' | 'view' | 'custom';
    href?: string;
    onClick?: () => Promise<void> | void;
    confirmMessage?: string;
    confirmTitle?: string;
}

interface IDataTableActionsProps {
    actions: IDataTableAction[];
    itemName?: string; // For confirmation dialogs (e.g., "this article")
    className?: string;
}

/**
 * DataTableActions Component
 * 
 * Generic dropdown menu for CRUD operations on table rows
 * Supports: Edit, Delete (with confirmation), Toggle Published, Toggle Featured, Duplicate, View, Custom actions
 * 
 * @example
 * <DataTableActions
 *   itemName="article"
 *   actions={[
 *     { label: 'Edit', icon: Pencil, action: 'edit', href: `/admin/articles/${slug}/edit` },
 *     { label: 'Delete', icon: Trash2, action: 'delete', variant: 'destructive', onClick: handleDelete },
 *     { label: 'Publish', icon: Eye, action: 'toggle-published', onClick: handlePublish },
 *   ]}
 * />
 */
export const DataTableActions = ({
    actions,
    itemName = 'item',
    className,
}: IDataTableActionsProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<IDataTableAction | null>(null);

    const handleAction = (action: IDataTableAction): void => {
        // If action requires confirmation, show dialog
        if (action.confirmMessage) {
            setPendingAction(action);
            setShowDeleteDialog(true);
            return;
        }

        // Execute action directly
        executeAction(action);
    };

    const executeAction = (action: IDataTableAction): void => {
        if (action.onClick) {
            startTransition(async () => {
                await action.onClick?.();
                router.refresh();
            });
        }
    };

    const confirmAction = (): void => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
        setShowDeleteDialog(false);
        setPendingAction(null);
    };

    return (
        <>
            {/* Actions Dropdown */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" disabled={isPending} className={cn(className)}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {actions.map((action, index) => {
                        const Icon = ICON_MAP[action.icon] || ExternalLink;

                        // Render as Link for navigation actions
                        if (action.href) {
                            return (
                                <DropdownMenuItem key={index} asChild>
                                    <Link href={action.href} className="flex items-center">
                                        <Icon className="mr-2 h-4 w-4" />
                                        {action.label}
                                    </Link>
                                </DropdownMenuItem>
                            );
                        }

                        // Render as button for actions
                        return (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => handleAction(action)}
                                variant={action.variant}
                                disabled={isPending}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {action.label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle>
                                    {pendingAction?.confirmTitle || 'Are you sure?'}
                                </DialogTitle>
                                <DialogDescription>
                                    {pendingAction?.confirmMessage ||
                                        `This action cannot be undone. This will permanently delete ${itemName}.`}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
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

