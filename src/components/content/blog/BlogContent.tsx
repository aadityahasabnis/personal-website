import { ContentBody } from '@/components/content/common/ContentBody';
import { cn } from '@/lib/utils';

interface IBlogContentProps {
    content: string;
    className?: string;
}

export const BlogContent = async ({ content, className }: IBlogContentProps) => {
    return <ContentBody content={content} className={cn('max-w-none px-0', className)} />;
};

export type { IBlogContentProps };
