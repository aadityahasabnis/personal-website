import { cn } from '@/lib/utils';

import { BlogMeta } from './BlogMeta';

interface IBlogHeaderProps {
    title: string;
    description: string;
    tags: string[];
    publishedAt?: string | null;
    readingTime?: number;
    updatedAt?: string | null;
    className?: string;
}

export const BlogHeader = ({ title, description, tags, publishedAt, readingTime, updatedAt, className }: IBlogHeaderProps) => {
    return (
        <header className={cn('mb-10', className)}>
            {tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                    {tags.slice(0, 6).map((tag) => (
                        <span key={tag} className='inline-flex items-center px-2.5 py-1 text-label font-medium text-primary bg-primary/10 border border-primary/20 rounded-md'>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <h1 className='text-display font-semibold leading-tight text-foreground'>{title}</h1>
            <p className='mt-4 max-w-3xl text-h4 text-muted-foreground'>{description}</p>
            <BlogMeta className='mt-5' publishedAt={publishedAt} readingTime={readingTime} updatedAt={updatedAt} />
        </header>
    );
};

export type { IBlogHeaderProps };
