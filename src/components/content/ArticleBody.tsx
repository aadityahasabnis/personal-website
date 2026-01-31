import { cn } from '@/lib/utils';

interface IArticleBodyProps {
    html: string;
    className?: string;
}

/**
 * ArticleBody - Server Component for rendering pre-rendered HTML content
 * Uses Tailwind Typography plugin for prose styling
 */
const ArticleBody = ({ html, className }: IArticleBodyProps) => (
    <article
        className={cn(
            // Base prose styles
            'prose prose-lg dark:prose-invert',
            'max-w-none',

            // Headings - add scroll margin for anchor links
            'prose-headings:scroll-mt-20',
            'prose-headings:font-semibold',
            'prose-headings:tracking-tight',

            // Links - primary color with underline on hover
            'prose-a:text-primary',
            'prose-a:no-underline',
            'hover:prose-a:underline',
            'prose-a:font-medium',

            // Code - inline code styling
            'prose-code:rounded',
            'prose-code:bg-muted',
            'prose-code:px-1.5',
            'prose-code:py-0.5',
            'prose-code:font-mono',
            'prose-code:text-sm',
            'prose-code:before:content-none',
            'prose-code:after:content-none',

            // Code blocks
            'prose-pre:bg-muted',
            'prose-pre:border',
            'prose-pre:border-border',
            'prose-pre:rounded-lg',
            'prose-pre:overflow-x-auto',

            // Images
            'prose-img:rounded-lg',
            'prose-img:shadow-md',

            // Blockquotes
            'prose-blockquote:border-l-primary',
            'prose-blockquote:bg-muted/50',
            'prose-blockquote:py-1',
            'prose-blockquote:px-4',
            'prose-blockquote:rounded-r-lg',
            'prose-blockquote:not-italic',

            // Strong
            'prose-strong:text-foreground',
            'prose-strong:font-semibold',

            // Lists
            'prose-li:marker:text-primary',

            // Tables
            'prose-table:overflow-hidden',
            'prose-table:rounded-lg',
            'prose-th:bg-muted',
            'prose-th:px-4',
            'prose-th:py-2',
            'prose-td:px-4',
            'prose-td:py-2',

            // Horizontal rules
            'prose-hr:border-border',

            className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

export { ArticleBody };
export type { IArticleBodyProps };
