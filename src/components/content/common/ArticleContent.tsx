import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, Clock, Tag } from 'lucide-react';
import { ContentBody } from './ContentBody';

interface ArticleContentProps {
    content: string;
    className?: string;
}

export const ArticleContent = async ({ content, className }: ArticleContentProps) => {
    return <ContentBody content={content} className={cn(className)} />;
};

interface ArticleStatsProps {
    publishedAt?: Date;
    readingTime?: number;
    tags?: string[];
    className?: string;
}

export const ArticleStats = ({ publishedAt, readingTime, tags, className }: ArticleStatsProps) => {
    return (
        <div className={cn('flex flex-wrap items-center gap-4 text-sm text-muted-foreground', className)}>
            {publishedAt && (
                <div className='flex items-center gap-1.5'>
                    <Calendar className='h-4 w-4' />
                    <time dateTime={publishedAt.toISOString()}>{format(publishedAt, 'MMM dd, yyyy')}</time>
                </div>
            )}

            {readingTime && (
                <div className='flex items-center gap-1.5'>
                    <Clock className='h-4 w-4' />
                    <span>{readingTime} min read</span>
                </div>
            )}

            {tags && tags.length > 0 && (
                <div className='flex items-center gap-2'>
                    <Tag className='h-4 w-4' />
                    <div className='flex flex-wrap gap-2'>
                        {tags.map((tag) => (
                            <span key={tag} className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
