'use client';

// =============================================================
// DataTableEmptyState - Professional Empty State Component
// =============================================================

import { FileQuestion } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { IEmptyStateProps } from './types';

// =============================================================
// DataTableEmptyState Component
// =============================================================

export function DataTableEmptyState({
    icon: Icon = FileQuestion,
    title,
    description,
    action,
    className,
}: IEmptyStateProps): React.ReactElement {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center p-12 text-center',
            className
        )}>
            {/* Icon */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-foreground">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            {/* Action Button */}
            {action && (
                <Button onClick={action.onClick} variant="default" size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export default DataTableEmptyState;
