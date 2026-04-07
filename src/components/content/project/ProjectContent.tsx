import { ContentBody } from '@/components/content/common/ContentBody';
import { cn } from '@/lib/utils';

interface IProjectContentProps {
    content: string;
    className?: string;
}

export const ProjectContent = async ({ content, className }: IProjectContentProps) => {
    return <ContentBody content={content} className={cn('max-w-none px-0', className)} />;
};

export type { IProjectContentProps };
