import { Calendar, Clock, FolderOpen, Wrench } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';

interface IProjectMetaProps {
    status?: string | null;
    publishedAt?: string | null;
    updatedAt?: string | null;
    readingTime?: number;
    className?: string;
}

export const ProjectMeta = ({ status, publishedAt, updatedAt, readingTime, className }: IProjectMetaProps) => {
    const showUpdated = Boolean(updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt));

    return (
        <div className={cn('flex flex-wrap items-center gap-3 text-small text-muted-foreground', className)}>
            {status && (
                <span className='flex items-center gap-1.5'>
                    <Wrench className='size-4' aria-hidden='true' />
                    <span>{status}</span>
                </span>
            )}

            {publishedAt && (
                <span className='flex items-center gap-1.5'>
                    <Calendar className='size-4' aria-hidden='true' />
                    <time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
                </span>
            )}

            {typeof readingTime === 'number' && readingTime > 0 && (
                <span className='flex items-center gap-1.5'>
                    <Clock className='size-4' aria-hidden='true' />
                    <span>{`${readingTime} min read`}</span>
                </span>
            )}

            {showUpdated && updatedAt && (
                <span className='flex items-center gap-1.5'>
                    <FolderOpen className='size-4' aria-hidden='true' />
                    <span>{`Updated ${formatDate(updatedAt)}`}</span>
                </span>
            )}
        </div>
    );
};

export type { IProjectMetaProps };
