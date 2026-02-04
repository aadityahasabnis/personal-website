/**
 * ArticleContent Component
 * 
 * Renders article content with proper styling and formatting
 * Supports both markdown and lobe-editor rich content
 * Server-rendered for SEO and performance
 */

import { parseMarkdown } from '@/lib/markdown/parse';
import { cn } from '@/lib/utils';
import '@/app/globals.css';

interface ArticleContentProps {
    content: string;
    className?: string;
}

export const ArticleContent = async ({ content, className }: ArticleContentProps) => {
    // Parse markdown to HTML
    const html = await parseMarkdown(content);

    return (
        <article
            className={cn(
                'prose prose-lg dark:prose-invert max-w-none',
                // Headings
                'prose-headings:font-bold prose-headings:tracking-tight',
                'prose-h1:text-4xl prose-h1:mb-6',
                'prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4',
                'prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3',
                // Links
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                // Code
                'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                'prose-code:before:content-none prose-code:after:content-none',
                // Code blocks
                'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
                'prose-pre:rounded-lg prose-pre:p-4',
                // Blockquotes
                'prose-blockquote:border-l-primary prose-blockquote:bg-muted/50',
                'prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r',
                'prose-blockquote:not-italic',
                // Lists
                'prose-li:marker:text-primary',
                'prose-ul:list-disc prose-ol:list-decimal',
                // Tables
                'prose-table:border prose-table:border-border',
                'prose-th:bg-muted prose-th:font-semibold prose-th:p-3',
                'prose-td:p-3 prose-td:border prose-td:border-border',
                // Images
                'prose-img:rounded-lg prose-img:shadow-md',
                'prose-img:mx-auto prose-img:my-8',
                // Horizontal rules
                'prose-hr:border-border prose-hr:my-8',
                // Strong and emphasis
                'prose-strong:font-bold prose-strong:text-foreground',
                'prose-em:italic',
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
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
