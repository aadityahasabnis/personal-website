import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IPageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * PageHeader Component
 * 
 * Consistent header for all admin pages with title, description, optional icon, and action buttons
 * 
 * @example
 * <PageHeader
 *   title="Articles"
 *   description="Manage your blog posts and articles"
 *   icon={FileText}
 *   actions={
 *     <Link href="/admin/articles/new">
 *       <Button><Plus /> New Article</Button>
 *     </Link>
 *   }
 * />
 */
export const PageHeader = ({
    title,
    description,
    icon: Icon,
    actions,
    className,
}: IPageHeaderProps): React.ReactElement => {
    return (
        <div className={cn('flex items-center justify-between gap-4', className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                    )}
                </div>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
};
