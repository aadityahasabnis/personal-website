/**
 * ArticleContent Component
 *
 * Renders article content. Supports two formats:
 *  - HTML (from Authorly Editor): detected by leading `<` character — rendered
 *    directly via AuthorlyRenderer for correct styling of callouts, code, etc.
 *  - Markdown (legacy): parsed to HTML via remark/rehype pipeline first.
 *
 * Server-rendered for SEO and performance.
 */

import { parseMarkdown } from '@/lib/markdown/parse';
import { stampHeadingIds } from '@/lib/markdown/toc';
import { cn } from '@/lib/utils';
import '@/app/globals.css';
import { RichTextRenderer } from '@/components/content/RichTextRenderer';

interface ArticleContentProps {
    content: string;
    className?: string;
}

const isHtml = (content: string) => content.trimStart().startsWith('<');

export const ArticleContent = async ({ content, className }: ArticleContentProps) => {
    // Authorly content is already HTML — skip the markdown pipeline
    const rawHtml = isHtml(content) ? content : await parseMarkdown(content);

    // Stamp heading IDs server-side so they exist in the initial HTML payload.
    // This eliminates the timing race where the TOC observer was set up before
    // AuthorlyRenderer ran client-side and stamped the IDs itself.
    const html = stampHeadingIds(rawHtml);

    return (
        <div className={cn('max-w-none px-6 lg:px-0', className)}>
            <RichTextRenderer html={html} />
        </div>
    );
};

/**
 * TableOfContents Component
 * 
 * Displays an interactive table of contents for article navigation
 */

import { extractHeadings } from '@/lib/markdown/toc';

interface TableOfContentsProps {
    content: string;
    className?: string;
}

export const TableOfContents = ({ content, className }: TableOfContentsProps) => {
    const headings = extractHeadings(content);

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className={cn('space-y-2', className)} aria-label="Table of contents">
            <h3 className="text-sm font-semibold text-foreground mb-3">On this page</h3>
            <ul className="space-y-1.5 text-sm">
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            className={cn(
                                'block py-1 text-muted-foreground hover:text-foreground transition-colors',
                                heading.level === 2 && 'pl-0',
                                heading.level === 3 && 'pl-4',
                                heading.level === 4 && 'pl-8'
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

/**
 * ArticleStats Component
 * 
 * Display article metadata and statistics
 */

import { Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

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
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={publishedAt.toISOString()}>
                        {format(publishedAt, 'MMM dd, yyyy')}
                    </time>
                </div>
            )}

            {readingTime && (
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                </div>
            )}

            {tags && tags.length > 0 && (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
