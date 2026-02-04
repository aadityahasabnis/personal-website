import { Eye, EyeOff, Star, StarOff, CheckCircle2, Clock, XCircle, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'published' | 'draft' | 'archived';
type FeaturedType = 'featured' | 'not-featured';
type ProjectStatusType = 'active' | 'archived' | 'wip';
type SubscriberStatusType = 'confirmed' | 'pending' | 'unsubscribed';

interface IStatusBadgeProps {
    variant?: 'published' | 'featured' | 'status';
    status?: SubscriberStatusType;
    value?: boolean | StatusType | ProjectStatusType;
    className?: string;
}

/**
 * StatusBadge Component
 * 
 * Reusable badge component for displaying different status types across admin panel
 * - Published/Draft status
 * - Featured/Not Featured status
 * - Project status (Active/WIP/Archived)
 * - Subscriber status (Confirmed/Pending/Unsubscribed)
 * 
 * @example
 * <StatusBadge variant="published" value={true} />
 * <StatusBadge variant="published" value={false} />
 * <StatusBadge variant="featured" value={true} />
 * <StatusBadge variant="status" value="active" />
 * <StatusBadge status="confirmed" />
 */
export const StatusBadge = ({ variant, value, status, className }: IStatusBadgeProps): React.ReactElement | null => {
    // Subscriber Status Badge (new)
    if (status) {
        const statusConfig = {
            confirmed: {
                icon: CheckCircle2,
                label: 'Confirmed',
                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            },
            pending: {
                icon: Clock,
                label: 'Pending',
                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            },
            unsubscribed: {
                icon: XCircle,
                label: 'Unsubscribed',
                className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    config.className,
                    className
                )}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    }

    // Published/Draft Badge
    if (variant === 'published') {
        const isPublished = value === true || value === 'published';
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    isPublished
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    className
                )}
            >
                {isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {isPublished ? 'Published' : 'Draft'}
            </span>
        );
    }

    // Featured/Not Featured Badge
    if (variant === 'featured') {
        const isFeatured = value === true;
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    isFeatured
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                        : 'bg-muted text-muted-foreground',
                    className
                )}
            >
                {isFeatured ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
                {isFeatured ? 'Featured' : 'Regular'}
            </span>
        );
    }

    // Project Status Badge
    if (variant === 'status') {
        const projectStatus = value as ProjectStatusType;
        
        const statusConfig = {
            active: {
                icon: CheckCircle2,
                label: 'Active',
                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            },
            wip: {
                icon: Clock,
                label: 'In Progress',
                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            },
            archived: {
                icon: Pause,
                label: 'Archived',
                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
            },
        };

        const config = statusConfig[projectStatus];
        const Icon = config.icon;

        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    config.className,
                    className
                )}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    }

    return null;
};
