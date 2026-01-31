import { cn } from '@/lib/utils';

interface IArticleBodyProps {
    html: string;
    className?: string;
}

/**
 * ArticleBody - Server Component for rendering pre-rendered HTML content
 * Uses custom prose styling with CSS variables
 */
const ArticleBody = ({ html, className }: IArticleBodyProps) => (
    <div
        className={cn(
            'prose max-w-none',
            className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

export { ArticleBody };
export type { IArticleBodyProps };
