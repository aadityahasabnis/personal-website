import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface IEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    secondaryAction?: React.ReactNode;
    className?: string;
}

/**
 * EmptyState Component
 * 
 * Beautiful empty state placeholder when no data exists
 * Used across all list pages (articles, topics, projects, etc.)
 * 
 * @example
 * <EmptyState
 *   icon={FileText}
 *   title="No articles yet"
 *   description="Create your first article to get started."
 *   actionLabel="Create Article"
 *   actionHref="/admin/articles/new"
 * />
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    secondaryAction,
    className,
}: IEmptyStateProps): React.ReactElement => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center',
                className
            )}
        >
            {/* Icon */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>

            {/* Actions */}
            {(actionLabel || secondaryAction) && (
                <div className="mt-6 flex items-center gap-3">
                    {actionLabel && actionHref && (
                        <Link href={actionHref}>
                            <Button>
                                <Plus className="h-4 w-4" />
                                {actionLabel}
                            </Button>
                        </Link>
                    )}
                    {secondaryAction}
                </div>
            )}
        </div>
    );
};
