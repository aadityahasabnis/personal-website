import { Calendar, Clock } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';

interface IBlogMetaProps {
    publishedAt?: string | null | undefined;
    readingTime?: number | undefined;
    updatedAt?: string | null | undefined;
    className?: string;
}

export const BlogMeta = ({ publishedAt, readingTime, updatedAt, className }: IBlogMetaProps) => {
    const showUpdated = Boolean(updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt));

    return (
        <div className={cn('flex items-center gap-4 text-small text-muted-foreground', className)}>
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

            {showUpdated && updatedAt && <span className='text-label text-muted-foreground'>{`Updated ${formatDate(updatedAt)}`}</span>}
        </div>
    );
};

export type { IBlogMetaProps };
