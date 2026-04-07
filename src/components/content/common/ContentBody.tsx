import { parseMarkdown } from '@/lib/markdown/parse';
import { processHtmlServer } from '@/lib/markdown/processHtmlServer';
import { stampHeadingIds } from '@/lib/markdown/toc';

import 'authorly-editor/styles/renderer.css';

import { cn } from '@/lib/utils';

interface IContentRendererProps {
    html: string;
    className?: string;
}

const ContentRenderer = ({ html, className }: IContentRendererProps) => {
    return <div className={cn('authorly-content cbr-content', className)} dangerouslySetInnerHTML={{ __html: html }} />;
};

interface IContentBodyProps {
    content: string;
    className?: string;
}

const isHtml = (content: string) => content.trimStart().startsWith('<');

export const ContentBody = async ({ content, className }: IContentBodyProps) => {
    const rawHtml = isHtml(content) ? content : await parseMarkdown(content);
    const withHeadingIds = stampHeadingIds(rawHtml);
    const html = processHtmlServer(withHeadingIds);

    return <ContentRenderer html={html} {...(className ? { className } : {})} />;
};

export type { IContentBodyProps };
