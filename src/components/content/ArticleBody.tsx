import { cn } from '@/lib/utils';
import { RichTextRenderer } from './RichTextRenderer';

interface IArticleBodyProps {
    html: string;
    className?: string;
}

/**
 * ArticleBody - Renders pre-rendered HTML content.
 *
 * Uses AuthorlyRenderer for Authorly-authored HTML (gives correct
 * styling for callouts, code blocks, accordions, etc.).
 * Falls back to a plain prose div for legacy content.
 */
const ArticleBody = ({ html, className }: IArticleBodyProps) => (
    <div className={cn('prose max-w-none', className)}>
        <RichTextRenderer html={html} />
    </div>
);

export { ArticleBody };
export type { IArticleBodyProps };
